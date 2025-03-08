export const positions = [
  // Strategy & Leadership
  "Chief Technology Officer",
  "Chief Product Officer",
  "Chief Strategy Officer",
  "VP of Engineering",
  "VP of Product",
  "Director of Operations",
  "Finance Manager",
  "Compliance Officer",
  "Administrative Director",
  
  // Product & Design
  "Product Manager",
  "Product Designer",
  "UX Researcher",
  "UI Designer",
  "Design Systems Engineer",
  "Information Architect",
  "Product Strategy Lead",
  
  // Data Engineering
  "Data Architect",
  "Data Engineer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Analytics Engineer",
  "Business Intelligence Developer",
  "Database Administrator",
  
  // Software Development
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Cloud Solutions Architect",
  "Software Architect",
  
  // Engagement
  "Growth Manager",
  "Marketing Strategist",
  "User Research Lead",
  "Community Manager",
  "Sales Engineer",
  "Customer Success Manager",
  "Developer Relations Engineer",
] as const;

export const availabilityOptions = [
  { value: 10, label: "Minimal (10 hours)" },
  { value: 20, label: "Part-time (20 hours)" },
  { value: 30, label: "Extended (30 hours)" },
  { value: 40, label: "Full-time (40 hours)" },
  { value: -1, label: "Custom hours" },
] as const;

export const membershipStatusOptions = [
  "Current contributing member",
  "New applicant", 
  "Partner organization",
  "Advisor",
  "Former member",
  "Guest contributor"
] as const;
