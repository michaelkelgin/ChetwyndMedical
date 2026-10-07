import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";

export const metadata: Metadata = {
  title: "Our Roles",
};

export default function RolesPage() {
  return (
    <>
      <PageHero
        title="Our Roles"
        lead="How Chetwynd MSA leadership supports physicians and facility partnership."
      />
      <div className="page-body">
        <div className="container prose">
          <PlaceholderNote>
            Replace with Chetwynd MSA role descriptions, terms of reference, or
            bylaws excerpts as approved.
          </PlaceholderNote>
          <div className="card-grid">
            <div className="info-card">
              <h3>Representation</h3>
              <p>
                [PLACEHOLDER] Represent physician perspectives to Health Authority
                leaders on issues that affect medical staff and patient care.
              </p>
            </div>
            <div className="info-card">
              <h3>Engagement</h3>
              <p>
                [PLACEHOLDER] Create forums, working groups, and events that help
                medical staff connect, prioritize, and act together.
              </p>
            </div>
            <div className="info-card">
              <h3>Partnership</h3>
              <p>
                [PLACEHOLDER] Build constructive relationships with administration
                so plans and initiatives reflect frontline clinical reality.
              </p>
            </div>
            <div className="info-card">
              <h3>Support</h3>
              <p>
                [PLACEHOLDER] Point members to wellness, peer support, and
                professional resources available locally and regionally.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
