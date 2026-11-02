const RULES = [
  { re: /\b\d{3}[-\s]\d{3}[-\s]\d{3}\b/, reason: "That looks like a social insurance number." },
  { re: /\b(?:PHN|personal health number|health card(?: number)?|medical record number|MRN)\b/i, reason: "That looks like a health-record identifier." },
  { re: /\b(?:date of birth|DOB)\b\s*[:\-]?\s*\d/i, reason: "That looks like a date of birth." },
  { re: /\bdiagnos(?:is|ed)\b\s*[:\-]\s*\S+/i, reason: "That looks like a diagnosis." },
];

export function phiWarning(text) {
  const sample = String(text || "").slice(0, 200000);
  for (const rule of RULES) {
    if (rule.re.test(sample)) {
      return `${rule.reason} Patient-identifiable information must not be put on this site, including the members area.`;
    }
  }
  return "";
}

export function phiInOperations(operations) {
  for (const operation of operations || []) {
    const hit = phiWarning(`${operation.path || ""}\n${operation.content || ""}`);
    if (hit) return hit;
  }
  return "";
}
