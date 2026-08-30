import Link from "next/link";
import { ArrowRight01Icon, BookOpen01Icon, Layers01Icon, Quiz01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";

const layerLabels = ["Application", "Presentation", "Session", "Transport", "Network", "Data Link", "Physical"];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Interactive networking education</p>
          <h1 id="hero-title">See a message become a network.</h1>
          <p className="lede">Trace one piece of data through all seven OSI layers. Move at your own pace, inspect what each layer does, then check what you know.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/simulation">Start the simulation <Icon icon={ArrowRight01Icon} size={18} /></Link>
            <Link className="button button-dark" href="/learn">Read the layers</Link>
          </div>
          <p className="hero-note"><span aria-hidden="true" /> Built for focused study, not packet capture</p>
        </div>
        <div className="hero-visual" aria-label="Preview of the sender, network medium, and receiver simulation">
          <div className="blob blob-green" aria-hidden="true" /><div className="blob blob-pink" aria-hidden="true" /><div className="blob blob-yellow" aria-hidden="true" />
          <div className="product-card">
            <div className="product-top"><span className="product-label">OSI journey / live view</span><span className="status-dot">Ready to explore</span></div>
            <div className="mock-route"><div className="mock-node"><strong>Sender</strong><span>Host A</span></div><div className="mock-line"><span>encapsulate</span></div><div className="mock-node"><strong>Receiver</strong><span>Host B</span></div></div>
            <div className="mock-layers">{layerLabels.map((label, index) => <div className="mock-layer" key={label}><b>{7 - index}</b>{label}</div>)}</div>
          </div>
        </div>
      </section>

      <section className="trust-band" aria-label="Learning outcomes">
        <div className="trust-inner"><span className="trust-item">7 layers <small>one complete model</small></span><span className="trust-item">1 message <small>follow every step</small></span><span className="trust-item">10 questions <small>test your understanding</small></span><span className="trust-item">0 setup <small>open in your browser</small></span></div>
      </section>

      <section className="page page-tight" aria-labelledby="path-title">
        <div className="section-heading"><p className="eyebrow">A guided path</p><h2 id="path-title">Learn by watching the layers work.</h2><p className="lede">The platform keeps the abstraction visible: a clear path from application data to bits, and back again.</p></div>
        <div className="feature-grid">
          <article className="feature-card"><span className="icon-wrap"><Icon icon={Layers01Icon} size={22} /></span><h3>Simulate the journey</h3><p>Play, pause, step forward, step backward, or reset an illustrative sender-to-receiver exchange.</p><Link className="nav-link" href="/simulation">Open simulation <Icon icon={ArrowRight01Icon} size={15} /></Link></article>
          <article className="feature-card"><span className="icon-wrap"><Icon icon={BookOpen01Icon} size={22} /></span><h3>Understand each layer</h3><p>Use the independent Learn reference for functions, protocols, hardware, and PDU names.</p><Link className="nav-link" href="/learn">Explore Learn <Icon icon={ArrowRight01Icon} size={15} /></Link></article>
          <article className="feature-card"><span className="icon-wrap"><Icon icon={Quiz01Icon} size={22} /></span><h3>Check your progress</h3><p>Work through multiple-choice or drag-and-drop assessments with feedback and explanations.</p><Link className="nav-link" href="/quiz/select">Choose a quiz <Icon icon={ArrowRight01Icon} size={15} /></Link></article>
        </div>
      </section>

      <section className="quote" aria-label="Project scope"><p>“A diagram you can operate is easier to remember than a diagram you only read.”</p><small>Designed for introductory networking students · Federal University of Technology, Owerri</small></section>
    </main>
  );
}
