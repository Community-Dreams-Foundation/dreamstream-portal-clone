
// Domain categories
export type DomainCategory = "strategy" | "data-engineering" | "frontend" | "product-design" | "engagement";

// Standard document types that should be created for every domain
export type StandardDocumentType = "project-charter" | "prd" | "execution-calendar" | "sprint-plan";

// Domain-specific document mapping
export const domainSpecificDocuments: Record<DomainCategory, string[]> = {
  "strategy": ["market-analysis", "competitive-landscape", "strategic-roadmap"],
  "data-engineering": ["data-schema", "etl-workflow", "data-governance-plan"],
  "frontend": ["ui-mockups", "component-library", "accessibility-guidelines"],
  "product-design": ["design-system", "user-flow", "ux-research-findings"],
  "engagement": ["communication-plan", "stakeholder-matrix", "client-feedback-process"]
};
