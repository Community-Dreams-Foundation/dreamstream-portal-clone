
import { StandardDocumentType } from "./types";

// Generate standard documents for a domain
export const generateStandardDocument = (
  documentType: StandardDocumentType,
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): string => {
  switch (documentType) {
    case "project-charter":
      return `# Project Charter: ${projectTitle}

## Overview
${projectDescription}

## Objectives
- Successfully implement the ${projectTitle} project
- Deliver key functionalities on time
- Ensure high quality and reliability

## Timeline
Deadline: ${deadline}

## Priority
${priority.toUpperCase()}

## Stakeholders
- Project Manager
- Development Team
- QA Team
- Business Stakeholders

## Success Criteria
- All features implemented according to specifications
- Passing all quality assurance tests
- Meeting the deadline of ${deadline}
`;

    case "prd":
      return `# Product Requirements Document: ${projectTitle}

## Introduction
${projectDescription}

## Problem Statement
This project aims to address key challenges in our current workflow and improve overall efficiency.

## User Stories
1. As a user, I want to easily navigate the interface
2. As a user, I want to efficiently complete my tasks
3. As a user, I want to track my progress

## Requirements
### Functional Requirements
- Implement core functionality
- Create intuitive user interface
- Ensure data persistence

### Non-functional Requirements
- Performance: System should respond within 2 seconds
- Scalability: Support up to 1000 concurrent users
- Security: Implement proper authentication and authorization

## Timeline
Deadline: ${deadline}
Priority: ${priority.toUpperCase()}
`;

    case "execution-calendar":
      return `# 10-Day Execution Calendar: ${projectTitle}

## Overview
This calendar outlines the key milestones and deliverables for the next 10 working days.

## Priority
${priority.toUpperCase()}

## Timeline
Final Deadline: ${deadline}

## Daily Schedule

### Day 1
- Project kickoff meeting
- Define detailed requirements
- Set up development environment

### Day 2
- Backend architecture design
- Database schema creation
- API endpoint planning

### Day 3
- Frontend component design
- UI/UX wireframing
- Initial backend implementation

### Day 4-5
- Core functionality development
- Database integration
- API implementation

### Day 6-7
- Frontend implementation
- Integration with backend
- Initial testing

### Day 8
- Bug fixes and refinements
- Performance optimization
- User acceptance testing preparation

### Day 9
- User acceptance testing
- Documentation
- Final adjustments

### Day 10
- Final QA checks
- Deployment preparation
- Project handover
`;

    case "sprint-plan":
      return `# Sprint Plan: ${projectTitle}

## Sprint Goal
Deliver a working prototype of ${projectTitle} with core functionality.

## Project Overview
${projectDescription}

## Priority
${priority.toUpperCase()}

## Timeline
Sprint End Date: ${deadline}

## User Stories
- Implement user authentication
- Create main dashboard interface
- Develop core functionality modules
- Implement data persistence layer
- Create reporting functionality

## Tasks Breakdown
- Set up project repository and development environments
- Create database schema and migrations
- Implement authentication services
- Design and implement UI components
- Integrate frontend with backend services
- Implement automated tests
- Conduct code reviews
- Document APIs and components

## Team Allocation
- 2 Frontend Developers
- 2 Backend Developers
- 1 QA Engineer
- 1 Product Manager

## Definition of Done
- Code is completed and reviewed
- Tests are written and passing
- Documentation is updated
- Feature is deployed to staging environment
- QA approval is obtained
`;
    
    default:
      return `# ${documentType}: ${projectTitle}\n\n${projectDescription}\n\nPriority: ${priority}\nDeadline: ${deadline}`;
  }
};

// Create all standard documents for a project
export const createAllStandardDocuments = (
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): Record<StandardDocumentType, string> => {
  return {
    "project-charter": generateStandardDocument("project-charter", projectTitle, projectDescription, priority, deadline),
    "prd": generateStandardDocument("prd", projectTitle, projectDescription, priority, deadline),
    "execution-calendar": generateStandardDocument("execution-calendar", projectTitle, projectDescription, priority, deadline),
    "sprint-plan": generateStandardDocument("sprint-plan", projectTitle, projectDescription, priority, deadline)
  };
};
