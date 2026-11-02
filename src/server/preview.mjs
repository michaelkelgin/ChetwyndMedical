function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));
}

function inline(text) {
  return esc(text).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, (_match, label, href) => {
    return `<a href="${href}">${label}</a>`;
  });
}

export function markdownToHtml(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let list = false;
  const closeList = () => {
    if (list) html.push("</ul>");
    list = false;
  };
  for (const line of lines) {
    if (!line.trim()) {
      closeList();
      continue;
    }
    if (line.startsWith("- ")) {
      if (!list) html.push("<ul>");
      list = true;
      html.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    closeList();
    if (line.startsWith("### ")) html.push(`<h3>${inline(line.slice(4))}</h3>`);
    else if (line.startsWith("## ")) html.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith("# ")) html.push(`<h1>${inline(line.slice(2))}</h1>`);
    else html.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return html.join("\n");
}

export function renderPreviewDocument(operations) {
  if (!operations || !operations.length) return "<p>No file changes in this revision.</p>";
  return operations.map((operation) => {
    if (operation.op === "delete") return `<article><h2>${esc(operation.path)}</h2><p>This file would be removed.</p></article>`;
    const body = operation.path.endsWith(".md")
      ? markdownToHtml(operation.content)
      : `<pre>${esc(operation.content)}</pre>`;
    return `<article><h2>${esc(operation.path)}</h2>${body}</article>`;
  }).join("\n");
}
