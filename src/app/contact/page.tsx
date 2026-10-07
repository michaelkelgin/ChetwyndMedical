import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        lead="Reach the Chetwynd Medical Staff Association."
      />
      <div className="page-body">
        <div className="container contact-grid">
          <div className="prose">
            <PlaceholderNote>
              No real phone numbers, emails, or mailing addresses invented.
              Supply verified contact details before launch.
            </PlaceholderNote>
            <h2>Contact Chetwynd MSA</h2>
            <p>
              <strong>Email</strong>
              <br />
              {site.placeholderEmail}
            </p>
            <p>
              <strong>Mailing address</strong>
              <br />
              {site.placeholderMailing}
            </p>
          </div>

          <form className="contact-form" action="#" method="post">
            <PlaceholderNote>
              Form is UI-only for now — wire to email / form backend later.
            </PlaceholderNote>
            <label>
              Name *
              <input name="name" type="text" required placeholder="Your name" />
            </label>
            <label>
              Email *
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </label>
            <label>
              Subject
              <input name="subject" type="text" placeholder="How can we help?" />
            </label>
            <label>
              Message *
              <textarea
                name="message"
                rows={6}
                required
                placeholder="Your message"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled>
              Send message (not connected)
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
