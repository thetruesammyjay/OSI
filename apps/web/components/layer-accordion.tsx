"use client";

import { useState } from "react";
import { layerContent } from "@/lib/content";

export default function LayerAccordion() {
  const [openLayer, setOpenLayer] = useState<number | null>(7);

  return (
    <section className="layer-list" aria-label="OSI layer reference">
      {layerContent.map((layer) => {
        const isOpen = openLayer === layer.number;

        return (
          <details className="layer-card" key={layer.number} open={isOpen}>
            <summary
              className="layer-summary"
              onClick={(event) => {
                event.preventDefault();
                setOpenLayer(isOpen ? null : layer.number);
              }}
            >
              <span className="layer-number">{layer.number}</span>
              <strong>{layer.name}</strong>
              <span className="layer-pdu">{layer.pdu}</span>
            </summary>
            <div className="layer-body">
              <div>
                <span className="info-label">What it does</span>
                <p>{layer.description}</p>
              </div>
              <div>
                <span className="info-label">Functions</span>
                <div className="info-list">
                  {layer.functions.map((item) => <span className="tag" key={item}>{item}</span>)}
                </div>
              </div>
              <div>
                <span className="info-label">Examples</span>
                <div className="info-list">
                  {[...layer.protocols, ...layer.hardware].map((item) => <span className="tag" key={item}>{item}</span>)}
                </div>
              </div>
            </div>
          </details>
        );
      })}
    </section>
  );
}
