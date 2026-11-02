const ADMIN = "Admin@chetwyndmedical.ca";

export function siteUrl(env) {
  return (env.SITE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
}

export async function sendEmail(env, { to, subject, text }) {
  const recipients = [...new Set((Array.isArray(to) ? to : [to]).filter(Boolean))];
  const results = [];
  for (const recipient of recipients) {
    console.log(`[cmsa email] to=${recipient} subject=${subject}\n${text}`);
    if (!env.RESEND_API_KEY) {
      results.push({ to: recipient, mode: "console", ok: true });
      continue;
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || "Chetwynd Medical Staff <onboarding@resend.dev>",
        to: [recipient],
        subject,
        text,
      }),
    });
    results.push({ to: recipient, mode: "resend", ok: response.ok, status: response.status });
  }
  return results;
}

export async function notifyChange(env, { change, kind }) {
  const link = `${siteUrl(env)}/members/updates/${change.id}/`;
  const summary = `${change.title} (${change.scope || "unclassified"}, ${change.status}). ${link}`;
  const admin = await sendEmail(env, {
    to: ADMIN,
    subject: `Website update ${kind}: ${change.title}`,
    text: `A Chetwynd Medical website change was ${kind}.\n\n${summary}\n\nAuthor: ${change.authorEmail}`,
  });
  let approvers = [];
  if (change.status === "awaiting_approval") {
    const { listApprovers } = await import("../config/members.mjs");
    const decided = new Set((change.approvals || []).map((item) => item.email));
    const recipients = listApprovers().filter((email) => email !== change.authorEmail && !decided.has(email));
    approvers = await sendEmail(env, {
      to: recipients,
      subject: `Approval needed: ${change.title}`,
      text: `This change needs ${change.requiredApprovals} approver(s) who are not the author.\n\n${summary}`,
    });
  }
  return [...admin, ...approvers];
}
