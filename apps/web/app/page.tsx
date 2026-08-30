import Link from "next/link";

export default function HomePage() {
  return <main><p className="muted">Interactive networking education</p><h1>Watch your message travel through every OSI layer.</h1><p className="muted">Explore encapsulation, de-encapsulation, layer responsibilities, and self-assessment in a focused browser tool.</p><p><Link href="/simulation"><button>Start simulation</button></Link> <Link href="/learn"><button>Explore Learn</button></Link></p></main>;
}
