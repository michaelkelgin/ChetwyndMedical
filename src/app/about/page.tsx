import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";

export const metadata: Metadata = {
  title: "About Us",
};

const links = [
  {
    href: "/about/purpose",
    title: "Our Purpose",
    body: "Why the MSA exists and how it represents facility-based physicians.",
  },
  {
    href: "/about/team",
    title: "Our Team",
    body: "Executive, board, and staff contacts for Chetwynd MSA.",
  },
  {
    href: "/about/roles",
    title: "Our Roles",
    body: "How MSA leadership supports engagement and facility partnership.",
  },
  {
    href: "/about/job-postings",
    title: "Job Postings",
    body: "Open roles and opportunities related to medical staff engagement.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Us"
        lead="Learn about the Chetwynd Medical Staff Association — structure, purpose, and people."
      />
      <div className="page-body">
        <div className="container prose">
          <PlaceholderNote>
            Overview copy adapted from the PG MSA model. Replace with
            Chetwynd-specific wording, facility names, and approved messaging.
          </PlaceholderNote>
          <p>
            The Chetwynd Medical Staff Association (MSA) is the primary
            representative structure for facility-based physicians in Chetwynd.
            Parallel to regional MSA peers, it strengthens engagement between
            medical staff and Health Authority leadership so physician views are
            heard, priorities are addressed, and patient care is supported.
          </p>
          <div className="card-grid">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="info-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
