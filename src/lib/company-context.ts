export const COMPANY = {
  name: "Acme Technologies GmbH",
  assessmentName: "FY2026 Pay Transparency Assessment",
  assessmentStatus: "In Progress" as const,
  country: "Germany",
  countryCode: "DE",
  countries: [
    { code: "DE", name: "Germany" },
    { code: "ES", name: "Spain" },
    { code: "NL", name: "Netherlands" },
  ],
  industry: "Technology",
  companySize: "250-500",
  currency: "EUR",
  fiscalYear: "FY2026",
  readiness: 82,
  employees: 184,
  overallGap: 4.7,
  medianGap: 3.9,
  assessmentDate: "March 12, 2026",
  reportsGenerated: 5,
};

export const COUNTRY_NAMES: Record<string, string> = {
  DE: "Germany",
  NL: "Netherlands",
  ES: "Spain",
  FR: "France",
  IT: "Italy",
  SE: "Sweden",
  DK: "Denmark",
  FI: "Finland",
};

export function countryNames(codes: string[]): string[] {
  return codes.map((c) => COUNTRY_NAMES[c] ?? c);
}

export function countryBadges(codes: string[]): string {
  return countryNames(codes).join(" · ");
}
