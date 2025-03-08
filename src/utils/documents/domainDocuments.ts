
import { DomainCategory, domainSpecificDocuments } from "./types";

// Generate domain-specific document
export const generateDomainSpecificDocument = (
  domain: DomainCategory,
  documentType: string,
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): string => {
  // Common header format for all domain-specific documents
  const header = `# ${documentType.charAt(0).toUpperCase() + documentType.slice(1).replace(/-/g, " ")}: ${projectTitle}

## Domain: ${domain.charAt(0).toUpperCase() + domain.slice(1).replace(/-/g, " ")}
## Overview
${projectDescription}

## Priority
${priority.toUpperCase()}

## Timeline
Deadline: ${deadline}

`;

  // Custom content based on domain and document type
  let content = "";
  
  if (domain === "strategy") {
    if (documentType === "market-analysis") {
      content = `## Market Analysis
- Current market size and trends
- Competitor landscape
- Target audience demographics
- Growth opportunities
- Potential challenges

## Recommendations
- Key strategic initiatives
- Market positioning
- Growth strategy
- Resource allocation
`;
    } else if (documentType === "competitive-landscape") {
      content = `## Competitors
- Direct competitors
- Indirect competitors
- Strengths and weaknesses analysis
- Market share distribution
- Competitive advantages

## Differentiation Strategy
- Unique value propositions
- Feature comparison
- Pricing strategy
- Market positioning
`;
    } else if (documentType === "strategic-roadmap") {
      content = `## Strategic Goals
- Short-term objectives (3 months)
- Medium-term objectives (6-12 months)
- Long-term vision (1-3 years)

## Key Milestones
- Phase 1: Initial market entry
- Phase 2: Market expansion
- Phase 3: Diversification
- Phase 4: Optimization and scaling

## Resource Requirements
- Team composition
- Budget allocation
- Technology stack
- Third-party partnerships
`;
    }
  } else if (domain === "data-engineering") {
    if (documentType === "data-schema") {
      content = `## Data Models
- Entity relationships
- Attribute definitions
- Data types and constraints
- Indexing strategy

## Schema Design
- Normalization level
- Partitioning strategy
- Scalability considerations
- Migration path
`;
    } else if (documentType === "etl-workflow") {
      content = `## ETL Processes
- Data sources
- Extraction methods
- Transformation rules
- Loading procedures
- Scheduling and frequency

## Data Quality
- Validation rules
- Error handling
- Data cleansing procedures
- Monitoring metrics
`;
    } else if (documentType === "data-governance-plan") {
      content = `## Governance Framework
- Data ownership
- Access controls
- Compliance requirements
- Retention policies
- Audit procedures

## Data Security
- Encryption methods
- Anonymization procedures
- Access logs
- Vulnerability assessment
`;
    }
  } else if (domain === "engagement") {
    if (documentType === "communication-plan") {
      content = `## Communication Channels
- Primary and secondary channels
- Communication frequency
- Escalation pathways
- Reporting structure

## Stakeholder Engagement
- Communication templates
- Meeting schedules
- Status reporting cadence
- Feedback mechanisms
`;
    } else if (documentType === "stakeholder-matrix") {
      content = `## Key Stakeholders
- Decision makers
- Influencers
- End users
- Technical teams
- Support teams

## Engagement Strategy
- Stakeholder needs and expectations
- Communication preferences
- Engagement frequency
- Success metrics
`;
    } else if (documentType === "client-feedback-process") {
      content = `## Feedback Collection
- Feedback channels
- Survey methodology
- Interview process
- Metrics tracking

## Implementation Process
- Feedback prioritization
- Action item assignment
- Implementation timeline
- Success validation
`;
    }
  } else if (domain === "frontend" || domain === "product-design") {
    // Generic content for other domains if specific content not defined
    content = `## Key Components
- Component 1: Description and requirements
- Component 2: Description and requirements
- Component 3: Description and requirements

## Implementation Details
- Technical approach
- Libraries and frameworks
- Integration points
- Performance considerations

## Testing Strategy
- Unit testing approach
- Integration testing plan
- User acceptance criteria
- Performance benchmarks

## Risks and Mitigations
- Identified risks
- Mitigation strategies
- Contingency plans
`;
  }

  return header + content;
};

// Create all domain-specific documents for a domain
export const createDomainSpecificDocuments = (
  domain: DomainCategory,
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): Record<string, string> => {
  const documents: Record<string, string> = {};
  
  const documentTypes = domainSpecificDocuments[domain] || [];
  
  documentTypes.forEach(documentType => {
    documents[documentType] = generateDomainSpecificDocument(
      domain,
      documentType,
      projectTitle,
      projectDescription,
      priority,
      deadline
    );
  });
  
  return documents;
};
