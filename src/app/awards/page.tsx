import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";

export const metadata: Metadata = {
  title: "Awards",
};

export default function AwardsPage() {
  return (
    <>
      <PageHero
        title="Awards"
        lead="Recognizing excellence and service in the Chetwynd medical community."
      />
      <div className="page-body">
        <div className="container prose">
          <PlaceholderNote>
            List real award programs, criteria, and past recipients when
            available. Do not invent recipients or credentials.
          </PlaceholderNote>
          <div className="card-grid">
            <div className="info-card">
              <h3>[PLACEHOLDER] Physician Recognition Award</h3>
              <p>
                Criteria, nomination process, and recent recipients to be added.
              </p>
            </div>
            <div className="info-card">
              <h3>[PLACEHOLDER] Community Service Award</h3>
              <p>
                Criteria, nomination process, and recent recipients to be added.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
