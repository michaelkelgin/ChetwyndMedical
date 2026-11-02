import { renderPreviewDocument } from "./preview.mjs";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));
}

const STATUS_LABEL = {
  draft: "Draft",
  awaiting_approval: "Awaiting approval",
  live: "Live",
  denied: "Denied",
  cancelled: "Cancelled",
  reversed: "Reversed",
};

function shell({ title, user, body }) {
  const who = user
    ? `<p class="member-who">Signed in as ${esc(user.name)} <span class="status status-${user.approver ? "live" : "draft"}">${esc(user.role)}</span></p>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | Chetwynd Medical Staff</title>
  <link rel="stylesheet" href="/assets/styles.css">
  <link rel="stylesheet" href="/assets/members.css">
  <link rel="icon" href="/assets/favicon-32.png">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap header-bar">
      <a class="brand" href="/"><img src="/assets/images/logo-360.webp" width="360" height="190" alt="Chetwynd Medical Staff Association"></a>
      <nav class="member-nav" aria-label="Members">
        <a href="/members/">Members</a>
        <a href="/members/updates/">Website updates</a>
        <a href="/members/documents/">Documents</a>
        <a href="/">Public site</a>
      </nav>
      ${user ? `<form method="POST" action="/api/auth/logout"><button class="btn btn-line" type="submit">Sign out</button></form>` : ""}
    </div>
  </header>
  <hr class="rule">
  <main id="main"><div class="wrap members-main">
    ${who}
    ${body}
  </div></main>
</body>
</html>`;
}

export function authResultPage({ devLink, delivery }) {
  const extra = devLink
    ? `<p>Email is not being sent from this server, so use this one-time link:</p><p><a class="btn" href="${esc(devLink)}">Open sign-in link</a></p><p class="form-note">${esc(devLink)}</p>`
    : `<p>If email delivery is configured, the link is on its way (${esc(delivery || "email")}).</p>`;
  return shell({
    title: "Check your email",
    body: `<div class="narrow"><h1>Check your email</h1><p>If that address is on the member list, a sign-in link is ready. It expires in 15 minutes and works once.</p>${extra}<p><a href="/login/">Back to sign in</a></p></div>`,
  });
}

export function membersHome({ user, pages }) {
  const list = pages.length
    ? `<ul class="side-links">${pages.map((page) => `<li><a href="/members/pages/${esc(page.path.split("/").pop().replace(/\.md$/, ""))}/">${esc(page.path)}</a></li>`).join("")}</ul>`
    : `<p>No members-only pages have been published yet. Start one from Website updates.</p>`;
  return shell({
    title: "Members",
    user,
    body: `<h1>Members</h1>
      <p>This area is only returned after a valid sign-in. It holds members-only pages, documents, and the website updates desk.</p>
      <div class="card-grid two">
        <a class="info-card" href="/members/updates/"><h2>Website updates</h2><p>Ask for a change, preview it, and send it through the approval rules.</p><span class="more">Open +</span></a>
        <a class="info-card" href="/members/documents/"><h2>Documents</h2><p>Schedules and files published from an approved members-area change.</p><span class="more">Open +</span></a>
      </div>
      <h2>Published members pages</h2>
      ${list}`,
  });
}

export function documentsPage({ user, documents }) {
  const list = documents.length
    ? `<ul class="doc-list">${documents.map((doc) => `<li><a href="/members/documents/${esc(doc.id)}">${esc(doc.name)}</a> <span class="form-note">${esc(doc.type || "")}</span></li>`).join("")}</ul>`
    : `<p>No documents yet.</p>`;
  return shell({ title: "Documents", user, body: `<h1>Documents</h1>${list}` });
}

function statusPill(status) {
  return `<span class="status status-${esc(status)}">${esc(STATUS_LABEL[status] || status)}</span>`;
}

export function updatesPage({ user, changes, error }) {
  const cards = changes.length ? changes.map((change) => {
    const cancel = ["draft", "awaiting_approval", "denied"].includes(change.status)
      ? `<form method="POST" action="/members/updates/${esc(change.id)}/"><input type="hidden" name="action" value="cancel"><button class="btn btn-line" type="submit">Cancel</button></form>`
      : "";
    const reverse = change.status === "live"
      ? `<form method="POST" action="/members/updates/${esc(change.id)}/"><input type="hidden" name="action" value="reverse"><button class="btn btn-line" type="submit">Reverse</button></form>`
      : "";
    return `<article class="change-card">
      <time datetime="${esc(change.updatedAt)}">${esc(change.updatedAt.slice(0, 16).replace("T", " "))}</time>
      ${statusPill(change.status)}
      <h2>${esc(change.title)}</h2>
      <p class="form-note">${esc(change.scope || "No files yet")} · ${esc(change.authorEmail)}</p>
      <div class="button-row">
        <a class="btn" href="/members/updates/${esc(change.id)}/">Edit / Preview</a>
        ${cancel}${reverse}
      </div>
    </article>`;
  }).join("") : `<p>No changes yet.</p>`;
  return shell({
    title: "Website updates",
    user,
    body: `${error ? `<div class="banner"><p>${esc(error)}</p></div>` : ""}
      <h1>Website updates</h1>
      <section class="chat-panel">
        <h2>Start a change</h2>
        <form class="stack-form" method="POST" action="/members/updates/" enctype="multipart/form-data">
          <label for="new-message">What should change?</label>
          <textarea id="new-message" name="message" required placeholder="Example: Add a members page for the December on-call roster."></textarea>
          <label for="new-files">Schedules or documents</label>
          <input id="new-files" name="files" type="file" multiple>
          <p class="form-note">Do not upload patient information. The assistant drafts files; it does not decide who must approve them.</p>
          <button class="btn" type="submit">Draft with assistant</button>
        </form>
      </section>
      <h2>Changes</h2>
      <div class="change-list">${cards}</div>`,
  });
}

export function editPage({ user, change, error }) {
  const revision = (change.revisions || []).find((item) => item.id === change.currentRevisionId);
  const preview = renderPreviewDocument(revision ? revision.operations : []);
  const chat = (change.chat || []).map((item) => `<article class="chat-item chat-${esc(item.role)}"><strong>${esc(item.role)}</strong><p>${esc(item.content)}</p></article>`).join("");
  const history = (change.revisions || []).slice().reverse().map((item) => `<li>
      <span>${esc(item.at.slice(0, 16).replace("T", " "))} · ${esc(item.summary || "Revision")}</span>
      <form method="POST" action="/members/updates/${esc(change.id)}/">
        <input type="hidden" name="action" value="restore">
        <input type="hidden" name="revisionId" value="${esc(item.id)}">
        <button class="btn btn-line" type="submit">Restore</button>
      </form>
    </li>`).join("");
  const canReview = user.approver && user.email !== change.authorEmail && change.status === "awaiting_approval";
  const review = canReview ? `<form method="POST" action="/members/updates/${esc(change.id)}/"><input type="hidden" name="action" value="approve"><button class="btn" type="submit">Approve</button></form>
    <form method="POST" action="/members/updates/${esc(change.id)}/"><input type="hidden" name="action" value="deny"><button class="btn btn-line" type="submit">Deny</button></form>` : "";
  const publishNote = change.publish && change.publish.mode === "dry-run"
    ? `<p class="banner">GitHub was not updated because GITHUB_TOKEN is not set. The decision is saved here only.</p>`
    : "";
  return shell({
    title: change.title,
    user,
    body: `${error ? `<div class="banner"><p>${esc(error)}</p></div>` : ""}
      ${publishNote}
      <p class="form-note"><a href="/members/updates/">All changes</a></p>
      <h1>${esc(change.title)}</h1>
      <p>${statusPill(change.status)} <span class="form-note">${esc(change.scope || "unclassified")}${change.requiredApprovals ? ` · needs ${esc(change.requiredApprovals)} approval(s)` : ""}</span></p>
      <section class="chat-panel">
        <h2>Discuss this change</h2>
        <div class="chat-log">${chat || "<p>No messages yet.</p>"}</div>
        <form class="stack-form" method="POST" action="/members/updates/${esc(change.id)}/" enctype="multipart/form-data">
          <input type="hidden" name="action" value="chat">
          <label for="chat-message">Revision note</label>
          <textarea id="chat-message" name="message" required></textarea>
          <label for="chat-files">Attach a schedule or document</label>
          <input id="chat-files" name="files" type="file" multiple>
          <button class="btn" type="submit">Send</button>
        </form>
        <h2>Revision history</h2>
        <ul class="revision-list">${history || "<li>No revisions yet.</li>"}</ul>
      </section>
      <section class="preview-panel">
        <h2>Preview</h2>
        <div class="preview-frame preview-doc">${preview}</div>
      </section>
      <section class="action-bar">
        <form method="POST" action="/members/updates/${esc(change.id)}/"><input type="hidden" name="action" value="preview"><button class="btn btn-line" type="submit">Update preview</button></form>
        <form method="POST" action="/members/updates/${esc(change.id)}/"><input type="hidden" name="action" value="submit"><button class="btn" type="submit">Submit</button></form>
        <form method="POST" action="/members/updates/${esc(change.id)}/"><input type="hidden" name="action" value="cancel"><button class="btn btn-line" type="submit">Cancel / Delete</button></form>
        ${change.status === "live" ? `<form method="POST" action="/members/updates/${esc(change.id)}/"><input type="hidden" name="action" value="reverse"><button class="btn btn-line" type="submit">Reverse</button></form>` : ""}
        ${review}
      </section>`,
  });
}

export function memberPageView({ user, page }) {
  return shell({
    title: page.path,
    user,
    body: `<p><a href="/members/">Members</a></p><article class="prose">${renderPreviewDocument([{ op: "write", path: page.path, content: page.content }])}</article>`,
  });
}
