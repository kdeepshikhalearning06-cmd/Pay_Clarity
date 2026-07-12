export interface CountryComplianceProfile {
  country: string;
  code: string;
  implementationStatus: string;
  reportingThreshold: number;
  reportingFrequency: string;
  reportingDeadline: string;
  employeeRepresentativeRequired: boolean;
  jointAssessmentThreshold: number;
  filingAuthority: string;
  filingAuthorityNote: string;
  acceptedJustifications: string[];
  riskyJustifications: string[];
  topComplianceRisks: string[];
  requiredDocuments: string[];
  evidenceToKeep: string[];
  focusAreas: string[];
}

export const COUNTRY_PROFILES: Record<string, CountryComplianceProfile> = {
  Germany: {
    country: "Germany",
    code: "DE",
    implementationStatus: "Pending national implementation",
    reportingThreshold: 250,
    reportingFrequency: "Annual",
    reportingDeadline: "June 2026 (FY2026 cycle)",
    employeeRepresentativeRequired: true,
    jointAssessmentThreshold: 5,
    filingAuthority: "Federal Anti-Discrimination Agency",
    filingAuthorityNote:
      "Reports must be submitted annually. Joint pay assessments require works council involvement.",
    acceptedJustifications: [
      "Seniority",
      "Performance",
      "Leadership responsibilities",
      "Specialized certifications",
      "Critical skills",
    ],
    riskyJustifications: [
      "Previous salary",
      "Negotiation ability",
      "Manager discretion",
    ],
    topComplianceRisks: [
      "Pay gaps above 5%",
      "Missing justification evidence",
      "Insufficient documentation",
      "Missing works council involvement",
    ],
    requiredDocuments: [
      "Annual salary analysis by gender and job category",
      "Objective justification documentation for gaps above 5%",
      "Joint pay assessment report (if triggered)",
      "Remediation plan with timeline and measurable targets",
      "Employee pay transparency information records",
    ],
    evidenceToKeep: [
      "Salary review meeting minutes",
      "Performance evaluation records",
      "Certification and qualification records",
      "Works council consultation documentation",
      "Geographic adjustment rationale",
    ],
    focusAreas: [
      "Joint pay assessment triggers",
      "Works council involvement",
      "Documentation completeness",
      "Justification evidence quality",
    ],
  },

  Netherlands: {
    country: "Netherlands",
    code: "NL",
    implementationStatus: "Existing reporting under Wlb, EU directive pending",
    reportingThreshold: 100,
    reportingFrequency: "Annual",
    reportingDeadline: "June 30 (following reporting year)",
    employeeRepresentativeRequired: true,
    jointAssessmentThreshold: 5,
    filingAuthority: "Dutch Labour Authority (Inspectie SZW)",
    filingAuthorityNote:
      "Reports must be published on company website and submitted to the KvK.",
    acceptedJustifications: [
      "Seniority",
      "Performance",
      "Education level",
      "Market premium for specific roles",
      "Geographic adjustments",
    ],
    riskyJustifications: [
      "Previous salary",
      "Negotiation skills",
      "Internal politics",
    ],
    topComplianceRisks: [
      "Employee categorisation accuracy",
      "Reporting cycle compliance",
      "Supporting documentation gaps",
      "Explanation quality insufficient",
    ],
    requiredDocuments: [
      "Annual gender pay gap report",
      "Pay structure documentation by job category",
      "Objective justification records for gaps above 5%",
      "Remediation action plan (if required)",
      "Website publication confirmation",
    ],
    evidenceToKeep: [
      "Job category classification records",
      "Salary band documentation",
      "Performance review evidence",
      "Works council consultation records",
      "Market benchmark data",
    ],
    focusAreas: [
      "Employee categorisation accuracy",
      "Reporting cycle compliance",
      "Supporting documentation",
      "Explanation quality",
    ],
  },

  Denmark: {
    country: "Denmark",
    code: "DK",
    implementationStatus: "Active since 2022, EU directive enhancements pending",
    reportingThreshold: 250,
    reportingFrequency: "Annual",
    reportingDeadline: "June 1 (annually)",
    employeeRepresentativeRequired: true,
    jointAssessmentThreshold: 5,
    filingAuthority: "Danish Working Environment Authority",
    filingAuthorityNote:
      "Pay gap data must be published on the designated government portal.",
    acceptedJustifications: [
      "Seniority",
      "Performance",
      "Qualifications",
      "Market conditions",
      "Geographic adjustments",
    ],
    riskyJustifications: [
      "Previous salary history",
      "Individual bargaining power",
      "Manager preference",
    ],
    topComplianceRisks: [
      "Employee representative involvement",
      "Pay category quality",
      "Annual reporting readiness",
      "Documentation completeness",
    ],
    requiredDocuments: [
      "Annual gender pay gap report",
      "Pay data by gender and job category",
      "Objective justification documentation for gaps above 5%",
      "Government portal submission confirmation",
      "Remediation plan (if required)",
    ],
    evidenceToKeep: [
      "Pay category classification records",
      "Employee representative consultation logs",
      "Salary adjustment documentation",
      "Performance evaluation records",
      "Portal submission receipts",
    ],
    focusAreas: [
      "Employee representative involvement",
      "Pay category quality",
      "Annual reporting readiness",
      "Documentation completeness",
    ],
  },

  Sweden: {
    country: "Sweden",
    code: "SE",
    implementationStatus: "Active since 2017, EU directive integration in progress",
    reportingThreshold: 25,
    reportingFrequency: "Annual survey, triennial action plan",
    reportingDeadline: "Annual (calendar year cycle)",
    employeeRepresentativeRequired: true,
    jointAssessmentThreshold: 0,
    filingAuthority: "Swedish Discrimination Ombudsman (DO)",
    filingAuthorityNote:
      "All pay differences must be investigated and justified. No threshold for investigation.",
    acceptedJustifications: [
      "Seniority",
      "Performance",
      "Qualifications",
      "Market conditions",
      "Job complexity",
    ],
    riskyJustifications: [
      "Previous salary",
      "Negotiation ability",
      "Un documented manager decisions",
    ],
    topComplianceRisks: [
      "Salary review documentation gaps",
      "Equal pay assessment preparation",
      "Evidence retention issues",
      "Category consistency across years",
    ],
    requiredDocuments: [
      "Annual gender pay gap survey",
      "Equal pay action plan (50+ employees)",
      "Job classification and comparison documentation",
      "Objective justification for all pay differences",
      "Remediation progress reports",
    ],
    evidenceToKeep: [
      "Salary review documentation",
      "Job evaluation records",
      "Trade union consultation records",
      "Action plan progress tracking",
      "Historical pay survey data",
    ],
    focusAreas: [
      "Salary review documentation",
      "Equal pay assessment preparation",
      "Evidence retention",
      "Category consistency",
    ],
  },

  Finland: {
    country: "Finland",
    code: "FI",
    implementationStatus: "Existing equality planning, EU directive integration expected by 2026",
    reportingThreshold: 30,
    reportingFrequency: "Annual pay survey, equality plan every 2 years",
    reportingDeadline: "Annual (equality plan biennial)",
    employeeRepresentativeRequired: true,
    jointAssessmentThreshold: 0,
    filingAuthority: "Occupational Safety and Health Administration (OSHA)",
    filingAuthorityNote:
      "Pay survey results must be included in the equality plan. Employee representatives participate.",
    acceptedJustifications: [
      "Seniority",
      "Performance",
      "Qualifications",
      "Job demands",
      "Market conditions",
    ],
    riskyJustifications: [
      "Previous salary",
      "Negotiation ability",
      "Undocumented pay decisions",
    ],
    topComplianceRisks: [
      "Equality planning documentation gaps",
      "Compensation transparency issues",
      "Internal pay process inconsistency",
      "Employee representative participation",
    ],
    requiredDocuments: [
      "Annual pay survey results",
      "Equality plan with pay gap analysis",
      "Objective justification documentation",
      "Employee representative consultation records",
      "Remediation measures and progress tracking",
    ],
    evidenceToKeep: [
      "Pay survey documentation",
      "Equality plan records",
      "Employee representative meeting minutes",
      "Salary adjustment documentation",
      "Performance evaluation records",
    ],
    focusAreas: [
      "Equality planning documentation",
      "Compensation transparency",
      "Internal pay process consistency",
    ],
  },
};

export function getCountryProfile(country: string): CountryComplianceProfile | undefined {
  return COUNTRY_PROFILES[country];
}

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_PROFILES);
