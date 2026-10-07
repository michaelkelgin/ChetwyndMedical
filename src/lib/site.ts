export const site = {
  name: "Chetwynd Medical Staff Association",
  shortName: "Chetwynd MSA",
  domain: "ChetwyndMedical.ca",
  tagline:
    "The primary representative structure for facility-based physicians in Chetwynd — supporting engagement, partnership, and care.",
  description:
    "Official website of the Chetwynd Medical Staff Association (MSA) — representing facility-based physicians in Chetwynd, British Columbia.",
  placeholderEmail: "[PLACEHOLDER: contact email — e.g. contact@chetwyndmedical.ca]",
  placeholderMailing:
    "[PLACEHOLDER: mailing address — Chetwynd, BC — ATTN: Chetwynd MSA President]",
  placeholderLandAcknowledgement:
    "[PLACEHOLDER: land acknowledgement for Chetwynd / Treaty 8 territory — wording to be supplied by Chetwynd MSA]",
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const mainNav: NavItem[] = [
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "Our Purpose", href: "/about/purpose" },
      { label: "Our Team", href: "/about/team" },
      { label: "Our Roles", href: "/about/roles" },
      { label: "Job Postings", href: "/about/job-postings" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Awards", href: "/awards" },
  { label: "Partners", href: "/partners" },
  { label: "Calendar", href: "/calendar" },
  { label: "Contribute", href: "/contribute" },
  { label: "Contact", href: "/contact" },
];

export const footerPublicLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Purpose", href: "/about/purpose" },
  { label: "Our Team", href: "/about/team" },
  { label: "Our Roles", href: "/about/roles" },
  { label: "News", href: "/news" },
  { label: "Awards", href: "/awards" },
  { label: "Partners", href: "/partners" },
  { label: "Calendar", href: "/calendar" },
  { label: "Contribute", href: "/contribute" },
  { label: "Contact", href: "/contact" },
];

export type NewsItem = {
  slug: string;
  dateLabel: string;
  title: string;
  teaser: string;
  placeholder?: boolean;
};

export const placeholderNews: NewsItem[] = [
  {
    slug: "welcome-chetwynd-msa-site",
    dateLabel: "October 2025",
    title: "[PLACEHOLDER] Welcome to the Chetwynd MSA website",
    teaser:
      "[PLACEHOLDER] Introductory announcement for the new Chetwynd Medical Staff Association site. Replace with real news copy and date.",
    placeholder: true,
  },
  {
    slug: "member-engagement-update",
    dateLabel: "September 2025",
    title: "[PLACEHOLDER] Member engagement update",
    teaser:
      "[PLACEHOLDER] Brief update on MSA engagement priorities and upcoming opportunities for medical staff input. Replace with real content.",
    placeholder: true,
  },
  {
    slug: "peer-support-resources",
    dateLabel: "August 2025",
    title: "[PLACEHOLDER] Peer support resources for Chetwynd physicians",
    teaser:
      "[PLACEHOLDER] Outline of confidential peer support options available to local physicians. Replace with verified program details.",
    placeholder: true,
  },
];

export type EventItem = {
  month: string;
  day: string;
  title: string;
  tag: string;
  tagColor: string;
  placeholder?: boolean;
};

export const placeholderEvents: EventItem[] = [
  {
    month: "Oct",
    day: "08",
    title: "[PLACEHOLDER] Quarterly MSA Board Meeting",
    tag: "Board",
    tagColor: "#dc2626",
    placeholder: true,
  },
  {
    month: "Oct",
    day: "15",
    title: "[PLACEHOLDER] Monthly MSA Executive Meeting",
    tag: "Executive",
    tagColor: "#d97706",
    placeholder: true,
  },
  {
    month: "Oct",
    day: "22",
    title: "[PLACEHOLDER] Facility Engagement Working Group",
    tag: "FEWG",
    tagColor: "#0f766e",
    placeholder: true,
  },
];
