import QuizClient from "@/components/quiz-client";
export default async function QuizTypePage({ params }: { params: Promise<{ type: string }> }) { const { type } = await params; return <main><QuizClient type={type} /></main>; }
