import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";

export const metadata: Metadata = {
  title: "Contribute",
};

export default function ContributePage() {
  return (
    <>
      <PageHero
        title="Contribute"
        lead="Support Chetwynd MSA initiatives and member priorities."
      />
      <div className="page-body">
        <div className="container prose">
          <PlaceholderNote>
            Do not invent payment links, dues amounts, or banking details. Add
            real contribution / dues options when ready (as PG MSA does online).
          </PlaceholderNote>
          <div className="card-grid">
            <div className="info-card">
              <h3>[PLACEHOLDER] Member dues</h3>
              <p>
                Information about membership dues and payment options will appear
                here.
              </p>
            </div>
            <div className="info-card">
              <h3>[PLACEHOLDER] Initiatives & fundraising</h3>
              <p>
                Describe priority funds or community initiatives once approved by
                the MSA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
