import "./globals.css";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Home01Icon, BookOpen01Icon, Message01Icon } from "@hugeicons/core-free-icons";

export const metadata = { title: "OSI Model Learning Platform", description: "Interactive OSI model simulation and learning tool" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><nav><strong>OSI Learning</strong><Link href="/simulation"><Icon icon={Home01Icon} size={16} /> Simulation</Link><Link href="/learn"><Icon icon={BookOpen01Icon} size={16} /> Learn</Link><Link href="/quiz/select">Quiz</Link><Link href="/about">About</Link><Link href="/feedback"><Icon icon={Message01Icon} size={16} /> Feedback</Link><Link href="/admin">Admin</Link></nav>{children}</body></html>;
}
