import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";

export const metadata: Metadata = {
  title: "Our Team",
};

const roles = [
  "President",
  "Vice President",
  "Secretary / Treasurer",
  "Facility Engagement Lead",
  "MSA Coordinator / Admin [PLACEHOLDER]",
];

export default function TeamPage() {
  return (
    <>
      <PageHero
        title="Our Team"
        lead="Leadership and support for Chetwynd medical staff engagement."
      />
      <div className="page-body">
        <div className="container prose">
          <PlaceholderNote>
            Do not invent names, credentials, or photos. Supply real executive /
            board roster, titles, and optional headshots.
          </PlaceholderNote>
          <div className="card-grid">
            {roles.map((role) => (
              <div className="info-card" key={role}>
                <h3>{role}</h3>
                <p>
                  <strong>[PLACEHOLDER: Name]</strong>
                </p>
                <p className="muted small">
                  [PLACEHOLDER: short bio or contact — no invented credentials]
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
