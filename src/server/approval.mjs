/** What Submit does. Functionality never merges itself. Member-list changes always wait for two approvers. */
export function submissionPlan({ scope, authorIsApprover }) {
  if (!scope) return { error: "There is nothing to publish yet." };
  if (scope === "functionality") {
    return { status: "awaiting_approval", requiredApprovals: 1, publish: "github_pr" };
  }
  if (scope === "members_list") {
    return { status: "awaiting_approval", requiredApprovals: 2, publish: "github_commit" };
  }
  if (scope === "public_site") {
    if (authorIsApprover) return { status: "live", requiredApprovals: 0, publish: "github_commit" };
    return { status: "awaiting_approval", requiredApprovals: 1, publish: "github_commit" };
  }
  return { status: "live", requiredApprovals: 0, publish: "blobs" };
}

export function reviewDecision({ change, actorEmail, actorIsApprover, decision }) {
  if (!actorIsApprover) return { error: "Only approvers can approve or deny." };
  if (actorEmail === change.authorEmail) return { error: "You cannot approve or deny your own change." };
  if (change.status !== "awaiting_approval") return { error: "This change is not waiting for approval." };
  if ((change.approvals || []).some((item) => item.email === actorEmail)) {
    return { error: "You already recorded a decision on this change." };
  }
  const approvals = [...(change.approvals || []), {
    email: actorEmail,
    decision,
    at: new Date().toISOString(),
  }];
  if (decision === "deny") return { status: "denied", approvals, publish: false };
  const yes = approvals.filter((item) => item.decision === "approve").length;
  const needed = change.requiredApprovals || 1;
  if (yes >= needed) return { status: "live", approvals, publish: true };
  return { status: "awaiting_approval", approvals, publish: false, remaining: needed - yes };
}
