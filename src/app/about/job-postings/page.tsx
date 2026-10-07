import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";

export const metadata: Metadata = {
  title: "Job Postings",
};

export default function JobPostingsPage() {
  return (
    <>
      <PageHero
        title="Job Postings"
        lead="Opportunities related to Chetwynd MSA and medical staff engagement."
      />
      <div className="page-body">
        <div className="container prose">
          <PlaceholderNote>
            No live postings yet. Add real roles, closing dates, and application
            instructions when available.
          </PlaceholderNote>
          <div className="info-card">
            <h3>[PLACEHOLDER] No current postings</h3>
            <p>
              Check back later, or contact the MSA using the details on the{" "}
              Contact page when real contact information is published.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
