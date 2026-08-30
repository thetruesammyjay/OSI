import Link from "next/link";
export default function QuizSelectPage() { return <main><h1>Test your knowledge</h1><p>Choose an assessment.</p><p><Link href="/quiz/multiple-choice"><button>Multiple choice</button></Link> <Link href="/quiz/drag-drop"><button>Drag and drop</button></Link></p></main>; }
