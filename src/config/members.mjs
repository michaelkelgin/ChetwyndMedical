/**
 * People allowed to sign in. Emails are matched case-insensitively.
 * Approver roles: chief_of_staff, executive, coordinator.
 * Edit this list and publish it through the members-list approval flow
 * (two approvers) rather than changing access by hand on the server.
 */
export const MEMBERS = [
  { email: "alvin443@yahoo.com", role: "member", name: "Dr Alvin Silva" },
  { email: "drswanson@nnwc.ca", role: "member", name: "Dr Vanessa Swanson" },
  { email: "bron.finkelstein@gmail.com", role: "member", name: "Dr Bron Finkelstein" },
  { email: "Landon.sayler@dal.ca", role: "chief_of_staff", name: "Dr Landon Bryce Sayler" },
  { email: "rafalbanas7@gmail.com", role: "executive", name: "Dr Rafal Banas" },
  { email: "odunalakaye@gmail.com", role: "executive", name: "Dr Johnson Alakaye" },
  { email: "onums82@gmail.com", role: "member", name: "Dr Chikezie Ononiwu" },
  { email: "michaelkelgin@gmail.com", role: "executive", name: "Dr Michael Haldorson" },
  { email: "yonabeth77@gmail.com", role: "member", name: "Dr Yonabeth Nava De Escalante" },
  { email: "kassie2mayol@gmail.com", role: "coordinator", name: "Kassandra Mayol" },
];

export const APPROVER_ROLES = new Set(["chief_of_staff", "executive", "coordinator"]);

export function findMember(email) {
  const needle = String(email || "").trim().toLowerCase();
  if (!needle) return null;
  const found = MEMBERS.find((person) => person.email.toLowerCase() === needle);
  if (!found) return null;
  return {
    email: found.email.toLowerCase(),
    displayEmail: found.email,
    role: found.role,
    name: found.name || found.email,
    approver: APPROVER_ROLES.has(found.role),
  };
}

export function listApprovers() {
  return MEMBERS.filter((person) => APPROVER_ROLES.has(person.role)).map((person) => person.email.toLowerCase());
}
