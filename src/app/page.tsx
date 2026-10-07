import Image from "next/image";
import Link from "next/link";
import { placeholderEvents, placeholderNews, site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="home-hero" aria-label="Welcome">
        <div className="home-hero__media" aria-hidden="true" />
        <div className="home-hero__inner">
          <div className="home-hero__brand">
            <Image
              src="/assets/img/chetwynd-msa-logo.png"
              alt={site.name}
              width={1728}
              height={910}
              className="home-hero__brand-img"
              priority
            />
          </div>
          <h1>Chetwynd Medical Staff Association</h1>
          <p className="home-hero__lead">{site.tagline}</p>
          <div className="home-hero__cta">
            <Link href="/about" className="btn btn-primary">
              About the MSA
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Contact
            </Link>
          </div>
          <p className="home-hero__note">
            [PLACEHOLDER] Hero atmosphere — replace with Chetwynd physician /
            facility photography when available.
          </p>
        </div>
      </section>

      <div className="intro-band">
        <div className="container">
          <p>
            The Chetwynd Medical Staff Association serves as the primary
            representative structure for facility-based physicians, aiming to
            enhance medical staff engagement, contribute to healthcare
            initiatives, address priority issues, and foster meaningful
            interactions with Health Authority leaders.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container home-split">
          <div>
            <div className="section-head">
              <h2>
                <Link href="/news">Recent News +</Link>
              </h2>
              <Link href="/news">See more news articles +</Link>
            </div>
            <ul className="news-list">
              {placeholderNews.map((item) => (
                <li key={item.slug}>
                  <Link href={`/news#${item.slug}`} className="news-card">
                    <span className="news-card__date">{item.dateLabel}</span>
                    <h3>{item.title}</h3>
                    <p>{item.teaser}</p>
                    <span className="news-card__more">Read more +</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside className="events-panel">
            <div className="section-head">
              <h2>
                <Link href="/calendar">Upcoming Events +</Link>
              </h2>
            </div>
            {placeholderEvents.map((event) => (
              <div className="event-row" key={event.title}>
                <div className="event-row__date">
                  <div className="event-row__month">{event.month}</div>
                  <div className="event-row__day">{event.day}</div>
                </div>
                <div className="event-row__body">
                  <h4>{event.title}</h4>
                  <span
                    className="event-row__tag"
                    style={{ backgroundColor: event.tagColor }}
                  >
                    {event.tag}
                  </span>
                </div>
              </div>
            ))}
            <p style={{ marginTop: "1rem" }}>
              <Link href="/calendar">See more upcoming events +</Link>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
