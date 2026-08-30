import Link from "next/link";
import { ArrowRight01Icon, CheckmarkCircle01Icon, DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";

export default function QuizSelectPage() {
  return <main className="page"><div className="section-heading"><p className="eyebrow">The practice room</p><h1>Test what stayed with you.</h1><p className="lede">Choose a short assessment. Your answers are checked against the question bank, then reviewed with explanations.</p></div><div className="feature-grid"><article className="feature-card"><span className="icon-wrap"><Icon icon={CheckmarkCircle01Icon} size={22} /></span><h2 style={{ fontSize: "2rem" }}>Multiple choice</h2><p>Ten randomly selected questions about functions, PDUs, protocols, and hardware.</p><Link className="button button-primary" href="/quiz/multiple-choice">Start multiple choice <Icon icon={ArrowRight01Icon} size={17} /></Link></article><article className="feature-card"><span className="icon-wrap"><Icon icon={DragDropVerticalIcon} size={22} /></span><h2 style={{ fontSize: "2rem" }}>Drag and drop</h2><p>Place familiar technologies in their OSI layer and see exactly where your model is strong.</p><Link className="button button-dark" href="/quiz/drag-drop">Start matching <Icon icon={ArrowRight01Icon} size={17} /></Link></article></div></main>;
}
