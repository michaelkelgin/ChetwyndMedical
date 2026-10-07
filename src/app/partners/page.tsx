import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";

export const metadata: Metadata = {
  title: "Partners",
};

const partners = [
  "Northern Health [PLACEHOLDER — confirm partnership wording]",
  "Facility Engagement / SSC [PLACEHOLDER]",
  "Regional MSA network [PLACEHOLDER]",
  "Local community partners [PLACEHOLDER]",
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        title="Partners"
        lead="Organizations we work with to strengthen medical staff engagement."
      />
      <div className="page-body">
        <div className="container prose">
          <PlaceholderNote>
            Confirm partner names, logos, and link permissions before publishing.
          </PlaceholderNote>
          <div className="card-grid">
            {partners.map((name) => (
              <div className="info-card" key={name}>
                <h3>{name}</h3>
                <p className="muted small">
                  [PLACEHOLDER] Short description and optional logo / URL.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
