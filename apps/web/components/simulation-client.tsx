"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  ComputerIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { api, type LayerInfo } from "@/lib/api";
import { layerContent } from "@/lib/content";

const encapsulationOrder = [7, 6, 5, 4, 3, 2, 1];
const decapsulationOrder = [1, 2, 3, 4, 5, 6, 7];
type Phase = "idle" | "encapsulating" | "transmitting" | "receiving" | "decapsulating" | "complete";
type Snapshot = { phase: Phase; step: number };
type State = Snapshot & { playing: boolean; history: Snapshot[] };
type Action = { type: "PLAY" | "PAUSE" | "STEP_FORWARD" | "STEP_BACKWARD" | "RESET" | "TICK" };

const initial: State = { phase: "idle", step: 0, playing: false, history: [] };
const SimulationScene = dynamic(() => import("@/components/simulation-scene"), {
  ssr: false,
  loading: () => <div className="sim3d-loading-shell">Loading the interactive 3D simulation…</div>,
});

function advance(state: State, playing: boolean): State {
  const nextHistory = [...state.history, { phase: state.phase, step: state.step }];
  if (state.phase === "idle") return { phase: "encapsulating", step: 0, playing, history: nextHistory };
  if (state.phase === "encapsulating" && state.step < encapsulationOrder.length - 1) {
    return { ...state, step: state.step + 1, playing, history: nextHistory };
  }
  if (state.phase === "encapsulating") return { phase: "transmitting", step: 0, playing, history: nextHistory };
  if (state.phase === "transmitting") return { phase: "receiving", step: 0, playing, history: nextHistory };
  if (state.phase === "receiving") return { phase: "decapsulating", step: 0, playing, history: nextHistory };
  if (state.phase === "decapsulating" && state.step < decapsulationOrder.length - 1) {
    return { ...state, step: state.step + 1, playing, history: nextHistory };
  }
  return { phase: "complete", step: decapsulationOrder.length - 1, playing: false, history: nextHistory };
}

function reducer(state: State, action: Action): State {
  if (action.type === "RESET") return initial;
  if (action.type === "PLAY") {
    if (state.phase === "complete") return { ...initial, phase: "encapsulating", playing: true };
    if (state.phase === "idle") return { ...state, phase: "encapsulating", step: 0, playing: true };
    return { ...state, playing: true };
  }
  if (action.type === "PAUSE") return { ...state, playing: false };
  if (action.type === "STEP_BACKWARD") {
    const previous = state.history.at(-1);
    return previous
      ? { ...previous, history: state.history.slice(0, -1), playing: false }
      : { ...state, playing: false };
  }
  if (action.type === "TICK") return state.playing ? advance(state, true) : state;
  if (state.phase === "complete") return state;
  return advance(state, false);
}

function activeLayer(state: State, receiver = false): number | null {
  if (state.phase === "encapsulating") return encapsulationOrder[state.step] ?? null;
  if (state.phase === "decapsulating" && receiver) return decapsulationOrder[state.step] ?? null;
  return null;
}

export default function SimulationClient() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [message, setMessage] = useState("Hello OSI");
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [selected, setSelected] = useState<number | null>(7);
  const [layerDetails, setLayerDetails] = useState<LayerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedFallback = layerContent.find((layer) => layer.number === selected);

  useEffect(() => {
    if (!state.playing) return;
    const timer = window.setTimeout(() => dispatch({ type: "TICK" }), 900);
    return () => window.clearTimeout(timer);
  }, [state.playing, state.phase, state.step]);

  useEffect(() => {
    if (selected === null) return;
    void api
      .layers()
      .then((result) => setLayerDetails(result.data.find((layer) => layer.number === selected) ?? null))
      .catch(() => setLayerDetails(null));
  }, [selected]);

  const status = useMemo(() => {
    if (state.phase === "idle") return "Ready to send";
    if (state.phase === "complete") return "Message recovered at the receiver";
    if (state.phase === "decapsulating" && decapsulationOrder[state.step] === 6) {
      return state.playing
        ? "Decrypting illustrative protected data at Presentation"
        : "Paused at Presentation decryption";
    }
    if (!state.playing) return "Paused for inspection";
    return {
      encapsulating: "Adding context on the sender",
      transmitting: "Crossing the network medium",
      receiving: "Data delivered to the receiver",
      decapsulating: "Removing context at the receiver",
    }[state.phase];
  }, [state.phase, state.playing, state.step]);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    try {
      const result = await api.encapsulate(trimmedMessage);
      setPayload(result.data);
      setSentMessage(trimmedMessage);
      setMessage(trimmedMessage);
      dispatch({ type: "RESET" });
      dispatch({ type: "PLAY" });
    } catch {
      setError("The API could not prepare this message. Check that the FastAPI service is running.");
    }
  }

  const senderActive = activeLayer(state);
  const receiverActive = activeLayer(state, true);
  const envelope = payload?.layers as
    | Array<{ layerNumber: number; layerName: string; dataUnit: string; headers: { protocol: string }; trailer?: unknown }>
    | undefined;
  const activeStepLayer = senderActive ?? receiverActive;
  const activeStepContent = layerContent.find((layer) => layer.number === activeStepLayer);
  const activeEnvelopeLayer = envelope?.find((layer) => layer.layerNumber === activeStepLayer);
  const displayedMessage = sentMessage ?? message.trim();
  const receiverStep = state.phase === "decapsulating";
  const stepHeading = state.phase === "transmitting"
    ? "Network medium"
    : state.phase === "receiving"
      ? "Data arriving at receiver"
    : state.phase === "complete"
      ? "Message delivered to the receiving application"
      : activeStepContent
        ? `${receiverStep ? "Receiver" : "Sender"} · Layer ${activeStepContent.number} · ${activeStepContent.name}${receiverStep && activeStepContent.number === 6 ? " · Decryption" : ""}`
        : "Ready to begin at the sender";
  const stepAction = state.phase === "transmitting"
    ? "The Layer 2 frame has been encoded as bits. Those signals cross the network medium and arrive at the receiver's Physical layer."
    : state.phase === "receiving"
      ? "The packet has reached the receiver's network interface. The receiver's layer-by-layer processing starts next."
    : state.phase === "complete"
      ? "The receiver has removed the simulated layer information and decrypted the illustrative protected data. The original message is now available to the receiving application."
      : activeStepContent
        ? receiverStep ? activeStepContent.receiverAction : activeStepContent.senderAction
        : "Enter a message and select Send message. The journey begins at the sender's Application layer.";
  const stepData = state.phase === "transmitting"
    ? "Bits representing the complete frame are crossing the medium. The frame carries the protected application data and its layer context."
    : state.phase === "receiving"
      ? "The arriving signals have reached the receiver. The received frame is ready for layer processing."
    : state.phase === "complete"
      ? `Recovered original message: “${displayedMessage}”`
      : activeStepContent
        ? receiverStep
          ? activeStepContent.number === 7
            ? `Recovered application data: “${displayedMessage}”`
            : activeStepContent.number === 6
              ? `[Illustrative encrypted content] → decrypted original message: “${displayedMessage}”`
              : activeStepContent.number === 1
                ? "Received signal reconstructed as bits and passed upward as a frame."
                : activeStepContent.number === 2
                  ? "Received frame: the link header and simulated error-checking trailer are being checked and removed."
                  : `Illustrative encrypted application data with the Layer ${activeStepContent.number} information being removed.`
          : activeStepContent.number === 7
            ? `Readable application data: “${displayedMessage}”`
            : activeStepContent.number === 6
              ? `Readable application data: “${displayedMessage}” → [illustrative encrypted content].`
              : activeStepContent.number === 1
                ? "Bits encode the complete frame, including its Data Link error-checking trailer."
                : activeStepContent.number === 2
                  ? "The packet is wrapped in a frame with link addressing and an error-checking trailer."
                  : `Illustrative encrypted application data carried inside the Layer ${activeStepContent.number} ${activeStepContent.pdu.toLowerCase()}.`
        : `Message to send: “${displayedMessage}”`;

  return (
    <section aria-labelledby="simulation-title">
      <div className="sim-head">
        <div className="section-heading">
          <p className="eyebrow">The message lab</p>
          <h1 id="simulation-title">Make the OSI model move.</h1>
          <p className="lede">Enter a message, then watch each layer add and remove its own context across a sender, a medium, and a receiver.</p>
        </div>
        <div className="sim-controls" aria-label="Simulation controls">
          <button className={`icon-button${state.playing ? " active" : ""}`} type="button" onClick={() => dispatch({ type: "PLAY" })} aria-label="Play simulation" aria-pressed={state.playing} disabled={!payload && state.phase === "idle"}>
            <Icon icon={PlayCircleIcon} size={21} />
          </button>
          <button className="icon-button" type="button" onClick={() => dispatch({ type: "PAUSE" })} aria-label="Pause simulation" disabled={!state.playing}>
            <Icon icon={PauseCircleIcon} size={21} />
          </button>
          <button className="icon-button" type="button" onClick={() => dispatch({ type: "STEP_BACKWARD" })} aria-label="Step backward" disabled={state.history.length === 0}>
            <Icon icon={ArrowLeft01Icon} size={19} />
          </button>
          <button className="icon-button" type="button" onClick={() => dispatch({ type: "STEP_FORWARD" })} aria-label="Step forward" disabled={state.phase === "complete" || (!payload && state.phase === "idle")}>
            <Icon icon={ArrowRight01Icon} size={19} />
          </button>
          <button className="icon-button" type="button" onClick={() => dispatch({ type: "RESET" })} aria-label="Reset simulation">
            <Icon icon={Refresh01Icon} size={19} />
          </button>
        </div>
      </div>

      <form className="sim-input" onSubmit={sendMessage}>
        <input aria-label="Message to simulate" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={10000} placeholder="Type a message to send..." />
        <button className="button button-primary" type="submit">Send message</button>
      </form>
      {error ? <p className="form-message error" role="alert">{error}</p> : null}

      <SimulationScene
        phase={state.phase}
        senderLayer={senderActive}
        receiverLayer={receiverActive}
        selectedLayer={selected}
        onSelectLayer={setSelected}
      />

      <div className="sim-board">
        <div className="host-panel">
          <div className="host-title"><span className="host-icon"><Icon icon={ComputerIcon} size={20} /></span><strong>Sender host</strong></div>
          <div className="layer-stack">
            {encapsulationOrder.map((number) => {
              const layer = layerContent.find((item) => item.number === number)!;
              return <button className={`layer-button${senderActive === number ? " selected" : ""}`} type="button" key={number} onClick={() => setSelected(number)}><span>Layer {number} · {layer.name}</span><span>{layer.pdu}</span></button>;
            })}
          </div>
        </div>
        <div className="medium-panel"><div className="medium-orbit"><Icon icon={ArrowRight01Icon} size={25} /></div><strong>Network medium</strong><p>{state.phase === "transmitting" ? "Frame in transit" : "A controlled crossing"}</p><span className="sim-status">{status}</span></div>
        <div className="host-panel">
          <div className="host-title"><span className="host-icon"><Icon icon={ComputerIcon} size={20} /></span><strong>Receiver host</strong></div>
          <div className="layer-stack">
            {decapsulationOrder.map((number) => {
              const layer = layerContent.find((item) => item.number === number)!;
              return <button className={`layer-button${receiverActive === number ? " selected" : ""}`} type="button" key={number} onClick={() => setSelected(number)}><span>Layer {number} · {layer.name}</span><span>{layer.pdu}</span></button>;
            })}
          </div>
        </div>
      </div>

      <section className="sim-step-card" aria-live="polite" aria-atomic="true" aria-label="Current simulation step">
        <div className="sim-step-heading">
          <div>
            <p className="eyebrow">What is happening now</p>
            <h2>{stepHeading}</h2>
          </div>
          {activeStepContent ? <span className="tag">PDU: {activeStepContent.pdu}</span> : null}
        </div>
        <div className="sim-step-grid">
          <div>
            <span className="info-label">Layer activity</span>
            <p>{stepAction}</p>
            {activeEnvelopeLayer && activeStepContent ? <p className="sim-step-meta">Illustrative protocol context: {activeStepContent.protocols[0]}</p> : null}
            {activeStepContent?.number === 2 ? <p className="sim-step-meta">Data Link trailer: {receiverStep ? "The simulated FCS/CRC trailer is checked and removed." : "A simulated FCS/CRC trailer is added to the frame."}</p> : null}
          </div>
          <div>
            <span className="info-label">Data at this step</span>
            <p className="sim-data-preview">{stepData}</p>
          </div>
        </div>
      </section>

      <div className="inspector">
        <div className="section-heading-row"><div className="section-heading"><p className="eyebrow">Layer inspector</p><h3>{layerDetails?.name ?? selectedFallback?.name ?? "Choose a layer"}</h3></div>{selectedFallback ? <span className="tag">Layer {selectedFallback.number} · PDU: {layerDetails?.dataUnit ?? selectedFallback.pdu}</span> : null}</div>
        {selectedFallback ? <div className="inspector-content"><div><span className="info-label">At a glance</span><p>{layerDetails?.description ?? selectedFallback.description}</p></div><div><span className="info-label">Functions</span><div className="info-list">{(layerDetails?.functions ?? selectedFallback.functions).map((item) => <span className="tag" key={item}>{item}</span>)}</div><span className="info-label" style={{ display: "block", marginTop: 16 }}>Protocols & hardware</span><div className="info-list">{[...(layerDetails?.protocols.map((item) => item.name) ?? selectedFallback.protocols), ...(layerDetails?.hardware ?? selectedFallback.hardware)].map((item) => <span className="tag" key={item}>{item}</span>)}</div></div></div> : <p className="inspector-empty">Select a layer to inspect it. Inspection never changes simulation progress.</p>}
      </div>
      {envelope ? <details className="layer-card" style={{ marginTop: 14 }}><summary className="layer-summary"><span className="layer-number"><Icon icon={CheckmarkCircle01Icon} size={20} /></span><strong>Illustrative headers for “{message}”</strong><span className="layer-pdu">{envelope.length} layers</span></summary><div className="layer-body"><div><span className="info-label">Encapsulation</span><p>Each layer contributes a representative protocol header. Data Link also adds a trailer for error detection.</p></div><div><span className="info-label">Current payload</span><p>{state.phase === "complete" ? "Recovered at Layer 7" : "Moving through the stack"}</p></div></div></details> : null}
    </section>
  );
}
