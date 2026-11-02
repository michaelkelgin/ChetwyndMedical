import assert from "node:assert/strict";
import test from "node:test";
import { findMember } from "../src/config/members.mjs";
import { submissionPlan, reviewDecision } from "../src/server/approval.mjs";
import { handleRequest } from "../src/server/handler.mjs";
import { phiWarning } from "../src/server/phi.mjs";
import { readSession, signSession } from "../src/server/session.mjs";
import { classifyPath, validateOperations } from "../src/server/scope.mjs";
import { createMemoryStores } from "../src/server/store.mjs";

const env = {
  CMSA_DEV: "1",
  CMSA_AI: "stub",
  ALLOW_DEV_MAGIC_LINK: "true",
  SESSION_SECRET: "test-secret-value-123",
  SITE_URL: "http://127.0.0.1:4173",
  CMSA_ROOT: process.cwd(),
};

function post(path, body, cookie) {
  return new Request(`http://127.0.0.1:4173${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://127.0.0.1:4173",
      ...(cookie ? { cookie: `cmsa_session=${cookie}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function signIn(stores, email) {
  const request = await handleRequest(post("/api/auth/request", { email }), { stores, env });
  const body = await request.json();
  assert.ok(body.devLink, email);
  const verify = await handleRequest(new Request(body.devLink), { stores, env });
  const setCookie = verify.headers.get("set-cookie") || "";
  const cookie = setCookie.split(";")[0].replace("cmsa_session=", "");
  return cookie;
}

test("allow-list is case-insensitive and roles mark approvers", () => {
  assert.equal(findMember("  MichaelKelgin@gmail.com ").role, "executive");
  assert.equal(findMember("MICHAELKELGIN@GMAIL.COM").approver, true);
  assert.equal(findMember("kassie2mayol@gmail.com").name, "Kassandra Mayol");
  assert.equal(findMember("Landon.Sayler@dal.ca").role, "chief_of_staff");
  assert.equal(findMember("alvin443@yahoo.com").approver, false);
  assert.equal(findMember("nobody@example.com"), null);
});

test("session cookie round trip rejects a bad signature", () => {
  const token = signSession("michaelkelgin@gmail.com", env.SESSION_SECRET, 60);
  assert.equal(readSession(token, env.SESSION_SECRET).email, "michaelkelgin@gmail.com");
  assert.equal(readSession(`${token}x`, env.SESSION_SECRET), null);
});

test("scope comes from paths and unsafe paths are refused", () => {
  assert.equal(classifyPath("members/pages/roster.md"), "members_area");
  assert.equal(classifyPath("content/public/notice.md"), "public_site");
  assert.equal(classifyPath("src/server/handler.mjs"), "functionality");
  assert.equal(classifyPath("src/config/members.mjs"), "members_list");
  assert.throws(() => classifyPath("../.env"));
  const mixed = validateOperations([
    { op: "write", path: "members/pages/a.md", content: "# A" },
    { op: "write", path: "content/public/b.md", content: "# B" },
  ]);
  assert.equal(mixed.scope, "public_site");
});

test("approval plan matches the staff rules", () => {
  assert.equal(submissionPlan({ scope: "members_area", authorIsApprover: false }).status, "live");
  assert.equal(submissionPlan({ scope: "public_site", authorIsApprover: true }).status, "live");
  assert.equal(submissionPlan({ scope: "public_site", authorIsApprover: false }).requiredApprovals, 1);
  assert.equal(submissionPlan({ scope: "functionality", authorIsApprover: true }).publish, "github_pr");
  assert.equal(submissionPlan({ scope: "members_list", authorIsApprover: true }).requiredApprovals, 2);
  const own = reviewDecision({
    change: { status: "awaiting_approval", authorEmail: "a@b.c", approvals: [], requiredApprovals: 1 },
    actorEmail: "a@b.c",
    actorIsApprover: true,
    decision: "approve",
  });
  assert.equal(own.error.includes("own"), true);
});

test("patient-looking text is refused", () => {
  assert.match(phiWarning("PHN 9999999999"), /health-record/i);
  assert.equal(phiWarning("The members on-call roster for December."), "");
});

test("magic link is single use and unknown emails stay private", async () => {
  const stores = createMemoryStores();
  const hidden = await handleRequest(post("/api/auth/request", { email: "nobody@example.com" }), { stores, env });
  const hiddenBody = await hidden.json();
  assert.equal(hiddenBody.devLink, undefined);
  const cookie = await signIn(stores, "alvin443@yahoo.com");
  assert.ok(readSession(cookie, env.SESSION_SECRET));
  const again = await handleRequest(post("/api/auth/request", { email: "alvin443@yahoo.com" }), { stores, env });
  const link = (await again.json()).devLink;
  await handleRequest(new Request(link), { stores, env });
  const reused = await handleRequest(new Request(link), { stores, env });
  assert.equal(reused.status, 400);
});

test("member publishes a members page immediately and cannot self-approve a public change", async () => {
  const stores = createMemoryStores();
  const member = await signIn(stores, "alvin443@yahoo.com");
  const created = await handleRequest(post("/api/changes", { message: "Add a members page for the December on-call roster." }, member), { stores, env });
  const { change } = await created.json();
  assert.equal(change.scope, "members_area");
  const submitted = await handleRequest(post(`/api/changes/${change.id}/submit`, {}, member), { stores, env });
  const live = (await submitted.json()).change;
  assert.equal(live.status, "live");
  const page = await stores.records.get("page:members/pages/note.md");
  assert.match(page.content, /December on-call roster/);

  const publicDraft = await handleRequest(post("/api/changes", { message: "Please update the public homepage notice." }, member), { stores, env });
  const pub = (await publicDraft.json()).change;
  assert.equal(pub.scope, "public_site");
  const waiting = await handleRequest(post(`/api/changes/${pub.id}/submit`, {}, member), { stores, env });
  assert.equal((await waiting.json()).change.status, "awaiting_approval");
  const self = await handleRequest(post(`/api/changes/${pub.id}/approve`, {}, member), { stores, env });
  assert.equal(self.status, 403);
  const approver = await signIn(stores, "kassie2mayol@gmail.com");
  const approved = await handleRequest(post(`/api/changes/${pub.id}/approve`, {}, approver), { stores, env });
  const published = (await approved.json()).change;
  assert.equal(published.status, "live");
  assert.equal(published.publish.mode, "dry-run");
});

test("member list changes need two approvers who are not the author", async () => {
  const stores = createMemoryStores();
  const author = await signIn(stores, "michaelkelgin@gmail.com");
  const created = await handleRequest(post("/api/changes", { message: "Update the allowlist of who can sign in." }, author), { stores, env });
  const change = (await created.json()).change;
  assert.equal(change.scope, "members_list");
  const submitted = await handleRequest(post(`/api/changes/${change.id}/submit`, {}, author), { stores, env });
  assert.equal((await submitted.json()).change.status, "awaiting_approval");
  const own = await handleRequest(post(`/api/changes/${change.id}/approve`, {}, author), { stores, env });
  assert.equal(own.status, 403);
  const first = await signIn(stores, "kassie2mayol@gmail.com");
  const once = await handleRequest(post(`/api/changes/${change.id}/approve`, {}, first), { stores, env });
  assert.equal((await once.json()).change.status, "awaiting_approval");
  const second = await signIn(stores, "Landon.sayler@dal.ca");
  const done = await handleRequest(post(`/api/changes/${change.id}/approve`, {}, second), { stores, env });
  assert.equal((await done.json()).change.status, "live");
});

test("code changes open a pull request instead of merging", async () => {
  const stores = createMemoryStores();
  const author = await signIn(stores, "michaelkelgin@gmail.com");
  const created = await handleRequest(post("/api/changes", { message: "Fix a bug in the login code." }, author), { stores, env });
  const change = (await created.json()).change;
  assert.equal(change.scope, "functionality");
  const submitted = await handleRequest(post(`/api/changes/${change.id}/submit`, {}, author), { stores, env });
  const body = await submitted.json();
  assert.equal(body.change.status, "awaiting_approval");
  assert.equal(body.change.publish.pullRequest, true);
});

test("rate limit blocks a sixth link for one email", async () => {
  const stores = createMemoryStores();
  for (let i = 0; i < 5; i += 1) {
    const response = await handleRequest(post("/api/auth/request", { email: "onums82@gmail.com" }), { stores, env });
    assert.equal(response.status, 200);
  }
  const blocked = await handleRequest(post("/api/auth/request", { email: "onums82@gmail.com" }), { stores, env });
  assert.equal(blocked.status, 429);
});
