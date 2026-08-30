"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, CheckIcon, Refresh01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { api, type DragDropQuestion, type MCQ } from "@/lib/api";
import { fallbackDragDrop, fallbackQuestions } from "@/lib/content";

type QuizType = "multiple-choice" | "drag-drop";
type AnswerMap = Record<string, unknown>;
type MCQFeedback = { correct: boolean; explanation: string | null };

function mappingMatches(actual: unknown, expected: Record<string, string>): boolean {
  if (!actual || typeof actual !== "object") return false;
  const value = actual as Record<string, unknown>;
  const keys = Object.keys(expected);
  return keys.length === Object.keys(value).length && keys.every((key) => value[key] === expected[key]);
}

function fallbackMcqs(): MCQ[] {
  return fallbackQuestions.map(([question, options, correct_answer, explanation], index) => ({
    id: `fallback-${index}`,
    question: question as string,
    options: options as string[],
    correct_answer: correct_answer as number,
    explanation: explanation as string,
    order_index: index,
  }));
}

export default function QuizClient({ type }: { type: string }) {
  const quizType: QuizType = type === "drag-drop" ? "drag-drop" : "multiple-choice";
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [dragQuestions, setDragQuestions] = useState<DragDropQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [dragMappings, setDragMappings] = useState<Record<string, Record<string, string>>>({});
  const [mcqFeedback, setMcqFeedback] = useState<Record<string, MCQFeedback>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [persistable, setPersistable] = useState(false);
  const [dragFeedback, setDragFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFinished(false);
    setAnswers({});
    setDragMappings({});
    setMcqFeedback({});
    setIndex(0);
    setPersistable(false);
    setDragFeedback(null);
    setError(null);
    const load = async () => {
      try {
        if (quizType === "drag-drop") {
          const data = await api.dragDrop();
          if (active) {
            setDragQuestions(data.length ? data : fallbackDragDrop);
            setPersistable(data.length > 0);
          }
        } else {
          const data = await api.questions();
          if (active) {
            setMcqs([...data].sort(() => Math.random() - 0.5).slice(0, 10));
            setPersistable(data.length > 0);
          }
        }
      } catch {
        if (active) {
          setError("The API is unavailable, so the built-in study set is ready.");
          if (quizType === "drag-drop") setDragQuestions(fallbackDragDrop);
          else setMcqs(fallbackMcqs());
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [quizType]);

  const questions = quizType === "drag-drop" ? dragQuestions : mcqs;
  const current = questions[index];
  const total = questions.length;
  const currentMapping = current && "items" in current ? dragMappings[current.id] ?? {} : {};
  const shuffledItems = useMemo(() => current && "items" in current ? [...current.items].sort(() => Math.random() - 0.5) : [], [current]);
  const dragComplete = current && "items" in current ? current.items.every((item) => currentMapping[item]) : true;
  const localScore = useMemo(() => {
    if (quizType === "multiple-choice") return mcqs.reduce((count, question) => count + (answers[question.id] === question.correct_answer ? 1 : 0), 0);
    return dragQuestions.reduce((count, question) => count + (mappingMatches(answers[question.id], question.correct_mappings) ? 1 : 0), 0);
  }, [answers, dragQuestions, mcqs, quizType]);

  async function finish() {
    setFinished(true);
    try {
      if (persistable && Object.keys(answers).length) {
        await api.submitAttempt(answers);
        setSaved(true);
      }
    } catch { setSaved(false); }
  }

  function next() {
    if (index >= total - 1) void finish();
    else setIndex((value) => value + 1);
    setActiveItem(null);
    setDragFeedback(null);
  }

  function previous() {
    setIndex((value) => Math.max(0, value - 1));
    setActiveItem(null);
    setDragFeedback(null);
  }

  function choose(value: number) {
    if (!current || quizType !== "multiple-choice" || !("options" in current)) return;
    setAnswers((old) => ({ ...old, [current.id]: value }));
    setMcqFeedback((old) => ({ ...old, [current.id]: { correct: value === current.correct_answer, explanation: current.explanation ?? null } }));
  }

  function assign(category: string, item = activeItem) {
    if (!item || !current || quizType !== "drag-drop" || !("correct_mappings" in current)) return;
    if (current.correct_mappings[item] !== category) {
      setDragFeedback("Not quite. That technology returns to the source — try another layer.");
      return;
    }
    const nextMapping = { ...currentMapping, [item]: category };
    setDragMappings((old) => ({ ...old, [current.id]: nextMapping }));
    setAnswers((old) => ({ ...old, [current.id]: nextMapping }));
    setActiveItem(null);
    setDragFeedback("Correct placement. Keep going.");
  }

  function reset() {
    setAnswers({});
    setDragMappings({});
    setMcqFeedback({});
    setIndex(0);
    setFinished(false);
    setSaved(false);
    setActiveItem(null);
    setDragFeedback(null);
  }

  if (loading) return <section className="page"><p className="eyebrow">Preparing your assessment</p><h1>Loading the study set…</h1></section>;
  if (!total) return <section className="page"><div className="section-heading"><p className="eyebrow">No questions yet</p><h1>This quiz is waiting for content.</h1><p className="lede">Run the API seed command or return to the quiz menu.</p></div></section>;
  if (finished) return <section className="quiz-main"><div className="result-card"><p className="eyebrow" style={{ color: "#ffe228" }}>Assessment complete</p><div className="result-score"><strong>{localScore}</strong><span>out of {total} correct</span></div><p style={{ color: "#d4d0e4", marginTop: 8 }}>{saved ? "Your result was saved securely." : "Your result is ready. It could not be saved, but your review is still here."}</p></div><div className="result-review">{questions.map((question) => { const answer = answers[question.id]; const correct = quizType === "drag-drop" ? mappingMatches(answer, (question as DragDropQuestion).correct_mappings) : answer === (question as MCQ).correct_answer; const explanation = "options" in question ? `${correct ? "Correct." : `Correct answer: ${question.options[question.correct_answer]}.`} ${question.explanation ?? "Review this layer in Learn."}` : `${correct ? "Correct placement." : "Review the layer mapping."} ${(question as DragDropQuestion).explanation ?? "Review this layer in Learn."}`; return <div className="review-row" key={question.id}><p><strong>{correct ? "Correct" : "Review"}</strong> · {"question" in question ? question.question : question.title}</p><small>{explanation}</small></div>; })}</div><p style={{ marginTop: 24 }}><button className="button button-primary" type="button" onClick={reset}><Icon icon={Refresh01Icon} size={17} /> Try again</button></p></section>;

  const feedback = current && quizType === "multiple-choice" ? mcqFeedback[current.id] : null;
  const advanceDisabled = quizType === "drag-drop" && !dragComplete;
  return <section className="quiz-shell"><aside className="quiz-sidebar"><p className="eyebrow">{quizType === "drag-drop" ? "Matching lab" : "Knowledge check"}</p><h3>{quizType === "drag-drop" ? "Place the technologies" : "Choose the best answer"}</h3><p className="muted" style={{ fontSize: ".82rem" }}>{total} question{total === 1 ? "" : "s"} · answers are scored by the API</p><div className="quiz-nav" style={{ marginTop: 18 }}>{questions.map((question, questionIndex) => <button className={questionIndex === index ? "active" : ""} type="button" key={question.id} onClick={() => { setIndex(questionIndex); setActiveItem(null); setDragFeedback(null); }}>Question {questionIndex + 1}{answers[question.id] !== undefined ? <Icon icon={CheckIcon} size={14} /> : null}</button>)}</div></aside><div className="quiz-main"><p className="eyebrow">Question {index + 1} of {total}</p><div className="quiz-progress"><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>{error ? <p className="form-message success" role="status">{error}</p> : null}{feedback ? <p className={`form-message ${feedback.correct ? "success" : "error"}`} role="status">{feedback.correct ? "Correct." : "Not quite."} {feedback.explanation ?? "Review the layer reference and try another answer."}</p> : null}{quizType === "drag-drop" && dragFeedback ? <p className={`form-message ${dragFeedback.startsWith("Correct") ? "success" : "error"}`} role="status">{dragFeedback}</p> : null}{quizType === "multiple-choice" && current && "options" in current ? <><h2 style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)" }}>{current.question}</h2><div className="answer-grid">{current.options.map((option, optionIndex) => <button className={`answer-option${answers[current.id] === optionIndex ? " selected" : ""}`} type="button" key={option} onClick={() => choose(optionIndex)}><span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div></> : current && "items" in current ? <><h2 style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)" }}>{current.title}</h2><p className="muted">{current.description}</p><p className="field-help" style={{ marginTop: 10 }}>Drag an item to a layer, or select it and press a layer.</p><div className="drag-options">{shuffledItems.filter((item) => !currentMapping[item]).map((item) => <button className={`drag-chip${activeItem === item ? " selected" : ""}`} draggable type="button" key={item} onClick={() => { setActiveItem(item); setDragFeedback(null); }} onDragStart={(event) => { event.dataTransfer.setData("text/plain", item); event.dataTransfer.effectAllowed = "move"; setActiveItem(item); setDragFeedback(null); }} aria-pressed={activeItem === item}>{item}</button>)}</div><div className="drop-grid">{current.categories.map((category) => <button className="drop-zone" type="button" key={category} onClick={() => assign(category)} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => { event.preventDefault(); assign(category, event.dataTransfer.getData("text/plain") || activeItem); }}><h4>{category}</h4><p>{Object.entries(currentMapping).filter(([, value]) => value === category).map(([item]) => item).join(", ") || "Drop an item here"}</p></button>)}</div></> : null}<div className="quiz-actions" style={{ marginTop: 32 }}><button className="button button-ghost" type="button" onClick={previous} disabled={index === 0}><Icon icon={ArrowLeft01Icon} size={17} /> Back</button><button className="button button-dark" type="button" onClick={next} disabled={advanceDisabled}>{index === total - 1 ? "Finish assessment" : "Next question"} <Icon icon={ArrowRight01Icon} size={17} /></button></div></div></section>;
}
