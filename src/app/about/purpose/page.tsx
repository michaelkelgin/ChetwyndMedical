import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";

export const metadata: Metadata = {
  title: "Our Purpose",
};

export default function PurposePage() {
  return (
    <>
      <PageHero
        title="Our Purpose"
        lead="The MSA is the primary representative structure for facility-based physicians."
      />
      <div className="page-body">
        <div className="container prose">
          <PlaceholderNote>
            Purpose text mirrors the provincial MSA / MOU framing used by PG MSA.
            Confirm facility name(s), membership definition, and any Chetwynd-specific
            wording before publishing.
          </PlaceholderNote>
          <p>
            The Chetwynd Medical Staff Association consists of members with
            privileges at [PLACEHOLDER: local facility / hospital name] in
            Chetwynd, British Columbia.
          </p>
          <p>
            According to the Memorandum of Understanding (MOU) for Regional and
            Local Engagement, the Medical Staff Association (MSA) is the primary
            representative structure for facility-based physicians:
          </p>
          <blockquote>
            With respect to physicians who have privileges to practice in Health
            Authority facilities and programs, the Hospital Act, Hospital Act
            Regulation, and respective Health Authority medical staff rules set
            out the framework for the governance of medical staff and the
            relationship between Health Authorities and physicians.
          </blockquote>
          <p>Within this framework, MSAs help ensure that medical staff:</p>
          <ul>
            <li>Views are more effectively represented;</li>
            <li>
              Contribute to the development and achievement of Health Authority
              plans and initiatives affecting physicians;
            </li>
            <li>
              Prioritize issues significantly affecting physicians and patient
              care; and
            </li>
            <li>
              Have meaningful interactions with Health Authority leaders,
              including physicians in formal medical leadership roles.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
