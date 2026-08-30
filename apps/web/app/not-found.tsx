import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page error-page">
      <p className="eyebrow">404 · off the map</p>
      <h1>That layer does not exist.</h1>
      <p className="lede">The page you requested is not part of this OSI journey.</p>
      <Link className="button button-primary" href="/">Return home</Link>
    </main>
  );
}
