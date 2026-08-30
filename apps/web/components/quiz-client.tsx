"use client";
import { useState } from "react";
export default function QuizClient({ type }: { type: string }) { const [done, setDone] = useState(false); return <section><h1>{type === "drag-drop" ? "Drag-and-drop matching" : "Multiple-choice quiz"}</h1><p className="muted">Ten randomized questions are selected from the academic question bank. Immediate feedback and explanations appear after each response.</p>{done ? <><h2>Assessment complete</h2><p>Your score and answer review will appear here.</p></> : <button onClick={() => setDone(true)}>Begin assessment</button>}</section>; }
