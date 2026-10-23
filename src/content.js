/** Site copy and structured content. Unknown facts stay marked [placeholder]. */

const news = [
  {
    slug: "welcome-to-the-chetwynd-medical-site",
    title: "A first public page for Chetwynd medical staff",
    date: "2026-10-22",
    tags: ["News"],
    html: `
      <p>This website is the first public version of chetwyndmedical.ca. It gives facility-based physicians and medical staff in Chetwynd a shared place for announcements, meetings, and a way to reach the association.</p>
      <p>Leadership names, a direct phone line, a mailing address, member sign-in, and online payments are not filled in yet. Where a fact is still unknown, the page says [placeholder] instead of guessing.</p>
      <p>People looking for medical care should use the Chetwynd Hospital and Health Centre, not this website. The association does not book appointments.</p>
    `,
  },
  {
    slug: "member-payments-not-open-yet",
    title: "Member payments are not open on this site yet",
    date: "2026-10-08",
    tags: ["Payments", "News"],
    html: `
      <p>Some medical staff associations collect dues or accept contributions online. That is not switched on here.</p>
      <p>[placeholder] The dues amount, what the money would support, and which payment service would be used still have to be decided and then published.</p>
      <p>Until those details exist, use the contact form. Do not send card numbers by email or through this website.</p>
    `,
  },
  {
    slug: "peer-support-planning-note",
    title: "Peer support for local physicians is still a planning note",
    date: "2026-09-15",
    tags: ["Support"],
    html: `
      <p>Physicians in other communities sometimes have a confidential way to talk with a trained peer. Chetwynd does not yet have that pathway described on this site.</p>
      <p>[placeholder] Referral steps, hours, and a coordinator will be added only after the association confirms them. Nothing on this page is a working referral line.</p>
      <p>If someone needs urgent help, call emergency services or go to the Chetwynd Hospital and Health Centre emergency department, which Northern Health lists as open 24 hours. Do not wait on a program that is not posted yet.</p>
    `,
  },
  {
    slug: "onboarding-notes-for-new-physicians",
    title: "Onboarding notes for physicians new to Chetwynd",
    date: "2026-08-20",
    tags: ["Onboarding"],
    html: `
      <p>Physicians who are arranging work in Chetwynd will eventually find a short local checklist here: who to call first, how privileges are requested, and what new staff have found useful in the first month.</p>
      <p>[placeholder] Those steps, local contacts, and any notes about housing or travel are not confirmed for this draft.</p>
      <p>Northern Health remains the authority for hospital privileges and facility orientation. This association page will only point to that process, not replace it.</p>
    `,
  },
  {
    slug: "cultural-safety-on-treaty-8-territory",
    title: "Cultural safety learning, once dates are set",
    date: "2026-07-09",
    tags: ["Education"],
    html: `
      <p>Medical staff in Chetwynd work on the traditional territory of the Treaty 8 Nations, as Northern Health describes this community. Learning about cultural safety and humility belongs in the life of the association.</p>
      <p>[placeholder] Session dates, facilitators, and a reading list chosen with local Nations are not set. This page is a marker for that future note, not an announcement of a scheduled session.</p>
      <p>A website paragraph is not a substitute for guidance from Treaty 8 Nations.</p>
    `,
  },
];

const events = [
  {
    slug: "executive-check-in-2026-10-29",
    title: "Executive check-in [placeholder]",
    date: "2026-10-29",
    time: "12:00 p.m. to 1:00 p.m.",
    tag: "Executive",
    place: "[placeholder — room or video link to be confirmed]",
    holiday: false,
    html: `
      <p>A short working meeting for the officers who keep the association moving between full medical staff gatherings. Agenda, chair, and dial-in details are not confirmed.</p>
      <p>This listing is a sample so the calendar has a shape. It is not an official notice until the association publishes a real date.</p>
    `,
  },
  {
    slug: "remembrance-day-2026-11-11",
    title: "Remembrance Day",
    date: "2026-11-11",
    time: "Statutory holiday",
    tag: "Holiday",
    place: "Public holiday in British Columbia",
    holiday: true,
    html: "",
  },
  {
    slug: "medical-staff-meeting-2026-11-18",
    title: "Medical staff meeting [placeholder]",
    date: "2026-11-18",
    time: "7:00 p.m. to 8:30 p.m.",
    tag: "MSA",
    place: "[placeholder — location to be confirmed]",
    holiday: false,
    html: `
      <p>A general meeting for facility-based medical staff in Chetwynd. Typical business would include a short report from the officers, time for local issues, and any items the health authority has asked the group to consider.</p>
      <p>[placeholder] Whether this November date is real, who may attend, and where the meeting sits are not confirmed.</p>
    `,
  },
  {
    slug: "onboarding-conversation-2026-11-25",
    title: "Onboarding conversation [placeholder]",
    date: "2026-11-25",
    time: "12:15 p.m. to 1:00 p.m.",
    tag: "Education",
    place: "[placeholder — location to be confirmed]",
    holiday: false,
    html: `
      <p>A lunch-hour conversation aimed at physicians who are new to the Chetwynd Hospital and Health Centre. The point is practical: how the building works, who to ask, and what the association is for.</p>
      <p>[placeholder] Speaker and room are not assigned.</p>
    `,
  },
  {
    slug: "executive-check-in-2026-12-09",
    title: "Executive check-in [placeholder]",
    date: "2026-12-09",
    time: "12:00 p.m. to 1:00 p.m.",
    tag: "Executive",
    place: "[placeholder — room or video link to be confirmed]",
    holiday: false,
    html: `
      <p>Another sample officer check-in on the draft calendar. Use it only as a preview of how meetings will be listed.</p>
    `,
  },
  {
    slug: "medical-staff-meeting-2026-12-16",
    title: "Medical staff meeting [placeholder]",
    date: "2026-12-16",
    time: "7:00 p.m. to 8:30 p.m.",
    tag: "MSA",
    place: "[placeholder — location to be confirmed]",
    holiday: false,
    html: `
      <p>A second sample medical staff meeting. [placeholder] Topics are not set.</p>
    `,
  },
  {
    slug: "christmas-day-2026-12-25",
    title: "Christmas Day",
    date: "2026-12-25",
    time: "Statutory holiday",
    tag: "Holiday",
    place: "Public holiday in British Columbia",
    holiday: true,
    html: "",
  },
  {
    slug: "boxing-day-2026-12-26",
    title: "Boxing Day",
    date: "2026-12-26",
    time: "Statutory holiday",
    tag: "Holiday",
    place: "Public holiday in British Columbia",
    holiday: true,
    html: "",
  },
  {
    slug: "medical-staff-meeting-2027-01-14",
    title: "Medical staff meeting [placeholder]",
    date: "2027-01-14",
    time: "7:00 p.m. to 8:30 p.m.",
    tag: "MSA",
    place: "[placeholder — location to be confirmed]",
    holiday: false,
    html: `
      <p>A sample January meeting so the calendar extends past the holidays. [placeholder] Confirm or replace this date before relying on it.</p>
    `,
  },
  {
    slug: "executive-check-in-2027-01-21",
    title: "Executive check-in [placeholder]",
    date: "2027-01-21",
    time: "12:00 p.m. to 1:00 p.m.",
    tag: "Executive",
    place: "[placeholder — room or video link to be confirmed]",
    holiday: false,
    html: `
      <p>A sample January officer meeting. [placeholder]</p>
    `,
  },
];

const board = [
  ["president", "President", "PR"],
  ["vice-president", "Vice President", "VP"],
  ["treasurer", "Treasurer", "TR"],
  ["past-president", "Past President", "PP"],
  ["member-at-large", "Member at Large", "ML"],
];

const support = [
  ["physician-lead", "Physician Lead", "PL"],
  ["lead-administrator", "Lead Administrator", "LA"],
  ["administrative-support", "Administrative Support", "AS"],
  ["finance-support", "Finance Support", "FS"],
];

const roles = [
  {
    id: "president",
    title: "President",
    html: `<p>The president chairs medical staff meetings, keeps discussion orderly, and is the usual voice between members and health-authority leaders. How the seat is chosen, and the length of the term, should follow the association's own rules.</p><p>[placeholder] Those rules are not posted yet.</p>`,
  },
  {
    id: "vice-president",
    title: "Vice President",
    html: `<p>The vice president chairs when the president is away and takes on tasks the board assigns. The seat is there so one absence does not stall a decision.</p>`,
  },
  {
    id: "treasurer",
    title: "Treasurer",
    html: `<p>The treasurer keeps the association's books, reports them to the board, and checks that money goes only where members have agreed. No balances are shown on this public site.</p>`,
  },
  {
    id: "past-president",
    title: "Past President",
    html: `<p>The past president stays available through a handover so projects and relationships are not dropped when officers change.</p>`,
  },
  {
    id: "member-at-large",
    title: "Member at Large",
    html: `<p>A member at large adds another physician voice on the board without holding a named office.</p><p>[placeholder] How Chetwynd fills this seat is not confirmed.</p>`,
  },
  {
    id: "physician-lead",
    title: "Physician Lead",
    html: `<p>The physician lead helps members understand joint work with the health authority and keeps that work tied to the association's priorities.</p><p>[placeholder] Whether Chetwynd has named a physician lead is not confirmed.</p>`,
  },
  {
    id: "lead-administrator",
    title: "Lead Administrator",
    html: `<p>The lead administrator looks after day-to-day coordination: meetings, records, and the follow-up the board assigns.</p><p>[placeholder] Hours and who this person reports to are not set on this draft.</p>`,
  },
  {
    id: "administrative-support",
    title: "Administrative Support",
    html: `<p>Administrative support prepares agendas, notes, and routine correspondence so meeting time can stay on decisions.</p>`,
  },
  {
    id: "finance-support",
    title: "Finance Support",
    html: `<p>Finance support helps the treasurer with invoices, receipts, and simple tracking.</p><p>[placeholder] It is not confirmed whether Chetwynd uses a separate finance seat or folds this work into another role.</p>`,
  },
];

const partners = [
  {
    group: "Provincial",
    id: "provincial",
    items: [
      {
        name: "Doctors of BC",
        href: "https://www.doctorsofbc.ca/",
        mark: "DB",
        html: `<p>Doctors of BC is the provincial physician association. Across B.C., facility engagement funding and advice often sit with programs connected to Doctors of BC.</p><p>[placeholder] Say here which of those programs, if any, Chetwynd medical staff actually use.</p>`,
      },
      {
        name: "Rural Coordination Centre of BC",
        href: "https://rccbc.ca/",
        mark: "RC",
        html: `<p>The Rural Coordination Centre of BC is a provincial network focused on rural health equity, relationships, and learning.</p><p>[placeholder] Confirm whether Chetwynd medical staff take part in a specific program before describing one.</p>`,
      },
    ],
  },
  {
    group: "Regional",
    id: "regional",
    items: [
      {
        name: "Northern Health",
        href: "https://www.northernhealth.ca/our-communities/chetwynd",
        mark: "NH",
        html: `<p>Northern Health operates the Chetwynd Hospital and Health Centre. It is the health authority local medical staff work with on privileges, facility planning, and day-to-day care in this community.</p><p>Its public page for Chetwynd is the right place for service information. This association site does not republish clinical policies.</p>`,
      },
    ],
  },
  {
    group: "Community",
    id: "community",
    items: [
      {
        name: "[placeholder — local Division of Family Practice]",
        href: "",
        mark: "DF",
        html: `<p>Family physicians in B.C. often organize through a local division that works on community projects alongside the health authority.</p><p>[placeholder] The division name that covers Chetwynd, and any current joint projects, still need to be confirmed. No link is shown until that name is certain.</p>`,
      },
    ],
  },
];

const photos = [
  {
    file: "hero-hospital.jpg",
    caption: "Hospital corridor, used on the homepage",
    href: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d",
  },
  {
    file: "hero-clinic.jpg",
    caption: "Hospital room, used on the homepage",
    href: "https://images.unsplash.com/photo-1538108149393-fbbd81895907",
  },
  {
    file: "hero-forest.jpg",
    caption: "Sunlit forest, used on the homepage",
    href: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  },
  {
    file: "hero-hills.jpg",
    caption: "Forested ridge, used on the homepage and in link previews",
    href: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  },
  {
    file: "footer-trees.jpg",
    caption: "Trees in fog, used as a faint footer texture",
    href: "https://images.unsplash.com/photo-1448375240586-882707db888b",
  },
  {
    file: "banner-care.jpg",
    caption: "Clinician with a tablet, used behind inner-page titles",
    href: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
  },
];

module.exports = { news, events, board, support, roles, partners, photos };
