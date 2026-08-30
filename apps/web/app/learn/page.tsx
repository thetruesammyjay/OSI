import Link from "next/link";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { layerContent } from "@/lib/content";

export default function LearnPage() {
  return (
    <main className="page page-tight">
      <section className="section-heading" aria-labelledby="learn-title"><p className="eyebrow">The reference desk</p><h1 id="learn-title">Seven layers, one readable story.</h1><p className="lede">Open any layer for the job it performs, the PDU it carries, and the technologies you will meet in a real network.</p></section>
      <section className="layer-list" aria-label="OSI layer reference">
        {layerContent.map((layer) => <details className="layer-card" key={layer.number} open={layer.number === 7}>
          <summary className="layer-summary"><span className="layer-number">{layer.number}</span><strong>{layer.name}</strong><span className="layer-pdu">{layer.pdu}</span></summary>
          <div className="layer-body"><div><span className="info-label">What it does</span><p>{layer.description}</p></div><div><span className="info-label">Functions</span><div className="info-list">{layer.functions.map((item) => <span className="tag" key={item}>{item}</span>)}</div></div><div><span className="info-label">Examples</span><div className="info-list">{[...layer.protocols, ...layer.hardware].map((item) => <span className="tag" key={item}>{item}</span>)}</div></div></div>
        </details>)}
      </section>
      <div className="quote"><p>Start with the data. Each step adds context until the message can travel. At the other end, those additions come away in reverse.</p><small>That reversible movement is encapsulation and de-encapsulation.</small></div>
      <p style={{ marginTop: 28 }}><Link className="button button-dark" href="/simulation">See it in motion <Icon icon={ArrowRight01Icon} size={17} /></Link></p>
    </main>
  );
}
