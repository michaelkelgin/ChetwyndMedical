const fs = require("fs");
const path = require("path");
const { news, events, board, support, roles, partners, photos } = require("../src/content");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const SITE = "https://chetwyndmedical.ca";
const CONTACT_EMAIL = "Admin@chetwyndmedical.ca";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TAG_COLORS = {
  MSA: "#0f5f75",
  Executive: "#8a3b12",
  Holiday: "#4b5563",
  Education: "#5b21b6",
};

const nav = [
  {
    label: "About Us",
    href: "/about/",
    children: [
      ["Our Purpose", "/about/purpose/"],
      ["Our Team", "/about/team/"],
      ["Our Roles", "/about/roles/"],
      ["Job Postings", "/about/job-postings/"],
    ],
  },
  { label: "News", href: "/news/" },
  { label: "Awards", href: "/awards/" },
  { label: "Partners", href: "/partners/" },
  { label: "Calendar", href: "/calendar/" },
  { label: "Contribute", href: "/contribute/" },
  { label: "Contact", href: "/contact/" },
];

const footerLeft = [
  ["Home", "/"],
  ["About Us", "/about/"],
  ["Our Purpose", "/about/purpose/"],
  ["Our Team", "/about/team/"],
  ["Our Roles", "/about/roles/"],
];
const footerRight = [
  ["News", "/news/"],
  ["Awards", "/awards/"],
  ["Partners", "/partners/"],
  ["Calendar", "/calendar/"],
  ["Contribute", "/contribute/"],
  ["Contact", "/contact/"],
];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function strip(html) {
  return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function teaser(html, limit) {
  const text = strip(html);
  if (text.length <= limit) return text;
  return text.slice(0, limit).replace(/\s+\S*$/, "") + "...";
}

function ordinal(day) {
  const teen = day % 100;
  if (teen >= 11 && teen <= 13) return day + "th";
  if (day % 10 === 1) return day + "st";
  if (day % 10 === 2) return day + "nd";
  if (day % 10 === 3) return day + "rd";
  return day + "th";
}

function parts(iso) {
  const bits = iso.split("-").map(Number);
  return { y: bits[0], m: bits[1], d: bits[2] };
}

function longDate(iso) {
  const { y, m, d } = parts(iso);
  return MONTHS[m - 1] + " " + ordinal(d) + " · " + y;
}

function shortDate(iso) {
  const { m, d } = parts(iso);
  return MONTHS[m - 1].slice(0, 3) + " " + d;
}

function current(href, path) {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href);
}

function renderNav(path) {
  const items = nav.map(function (item) {
    const section = current(item.href, path);
    const kids = (item.children || []).map(function (child) {
      const on = path === child[1];
      return `<li><a href="${child[1]}"${on ? ' aria-current="page"' : ""}>${esc(child[0])}</a></li>`;
    }).join("");
    const toggle = kids
      ? `<button class="submenu-toggle" type="button" aria-expanded="false" aria-label="Show ${esc(item.label)} pages">+</button>`
      : "";
    const submenu = kids ? `<ul class="submenu">${kids}</ul>` : "";
    const pageAttr = !item.children && path === item.href ? ' aria-current="page"' : "";
    const sectionClass = item.children && section ? " is-section" : "";
    return `<li class="nav-item${item.children ? " has-sub" : ""}">
      <div class="nav-row">
        <a class="nav-link${sectionClass}" href="${item.href}"${pageAttr}>${esc(item.label)}</a>
        ${toggle}
      </div>
      ${submenu}
    </li>`;
  }).join("");

  return `<nav id="site-nav" aria-label="Primary">
      <a class="drawer-sign-in" href="/login/">Member Sign In</a>
      <ul class="nav-list">${items}</ul>
    </nav>`;
}

function emailLink() {
  return `<a href="mailto:${CONTACT_EMAIL}">${esc(CONTACT_EMAIL)}</a>`;
}

function logoMarkup(priority) {
  const extra = priority ? ' fetchpriority="high"' : "";
  return `<picture>
      <source media="(max-width: 719px)" srcset="/assets/images/logo-360.webp" type="image/webp">
      <img src="/assets/images/logo-600.webp" width="600" height="316" alt="Chetwynd Medical Staff Association"${extra}>
    </picture>`;
}

function header(path) {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-bar">
    <a class="brand" href="/">
      ${logoMarkup(true)}
    </a>
    <div class="header-actions">
      <a class="sign-in-compact" href="/login/">Sign in</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="bars" aria-hidden="true"></span>
        <span class="menu-label">Menu</span>
      </button>
    </div>
    <div class="header-right">
      <a class="member-tab" href="/login/">Member Sign In</a>
      ${renderNav(path)}
    </div>
  </div>
</header>
<div class="nav-overlay" aria-hidden="true"></div>`;
}

function footer() {
  function list(links) {
    return `<ul class="footer-list">${links.map(function (link) {
      return `<li><a href="${link[1]}">${esc(link[0])}</a></li>`;
    }).join("")}</ul>`;
  }
  return `<footer class="site-footer">
    <img class="footer-bg" src="/assets/images/footer-trees.jpg" alt="">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="brand" href="/">
            ${logoMarkup(false)}
          </a>
          <p class="footer-email">${emailLink()}</p>
          <div class="footer-tools">
            <a href="/contact/">Contact us</a>
            <a href="/search/">Search site</a>
          </div>
        </div>
        <div>
          <h2 class="footer-label">Public pages</h2>
          <div class="footer-links">${list(footerLeft)}${list(footerRight)}</div>
        </div>
        <div>
          <h2 class="footer-label">Member pages</h2>
          <ul class="footer-list"><li><a href="/login/">Member sign in</a></li></ul>
        </div>
      </div>
      <div class="legal">
        <div>
          <p>&copy; Chetwynd Medical Staff Association</p>
          <p>First public version of chetwyndmedical.ca. Items marked [placeholder] are waiting on confirmed details.</p>
          <p><a href="/credits/">Image credits</a></p>
        </div>
        <p>Chetwynd medical staff work on land that Northern Health describes as the traditional territory of the Treaty 8 Nations. The association's own acknowledgement, written with local Nations, is still to come. [placeholder]</p>
      </div>
    </div>
  </footer>`;
}

function heroHome() {
  const slides = ["hero-hospital.jpg", "hero-clinic.jpg", "hero-forest.jpg", "hero-hills.jpg"].map(function (file) {
    return `<img src="/assets/images/${file}" alt="">`;
  }).join("");
  return `<section class="hero" aria-label="Introduction">
    <div class="hero-slides">${slides}</div>
    <div class="hero-shade"></div>
    <div class="wrap hero-inner">
      <h1>The Chetwynd Medical Staff Association is the local voice for facility-based physicians in Chetwynd. It exists so medical staff can stay engaged, raise what affects care here, and speak with health authority leaders in a clear, shared way.</h1>
    </div>
  </section>`;
}

function heroPage(title, eyebrow) {
  return `<section class="hero hero-page">
    <div class="hero-slides"><img src="/assets/images/banner-care.jpg" alt=""></div>
    <div class="hero-shade"></div>
    <div class="wrap hero-inner">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}
      <h1>${esc(title)}</h1>
    </div>
  </section>`;
}

function layout(opts) {
  const path = opts.path;
  const description = opts.description;
  const title = path === "/"
    ? "Chetwynd Medical Staff Association | Home"
    : opts.title + " | Chetwynd Medical Staff Association";
  const canonical = SITE + (path === "/" ? "/" : path);
  const image = SITE + "/assets/images/og.jpg";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/assets/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/assets/favicon-16.png" type="image/png" sizes="16x16">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <meta name="theme-color" content="#005695">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Chetwynd Medical Staff Association">
  <link rel="stylesheet" href="/assets/styles.css">
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Chetwynd Medical Staff Association",
    url: SITE + "/",
    email: CONTACT_EMAIL,
    logo: SITE + "/assets/images/logo-hq.webp",
    areaServed: "Chetwynd, British Columbia, Canada",
  })}
  </script>
</head>
<body>
  ${header(path)}
  <hr class="rule">
  ${opts.hero}
  <hr class="rule">
  <main id="main">
    <div class="wrap">
      <div class="layout${opts.solo ? " layout-solo" : ""}">
        <div class="main-col">${opts.main}</div>
        ${opts.sidebar ? `<aside class="sidebar${opts.sidebarFirst ? " sidebar-first" : ""}">${opts.sidebar}</aside>` : ""}
      </div>
      ${opts.after || ""}
    </div>
  </main>
  <hr class="rule">
  ${footer()}
  <script src="/assets/site.js"></script>
</body>
</html>`;
}

function newsCard(item) {
  return `<li data-news-item data-tags="${esc(item.tags.join(","))}">
    <a class="news-card" href="/news/${item.slug}/">
      <time class="news-date" datetime="${item.date}">${esc(longDate(item.date))}</time>
      <h3>${esc(item.title)}</h3>
      <p>${esc(teaser(item.html, 220))}</p>
      <span class="more">Read more +</span>
    </a>
  </li>`;
}

function eventRow(item) {
  const color = TAG_COLORS[item.tag] || "#005695";
  const heading = item.holiday
    ? esc(item.title)
    : `<a href="/calendar/${item.slug}/">${esc(item.title)}</a>`;
  return `<article class="event-row" id="event-${item.date}" data-date="${item.date}" data-tag="${esc(item.tag)}" style="--tag:${color}">
    <div class="event-date">
      <span class="event-month">${esc(MONTHS[parts(item.date).m - 1])}</span>
      <span class="event-day">${parts(item.date).d}</span>
    </div>
    <div class="event-main">
      <h3>${heading}</h3>
      <p class="event-time">${esc(item.time)}</p>
      <a class="event-tag" href="/calendar/?tag=${encodeURIComponent(item.tag)}">${esc(item.tag)}</a>
    </div>
  </article>`;
}

function aboutSidebar(path) {
  const links = [["About Us", "/about/"], ...nav[0].children];
  return `<div class="side-card">
      <h2>About us</h2>
      <ul class="side-links">${links.map(function (link) {
        const on = path === link[1] ? ' aria-current="page"' : "";
        return `<li><a href="${link[1]}"${on}>${esc(link[0])}</a></li>`;
      }).join("")}</ul>
    </div>
    ${contactCard()}`;
}

function newsSidebar(exceptSlug) {
  const items = news.filter(function (item) { return item.slug !== exceptSlug; }).slice(0, 4);
  return `<div class="side-card">
      <h2>Recent news</h2>
      <ul class="side-links compact-news">${items.map(function (item) {
        return `<li><a href="/news/${item.slug}/"><time datetime="${item.date}">${esc(shortDate(item.date))}</time>${esc(item.title)}</a></li>`;
      }).join("")}</ul>
    </div>
    ${contactCard()}`;
}

function contactCard() {
  return `<div class="side-card">
    <h2>Contact</h2>
    <p>Email ${emailLink()}</p>
    <p>Phone and mailing address: [placeholder]</p>
    <a class="btn" href="/contact/">Contact form</a>
  </div>`;
}

function careCallout() {
  return `<section class="care-band">
    <h2>Finding care in Chetwynd</h2>
    <p>This website is for the medical staff association. It does not book appointments, and it is not the place to send personal health information.</p>
    <p>For urgent care, call 9-1-1 or go to the emergency department. Northern Health publishes the Chetwynd Hospital and Health Centre at 5500 Hospital Road, Chetwynd, BC V0C 1J0. The hospital phone listed by Northern Health is 250-788-2236, and the emergency department is open 24 hours.</p>
    <p><a href="https://www.northernhealth.ca/find-a-facility/hospitals/chetwynd-hospital-and-health-centre">Northern Health facility page</a></p>
  </section>`;
}

function personCards(list) {
  return `<ul class="people">${list.map(function (person) {
    return `<li class="person">
      <div class="avatar" aria-hidden="true">${esc(person[2])}</div>
      <h3>[placeholder]</h3>
      <p class="role">${esc(person[1])}</p>
      <a class="more" href="/about/roles/#${person[0]}">More +</a>
    </li>`;
  }).join("")}</ul>`;
}

function monthGrid(year, month) {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let cells = names.map(function (name) {
    return `<span class="dow" title="${name}">${name.slice(0, 1)}</span>`;
  }).join("");
  for (let i = 0; i < firstDow; i += 1) cells += `<span></span>`;
  for (let day = 1; day <= days; day += 1) {
    const iso = year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    const match = events.find(function (item) { return item.date === iso; });
    if (match) {
      const href = match.holiday ? `#event-${iso}` : `/calendar/${match.slug}/`;
      cells += `<a class="has" data-cal-day="${iso}" href="${href}">${day}</a>`;
    } else {
      cells += `<span>${day}</span>`;
    }
  }
  return `<div class="month"><h3>${MONTHS[month - 1]} ${year}</h3><div class="month-grid">${cells}</div></div>`;
}

function honeypot() {
  return `<p class="honeypot"><label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>`;
}

const pages = [];

function add(opts) {
  pages.push({
    path: opts.path,
    title: opts.title,
    description: opts.description,
    plain: opts.plain || opts.description,
    html: layout(opts),
  });
}

add({
  path: "/",
  title: "Home",
  description: "Public site for the Chetwynd Medical Staff Association in Chetwynd, British Columbia. News, a sample calendar, and a contact form. Care is through the Chetwynd Hospital and Health Centre.",
  plain: "Chetwynd Medical Staff Association home news calendar contact hospital",
  hero: heroHome(),
  main: `<h2 class="section-link"><a href="/news/">Recent News +</a></h2>
    <ul class="news-list">${news.slice(0, 3).map(newsCard).join("")}</ul>
    <p class="see-more"><a class="more" href="/news/">See more news articles +</a></p>`,
  sidebar: `<h2 class="section-link"><a href="/calendar/">Upcoming Events +</a></h2>
    <div data-upcoming-list>${events.filter(function (item) { return item.date >= "2026-10-22"; }).slice(0, 6).map(eventRow).join("")}</div>
    <p class="see-more"><a class="more" href="/calendar/">See more upcoming events +</a></p>`,
  after: careCallout(),
});

add({
  path: "/about/",
  title: "About Us",
  description: "What the Chetwynd Medical Staff Association is for: purpose, open seats on the team, roles, and job postings.",
  eyebrow: "About Us",
  hero: heroPage("About Us"),
  sidebar: aboutSidebar("/about/"),
  plain: "About the Chetwynd Medical Staff Association purpose team roles job postings",
  main: `<div class="card-grid two">
    <a class="info-card" href="/about/purpose/">
      <h2>Our Purpose</h2>
      <p>Facility-based physicians in Chetwynd need a local structure that can raise shared concerns and sit down with health authority leaders.</p>
      <span class="more">More +</span>
    </a>
    <a class="info-card" href="/about/team/">
      <h2>Our Team</h2>
      <p>Board seats and support roles are listed here. Names are still [placeholder] until the association confirms who holds them.</p>
      <span class="more">More +</span>
    </a>
    <a class="info-card" href="/about/roles/">
      <h2>Our Roles</h2>
      <p>A plain-language sketch of what each seat is expected to do. Final wording should follow the association's own rules.</p>
      <span class="more">More +</span>
    </a>
    <a class="info-card" href="/about/job-postings/">
      <h2>Job Postings</h2>
      <p>There are no postings on this first version of the site.</p>
      <span class="more">More +</span>
    </a>
  </div>`,
});

add({
  path: "/about/purpose/",
  title: "Our Purpose",
  description: "Why a local medical staff association exists for facility-based physicians working in Chetwynd.",
  eyebrow: "About Us",
  hero: heroPage("Our Purpose", "About Us"),
  sidebar: aboutSidebar("/about/purpose/"),
  plain: "Purpose of the medical staff association engagement health authority patient care Treaty 8",
  main: `<div class="prose">
    <p>The Chetwynd Medical Staff Association is the local representative body for physicians who practise in health authority facilities in Chetwynd, including the Chetwynd Hospital and Health Centre.</p>
    <p>Across British Columbia, facility-based physicians are expected to have a local medical staff structure. Health authorities are asked to support that structure so physicians can take part in decisions that affect their work and their patients. In everyday terms, that means the association should help members:</p>
    <ol class="aims">
      <li>Put forward views that might otherwise be missed.</li>
      <li>Contribute to plans and projects that change how physicians work.</li>
      <li>Focus attention on issues that matter for physicians and for patient care.</li>
      <li>Meet health authority leaders, including physicians in formal leadership roles, often enough for the conversation to be real.</li>
    </ol>
    <p>This page is a plain summary for the website. It is not a copy of a memorandum, and it does not replace the association's own constitution. [placeholder] Link that document here when it is ready to share.</p>
    <blockquote class="pullquote">
      <p>[placeholder quote] A short note from a member or a health authority partner can sit here after the wording and the permission are both confirmed.</p>
      <footer>[placeholder], [role]</footer>
    </blockquote>
  </div>`,
});

add({
  path: "/about/team/",
  title: "Our Team",
  description: "Board and support seats for the Chetwynd Medical Staff Association. Names are placeholders until they are confirmed.",
  eyebrow: "About Us",
  hero: heroPage("Our Team", "About Us"),
  sidebar: aboutSidebar("/about/team/"),
  plain: "Team board president treasurer physician lead administrator placeholder names",
  main: `<div class="prose">
    <p>These are the seats a local medical staff association typically fills. Nobody is named below, because this draft does not invent people. Each name line stays [placeholder] until the association confirms it.</p>
    <h2>Board of directors</h2>
    <p>The board gives the association direction, keeps a line open with administration, watches association funds, and reports back to members.</p>
  </div>
  ${personCards(board)}
  <div class="prose"><h2>Support seats</h2>
    <p>Support seats keep meetings, projects, and paperwork moving. [placeholder] Which of these seats Chetwynd actually funds is not confirmed.</p>
  </div>
  ${personCards(support)}
  <blockquote class="pullquote">
    <p>[placeholder quote] A comment from a partner can be added here later. It will name a real person only with their agreement.</p>
    <footer>[placeholder], [organization]</footer>
  </blockquote>`,
});

add({
  path: "/about/roles/",
  title: "Our Roles",
  description: "Draft descriptions of officer and support roles for the Chetwynd Medical Staff Association.",
  eyebrow: "About Us",
  hero: heroPage("Our Roles", "About Us"),
  sidebar: aboutSidebar("/about/roles/"),
  plain: strip(roles.map(function (role) { return role.title + " " + role.html; }).join(" ")),
  main: `<div class="prose"><p>These sketches describe the work, not the person in the seat. Treat them as a draft for this website. [placeholder] Replace them with the association's own terms of reference when those are adopted.</p>
    ${roles.map(function (role) {
      return `<section class="role-block" id="${role.id}"><h2>${esc(role.title)}</h2>${role.html}</section>`;
    }).join("")}
  </div>`,
});

add({
  path: "/about/job-postings/",
  title: "Job Postings",
  description: "Job postings from the Chetwynd Medical Staff Association. None are listed in this first version.",
  eyebrow: "About Us",
  hero: heroPage("Job Postings", "About Us"),
  sidebar: aboutSidebar("/about/job-postings/"),
  plain: "Job postings none at this time placeholder",
  main: `<div class="empty-panel">
    <h2>No postings right now</h2>
    <p>The Chetwynd Medical Staff Association has no job postings on this site. [placeholder] A posting will be added here when one is approved for the public page.</p>
  </div>`,
});

const newsTags = ["All", "News", "Payments", "Support", "Onboarding", "Education"];
add({
  path: "/news/",
  title: "News",
  description: "Announcements for Chetwynd medical staff. Early posts are draft notes, and several details are still placeholders.",
  hero: heroPage("News"),
  sidebar: newsSidebar(),
  plain: news.map(function (item) { return item.title + " " + strip(item.html); }).join(" "),
  main: `<div class="chip-row" role="group" aria-label="Filter news">
      ${newsTags.map(function (tag, index) {
        const value = tag === "All" ? "all" : tag;
        return `<button class="chip${index === 0 ? " is-active" : ""}" type="button" data-news-filter="${esc(value)}">${esc(tag)}</button>`;
      }).join("")}
    </div>
    <ul class="news-list">${news.map(newsCard).join("")}</ul>
    <p class="form-note">For more information, write to ${emailLink()} or use the <a href="/contact/">contact form</a>.</p>`,
});

news.forEach(function (item) {
  add({
    path: "/news/" + item.slug + "/",
    title: item.title,
    description: teaser(item.html, 160),
    eyebrow: "News",
    hero: heroPage(item.title, "News"),
    sidebar: newsSidebar(item.slug),
    plain: item.title + " " + strip(item.html),
    main: `<article class="prose">
      <p class="meta"><time datetime="${item.date}">${esc(longDate(item.date))}</time> · ${esc(item.tags.join(", "))}</p>
      ${item.html}
      <p><a class="more" href="/news/">All news</a></p>
    </article>`,
  });
});

add({
  path: "/awards/",
  title: "Awards",
  description: "Recognition of Chetwynd medical staff will be listed here after the association confirms it. No awards are posted in this draft.",
  hero: heroPage("Awards"),
  sidebar: newsSidebar(),
  plain: "Awards none posted yet placeholder recognition",
  main: `<div class="empty-panel">
    <h2>No awards posted yet</h2>
    <p>When the association confirms an award or other recognition for someone on the Chetwynd medical staff, it will be listed here. This draft does not include sample names.</p>
  </div>`,
});

add({
  path: "/partners/",
  title: "Partners",
  description: "Organizations Chetwynd medical staff commonly work alongside. Active local partnerships still need to be confirmed.",
  hero: heroPage("Partners"),
  plain: partners.map(function (group) {
    return group.group + " " + group.items.map(function (item) { return item.name + " " + strip(item.html); }).join(" ");
  }).join(" "),
  sidebar: `<div class="side-card"><h2>On this page</h2><ul class="side-links">
      ${partners.map(function (group) {
        return `<li><a href="#${group.id}">${esc(group.group)} partners</a></li>`;
      }).join("")}
    </ul></div>${contactCard()}`,
  main: `<div class="prose"><p>Medical staff in Chetwynd do not work alone. The groups below are the provincial, regional, and community organizations a local association would usually keep in view. Treat the relationship notes as [placeholder] until someone confirms what is actually active.</p></div>
    ${partners.map(function (group) {
      return `<section class="prose" id="${group.id}"><h2>${esc(group.group)} partners</h2>
        ${group.items.map(function (item) {
          const link = item.href
            ? `<p><a href="${esc(item.href)}">Visit ${esc(item.name)}</a></p>`
            : "";
          return `<article class="partner">
            <div class="partner-mark" aria-hidden="true">${esc(item.mark)}</div>
            <div><h3>${esc(item.name)}</h3>${item.html}${link}</div>
          </article>`;
        }).join("")}
      </section>`;
    }).join("")}`,
});

const eventTags = ["All", "MSA", "Executive", "Education", "Holiday"];
add({
  path: "/calendar/",
  title: "Calendar",
  description: "Sample calendar for Chetwynd medical staff meetings. Dates marked placeholder are not confirmed notices.",
  hero: heroPage("Calendar"),
  sidebarFirst: true,
  plain: events.map(function (item) { return item.title + " " + item.date + " " + item.tag + " " + item.place; }).join(" "),
  sidebar: `<div class="side-card">
      <h2>Filter by date</h2>
      <div class="chip-row">
        <button class="chip is-active" type="button" data-range="all">All dates</button>
        <button class="chip" type="button" data-range="week">Next week</button>
        <button class="chip" type="button" data-range="month">Next month</button>
        <button class="chip" type="button" data-range="3">Next 3 months</button>
        <button class="chip" type="button" data-range="6">Next 6 months</button>
      </div>
    </div>
    <div class="side-card">
      <h2>Filter by tag</h2>
      <div class="chip-row">
        ${eventTags.map(function (tag, index) {
          const value = tag === "All" ? "all" : tag;
          return `<button class="chip${index === 0 ? " is-active" : ""}" type="button" data-tag-filter="${esc(value)}">${esc(tag)}</button>`;
        }).join("")}
      </div>
    </div>
    <div class="side-card">
      ${monthGrid(2026, 10)}${monthGrid(2026, 11)}${monthGrid(2026, 12)}${monthGrid(2027, 1)}
    </div>`,
  main: `<div class="prose"><p>The meetings below are a sample schedule so the page has somewhere to put a real calendar later. Statutory holidays are public dates. Anything marked [placeholder] is not an official notice.</p></div>
    <div data-event-list>${events.map(eventRow).join("")}</div>
    <p data-event-empty hidden>No sample events match those filters.</p>`,
});

events.filter(function (item) { return !item.holiday; }).forEach(function (item) {
  add({
    path: "/calendar/" + item.slug + "/",
    title: item.title,
    description: item.title + " on " + longDate(item.date) + ". " + item.time + " " + item.place,
    eyebrow: "Calendar",
    hero: heroPage(item.title, "Calendar"),
    plain: item.title + " " + item.date + " " + item.time + " " + item.place + " " + strip(item.html),
    sidebar: `<div class="side-card"><h2>Event</h2>
        <p><strong>${esc(longDate(item.date))}</strong><br>${esc(item.time)}<br>${esc(item.place)}</p>
        <p><a class="more" href="/calendar/">Back to calendar</a></p>
      </div>${contactCard()}`,
    main: `<article class="prose">
      <p class="meta">${esc(item.tag)} · <time datetime="${item.date}">${esc(longDate(item.date))}</time></p>
      ${item.html}
      <p>Questions can go through the <a href="/contact/">contact form</a>.</p>
    </article>`,
  });
});

add({
  path: "/contribute/",
  title: "Contribute",
  description: "A place for future contributions to Chetwynd medical staff projects. Online card payments are not active.",
  hero: heroPage("Contribute"),
  sidebar: contactCard(),
  plain: "Contribute interest form no card payment placeholder dues childcare not copied",
  main: `<div class="prose">
      <p>Some associations invite members to put money toward a shared local need. Chetwynd has not named that need on this site yet.</p>
      <p>[placeholder] What contributions would support, suggested amounts, and who issues a receipt are all still open. This page does not take card numbers and does not move any money.</p>
      <p>If you want to be told when a real option exists, leave your name below. It is a note of interest only.</p>
    </div>
    <form class="stack-form" name="contribute-interest" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="bot-field">
      <input type="hidden" name="form-name" value="contribute-interest">
      ${honeypot()}
      <label for="contrib-name">Name <span class="req">*</span></label>
      <input id="contrib-name" name="name" required autocomplete="name">
      <label for="contrib-email">Email <span class="req">*</span></label>
      <input id="contrib-email" name="email" type="email" required autocomplete="email">
      <fieldset>
        <legend>Amount you might consider later</legend>
        ${["$25", "$50", "$100", "Other / not sure"].map(function (amount, index) {
          return `<label class="choice"><input type="radio" name="amount" value="${esc(amount)}"${index === 3 ? " checked" : ""}> ${esc(amount)}</label>`;
        }).join("")}
      </fieldset>
      <label for="contrib-note">Note</label>
      <textarea id="contrib-note" name="note"></textarea>
      <p class="form-note">Sending this form does not pay anything. Please do not include card numbers or patient information.</p>
      <button class="btn" type="submit">Send interest</button>
    </form>`,
});

add({
  path: "/contact/",
  title: "Contact",
  description: "Contact the Chetwynd Medical Staff Association at Admin@chetwyndmedical.ca. Phone and mailing address are still placeholders. Hospital details are Northern Health's published numbers.",
  hero: heroPage("Contact"),
  sidebar: `<div class="side-card">
      <h2>Association</h2>
      <p>Email: ${emailLink()}</p>
      <p>Phone: [placeholder]</p>
      <p>Mailing address: [placeholder]</p>
    </div>
    <div class="side-card">
      <h2>Health centre</h2>
      <p>Chetwynd Hospital and Health Centre<br>5500 Hospital Road<br>Chetwynd, BC V0C 1J0</p>
      <p>Hospital phone published by Northern Health: 250-788-2236</p>
      <p>Emergency department: 24 hours</p>
      <p><a href="https://www.northernhealth.ca/find-a-facility/hospitals/chetwynd-hospital-and-health-centre">Facility page</a></p>
    </div>`,
  plain: "Contact Admin@chetwyndmedical.ca form phone mailing address placeholder Chetwynd Hospital and Health Centre 5500 Hospital Road 250-788-2236",
  main: `<div class="prose">
      <p>Write to ${emailLink()}, or use the form for a general question. A star marks a required field. Phone and mailing address for the association are still [placeholder].</p>
    </div>
    <form class="stack-form" name="contact" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="bot-field">
      <input type="hidden" name="form-name" value="contact">
      ${honeypot()}
      <label for="contact-name">Name <span class="req">*</span></label>
      <input id="contact-name" name="name" required autocomplete="name">
      <label for="contact-email">Email <span class="req">*</span></label>
      <input id="contact-email" name="email" type="email" required autocomplete="email">
      <label for="contact-phone">Phone</label>
      <input id="contact-phone" name="phone" type="tel" autocomplete="tel">
      <label for="contact-topic">Topic</label>
      <select id="contact-topic" name="topic">
        <option>General question</option>
        <option>Membership</option>
        <option>Calendar</option>
        <option>Partnerships</option>
        <option>Something else</option>
      </select>
      <label for="contact-message">Message <span class="req">*</span></label>
      <textarea id="contact-message" name="message" required></textarea>
      <p class="form-note">Messages are collected with Netlify Forms for the site owner. Do not include information about a patient's health.</p>
      <button class="btn" type="submit">Send message</button>
    </form>
    ${careCallout()}`,
});

add({
  path: "/login/",
  title: "Member Sign In",
  description: "Member sign-in for the Chetwynd Medical Staff Association is not active on this first version of the site.",
  hero: heroPage("Member Sign In"),
  solo: true,
  plain: "Member sign in is not active placeholder password not collected",
  main: `<div class="narrow">
    <div class="banner"><p>Member sign-in is not turned on yet. [placeholder] A private member area, including any password reset, will be added in a later version. Do not send a password through the contact form.</p></div>
    <form class="stack-form" action="/login/" method="get">
      <label for="login-email">Email address</label>
      <input id="login-email" name="email" type="email" autocomplete="username" disabled>
      <label for="login-password">Password</label>
      <input id="login-password" name="password" type="password" autocomplete="current-password" disabled>
      <p><button class="btn" type="submit" disabled>Sign in</button></p>
      <p class="form-note">Forgot-password mail is not available while sign-in is off.</p>
    </form>
  </div>`,
});

add({
  path: "/search/",
  title: "Search",
  description: "Search public pages on the Chetwynd Medical Staff Association website.",
  hero: heroPage("Search"),
  solo: true,
  plain: "Search public pages of this website",
  main: `<form id="site-search" class="stack-form" role="search" action="/search/" method="get">
      <label for="q">Search this site</label>
      <input id="q" name="q" type="search" placeholder="Try calendar, Northern Health, or placeholder">
      <p><button class="btn" type="submit">Search</button></p>
    </form>
    <div id="search-results"><p>Enter a word to search the public pages.</p></div>
    <noscript><p>Search on this page uses JavaScript. You can also use the links in the footer.</p></noscript>`,
});

add({
  path: "/credits/",
  title: "Image credits",
  description: "Generic photographs used on this site come from Unsplash. They are not pictures of Chetwynd staff or the Chetwynd hospital.",
  hero: heroPage("Image credits"),
  solo: true,
  plain: "Unsplash image credits Lato font SIL Open Font License",
  main: `<div class="prose">
      <p>The crest in the header and footer is the Chetwynd Medical Staff Association logo. A high-resolution copy is kept with the site files. The other photographs are generic stock images. They do not show Chetwynd physicians, the Chetwynd Hospital and Health Centre, or local events.</p>
      <p>Photographs are from Unsplash and are used under the <a href="https://unsplash.com/license">Unsplash License</a>.</p>
      <ul>${photos.map(function (photo) {
        return `<li>${esc(photo.caption)}. <a href="${esc(photo.href)}">Source image</a>.</li>`;
      }).join("")}</ul>
      <p>The text is set in Lato, licensed under the SIL Open Font License. A copy of that license is stored with the font files in this project.</p>
    </div>`,
});

add({
  path: "/thank-you/",
  title: "Thank you",
  description: "Your message was sent to the Chetwynd Medical Staff Association site form.",
  hero: heroPage("Thank you"),
  solo: true,
  plain: "Thank you form submitted",
  main: `<div class="prose">
    <p>Your message is in the form inbox for this website. If a reply address was included, someone will write back once the association is monitoring that inbox. [placeholder] Please do not count on a timeline yet.</p>
    <p>If you need medical care, this form is the wrong place. Use the Chetwynd Hospital and Health Centre or call 9-1-1.</p>
    <p><a class="btn" href="/">Back to the home page</a></p>
  </div>`,
});

const notFound = layout({
  path: "/404.html",
  title: "Page not found",
  description: "That page is not on the Chetwynd Medical Staff Association site.",
  hero: heroPage("Page not found"),
  solo: true,
  main: `<div class="prose"><p>That address is not on this site. Try the <a href="/">home page</a> or <a href="/search/">search</a>.</p></div>`,
});

function writePage(urlPath, html) {
  const relative = urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "").replace(/\/$/, "") + "/index.html";
  const file = path.join(dist, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from, { withFileTypes: true }).forEach(function (entry) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  });
}

function normalizeLink(href) {
  if (!href.startsWith("/")) return null;
  let value = href.split("#")[0].split("?")[0];
  if (value.startsWith("/assets/") || value === "/search-index.json" || value === "/sitemap.xml") return null;
  if (value === "") value = "/";
  if (value !== "/" && !value.endsWith("/")) value += "/";
  return value;
}

function check() {
  const errors = [];
  const known = new Set(pages.map(function (page) { return page.path; }));
  known.add("/");
  const banned = [/prince george/i, /pgmedstaff/i, /feuhnbc/i, /uhnbc/i, /lheidli/i, /oneaftereight/i, /richard the brave/i];
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  pages.forEach(function (page) {
    banned.forEach(function (pattern) {
      if (pattern.test(page.html)) errors.push(page.path + " matched " + pattern);
    });
    const found = page.html.match(email) || [];
    found.forEach(function (addr) {
      if (addr.toLowerCase() !== CONTACT_EMAIL.toLowerCase()) {
        errors.push(page.path + " has unexpected email " + addr);
      }
    });
    const phones = page.html.match(/\d{3}-\d{3}-\d{4}/g) || [];
    phones.forEach(function (phone) {
      if (phone !== "250-788-2236") errors.push(page.path + " has unexpected phone " + phone);
    });
    const hrefs = page.html.match(/href="([^"]+)"/g) || [];
    hrefs.forEach(function (raw) {
      const href = raw.slice(6, -1);
      const local = normalizeLink(href);
      if (local && !known.has(local)) errors.push(page.path + " links to missing " + href);
    });
  });
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
copyDir(path.join(root, "src/assets"), path.join(dist, "assets"));
copyDir(path.join(root, "src/fonts"), path.join(dist, "assets/fonts"));
copyDir(path.join(root, "src/images"), path.join(dist, "assets/images"));
fs.copyFileSync(path.join(root, "src/styles.css"), path.join(dist, "assets/styles.css"));
fs.copyFileSync(path.join(root, "src/site.js"), path.join(dist, "assets/site.js"));

check();
pages.forEach(function (page) { writePage(page.path, page.html); });
fs.writeFileSync(path.join(dist, "404.html"), notFound);

const index = pages
  .filter(function (page) { return page.path !== "/thank-you/" && page.path !== "/search/"; })
  .map(function (page) {
    return { title: page.title, url: page.path, summary: page.description, text: page.plain };
  });
fs.writeFileSync(path.join(dist, "search-index.json"), JSON.stringify(index, null, 2));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
  pages.map(function (page) {
    return `  <url><loc>${SITE}${page.path}</loc></url>`;
  }).join("\n")
}\n</urlset>\n`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(dist, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: " + SITE + "/sitemap.xml\n");

console.log("Built " + pages.length + " pages into dist/");
pages.forEach(function (page) { console.log("  " + page.path); });
