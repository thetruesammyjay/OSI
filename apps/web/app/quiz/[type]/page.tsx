import QuizClient from "@/components/quiz-client";
import { notFound } from "next/navigation";

const supportedTypes = new Set(["multiple-choice", "drag-drop"]);

export default async function QuizTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!supportedTypes.has(type)) notFound();

  return (
    <main className="page page-tight">
      <QuizClient type={type} />
    </main>
  );
}
