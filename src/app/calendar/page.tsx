import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PlaceholderNote from "@/components/PlaceholderNote";
import { placeholderEvents } from "@/lib/site";

export const metadata: Metadata = {
  title: "Calendar",
};

export default function CalendarPage() {
  return (
    <>
      <PageHero
        title="Calendar"
        lead="Upcoming meetings and events for Chetwynd medical staff."
      />
      <div className="page-body">
        <div className="container">
          <PlaceholderNote>
            Events below are structural placeholders (inspired by PG MSA’s
            calendar layout). Replace with real Chetwynd dates, locations, and
            tags.
          </PlaceholderNote>
          <div style={{ maxWidth: "40rem" }}>
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
          </div>
        </div>
      </div>
    </>
  );
}
