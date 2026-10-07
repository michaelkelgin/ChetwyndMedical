import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";
import { placeholderNews } from "@/lib/site";

export const metadata: Metadata = {
  title: "News",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        title="News"
        lead="Updates and announcements from the Chetwynd Medical Staff Association."
      />
      <div className="page-body">
        <div className="container">
          <PlaceholderNote>
            Sample articles only. Replace with real Chetwynd MSA news posts,
            images, and dates.
          </PlaceholderNote>
          <ul className="news-list">
            {placeholderNews.map((item) => (
              <li key={item.slug} id={item.slug}>
                <article className="news-card">
                  <span className="news-card__date">{item.dateLabel}</span>
                  <h3>{item.title}</h3>
                  <p>{item.teaser}</p>
                  <p className="muted small" style={{ marginTop: "0.75rem" }}>
                    [PLACEHOLDER] Full article body not yet supplied.
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
