"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle01Icon, ComputerIcon, PauseCircleIcon, PlayCircleIcon, Refresh01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { api, type LayerInfo } from "@/lib/api";
import { layerContent } from "@/lib/content";

const order = [7, 6, 5, 4, 3, 2, 1];
type Phase = "idle" | "encapsulating" | "transmitting" | "decapsulating" | "complete" | "paused";
type State = { phase: Phase; step: number; history: { phase: Phase; step: number }[] };
const initial: State = { phase: "idle", step: 0, history: [] };

function reducer(state: State, action: { type: "PLAY" | "PAUSE" | "STEP_FORWARD" | "STEP_BACKWARD" | "RESET" }): State {
  if (action.type === "RESET") return initial;
  if (action.type === "PLAY") return state.phase === "complete" ? initial : { ...state, phase: state.phase === "idle" ? "encapsulating" : state.phase === "paused" ? "encapsulating" : state.phase };
  if (action.type === "PAUSE") return { ...state, phase: state.phase === "idle" ? "idle" : state.phase === "complete" ? "complete" : "paused" };
  if (action.type === "STEP_BACKWARD") {
    const previous = state.history.at(-1);
    return previous ? { ...previous, history: state.history.slice(0, -1), phase: "paused" } : state;
  }
  if (state.phase === "complete") return state;
  const nextHistory = [...state.history, { phase: state.phase, step: state.step }];
  if (state.phase === "idle" || state.phase === "paused") return { phase: "encapsulating", step: 0, history: nextHistory };
  if (state.phase === "encapsulating" && state.step < order.length - 1) return { ...state, step: state.step + 1, phase: "paused", history: nextHistory };
  if (state.phase === "encapsulating") return { phase: "transmitting", step: 0, history: nextHistory };
  if (state.phase === "transmitting") return { phase: "decapsulating", step: 0, history: nextHistory };
  if (state.phase === "decapsulating" && state.step < order.length - 1) return { ...state, step: state.step + 1, phase: "paused", history: nextHistory };
  return { phase: "complete", step: order.length - 1, history: nextHistory };
}

function activeLayer(state: State, receiver = false): number | null {
  if (state.phase === "encapsulating") return order[state.step] ?? null;
  if (state.phase === "decapsulating") return receiver ? order[state.step] ?? null : null;
  return null;
}

export default function SimulationClient() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [message, setMessage] = useState("Hello OSI");
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [selected, setSelected] = useState<number | null>(7);
  const [layerDetails, setLayerDetails] = useState<LayerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedFallback = layerContent.find((layer) => layer.number === selected);

  useEffect(() => {
    if (state.phase !== "encapsulating" && state.phase !== "transmitting" && state.phase !== "decapsulating") return;
    const timer = window.setTimeout(() => dispatch({ type: "STEP_FORWARD" }), 900);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.step]);

  useEffect(() => {
    if (selected === null) return;
    void api.layers().then((result) => setLayerDetails(result.data.find((layer) => layer.number === selected) ?? null)).catch(() => setLayerDetails(null));
  }, [selected]);

  const status = useMemo(() => ({ idle: "Ready to send", paused: "Paused for inspection", encapsulating: "Adding context on the sender", transmitting: "Crossing the network medium", decapsulating: "Removing context at the receiver", complete: "Message recovered at the receiver" }[state.phase]), [state.phase]);
  async function sendMessage(event: React.FormEvent) {
    event.preventDefault(); setError(null);
    if (!message.trim()) return;
    try { const result = await api.encapsulate(message.trim()); setPayload(result.data); dispatch({ type: "RESET" }); dispatch({ type: "PLAY" }); } catch { setError("The API could not prepare this message. Check that the FastAPI service is running."); }
  }
  const senderActive = activeLayer(state);
  const receiverActive = activeLayer(state, true);
  const envelope = payload?.layers as Array<{ layerNumber: number; layerName: string; dataUnit: string; headers: { protocol: string }; trailer?: unknown }> | undefined;

  return <section aria-labelledby="simulation-title">
    <div className="sim-head"><div className="section-heading"><p className="eyebrow">The message lab</p><h1 id="simulation-title">Make the OSI model move.</h1><p className="lede">Enter a message, then watch each layer add and remove its own context across a sender, a medium, and a receiver.</p></div><div className="sim-controls" aria-label="Simulation controls"><button className="icon-button" type="button" onClick={() => dispatch({ type: "PLAY" })} aria-label="Play simulation"><Icon icon={PlayCircleIcon} size={21} /></button><button className="icon-button" type="button" onClick={() => dispatch({ type: "PAUSE" })} aria-label="Pause simulation"><Icon icon={PauseCircleIcon} size={21} /></button><button className="icon-button" type="button" onClick={() => dispatch({ type: "STEP_BACKWARD" })} aria-label="Step backward"><Icon icon={ArrowLeft01Icon} size={19} /></button><button className="icon-button" type="button" onClick={() => dispatch({ type: "STEP_FORWARD" })} aria-label="Step forward"><Icon icon={ArrowRight01Icon} size={19} /></button><button className="icon-button" type="button" onClick={() => dispatch({ type: "RESET" })} aria-label="Reset simulation"><Icon icon={Refresh01Icon} size={19} /></button></div></div>
    <form className="sim-input" onSubmit={sendMessage}><input aria-label="Message to simulate" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={10000} placeholder="Type a message to send..." /><button className="button button-primary" type="submit">Send message</button></form>
    {error ? <p className="form-message error" role="alert">{error}</p> : null}
    <div className="sim-board" aria-live="polite"><div className="host-panel"><div className="host-title"><span className="host-icon"><Icon icon={ComputerIcon} size={20} /></span><strong>Sender host</strong></div><div className="layer-stack">{order.map((number) => { const layer = layerContent.find((item) => item.number === number)!; return <button className={`layer-button${senderActive === number || selected === number ? " selected" : ""}`} type="button" key={number} onClick={() => setSelected(number)}><span>Layer {number} · {layer.name}</span><span>{layer.pdu}</span></button>; })}</div></div><div className="medium-panel"><div className="medium-orbit"><Icon icon={ArrowRight01Icon} size={25} /></div><strong>Network medium</strong><p>{state.phase === "transmitting" ? "Frame in transit" : "A controlled crossing"}</p><span className="sim-status">{status}</span></div><div className="host-panel"><div className="host-title"><span className="host-icon"><Icon icon={ComputerIcon} size={20} /></span><strong>Receiver host</strong></div><div className="layer-stack">{order.map((number) => { const layer = layerContent.find((item) => item.number === number)!; return <button className={`layer-button${receiverActive === number ? " selected" : ""}`} type="button" key={number} onClick={() => setSelected(number)}><span>Layer {number} · {layer.name}</span><span>{layer.pdu}</span></button>; })}</div></div></div>
    <div className="inspector"><div className="section-heading-row"><div className="section-heading"><p className="eyebrow">Layer inspector</p><h3>{layerDetails?.name ?? selectedFallback?.name ?? "Choose a layer"}</h3></div>{selectedFallback ? <span className="tag">PDU: {layerDetails?.dataUnit ?? selectedFallback.pdu}</span> : null}</div>{selectedFallback ? <div className="inspector-content"><div><span className="info-label">At a glance</span><p>{layerDetails?.description ?? selectedFallback.description}</p></div><div><span className="info-label">Functions</span><div className="info-list">{(layerDetails?.functions ?? selectedFallback.functions).map((item) => <span className="tag" key={item}>{item}</span>)}</div><span className="info-label" style={{ display: "block", marginTop: 16 }}>Protocols & hardware</span><div className="info-list">{[...(layerDetails?.protocols.map((item) => item.name) ?? selectedFallback.protocols), ...(layerDetails?.hardware ?? selectedFallback.hardware)].map((item) => <span className="tag" key={item}>{item}</span>)}</div></div></div> : <p className="inspector-empty">Select a layer to inspect it. Inspection never changes simulation progress.</p>}</div>
    {envelope ? <details className="layer-card" style={{ marginTop: 14 }}><summary className="layer-summary"><span className="layer-number"><Icon icon={CheckmarkCircle01Icon} size={20} /></span><strong>Illustrative headers for “{message}”</strong><span className="layer-pdu">{envelope.length} layers</span></summary><div className="layer-body"><div><span className="info-label">Encapsulation</span><p>Each layer contributes a representative protocol header. Data Link also adds a trailer for error detection.</p></div><div><span className="info-label">Current payload</span><p>{state.phase === "complete" ? "Recovered at Layer 7" : "Moving through the stack"}</p></div></div></details> : null}
  </section>;
}
