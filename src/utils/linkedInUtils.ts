
import { Portfolio } from "@/types/portfolio";
import type { LinkedInSuggestion, LinkedInGroup, FormattedLinkedInPost } from "@/types/portfolio";

const LINKEDIN_API_VERSION = 'v2';
const LINKEDIN_BASE_URL = 'https://api.linkedin.com';

type LinkedInApiHeaders = Record<string, string>;

const getHeaders = (accessToken: string): LinkedInApiHeaders => ({
  'Authorization': `Bearer ${accessToken}`,
  'cache-control': 'no-cache',
  'X-Restli-Protocol-Version': '2.0.0'
});

export const fetchLinkedInConnections = async (accessToken: string): Promise<LinkedInSuggestion[]> => {
  const response = await fetch(
    `${LINKEDIN_BASE_URL}/${LINKEDIN_API_VERSION}/connections?q=viewer&start=0&count=10`,
    { headers: getHeaders(accessToken) }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn connections');
  }

  const data = await response.json();
  return data.elements.map((connection: any) => ({
    id: connection.id,
    name: `${connection.firstName} ${connection.lastName}`,
    title: connection.headline || '',
    relevanceScore: 0.9,
    matchedSkills: connection.skills?.slice(0, 3) || [],
    connectionDegree: connection.connectionInfo?.degree || '2nd'
  }));
};

export const fetchLinkedInGroups = async (accessToken: string): Promise<LinkedInGroup[]> => {
  const response = await fetch(
    `${LINKEDIN_BASE_URL}/${LINKEDIN_API_VERSION}/groups?q=member&start=0&count=10`,
    { headers: getHeaders(accessToken) }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn groups');
  }

  const data = await response.json();
  return data.elements.map((group: any) => ({
    id: group.id,
    name: group.name,
    memberCount: group.memberCount,
    description: group.description || '',
    relevanceScore: 0.9,
    category: group.category?.name || 'Professional',
    matchedKeywords: group.specialities?.slice(0, 3) || []
  }));
};

export const formatLinkedInPost = (portfolio: Portfolio): FormattedLinkedInPost => {
  const { items, metrics, summary } = portfolio;

  const title = `🚀 Professional Portfolio Update`;
  
  const content = `
I'm excited to share my latest professional achievements:

📊 Key Metrics:
• ${summary.totalProjects} Projects Completed
• ${Math.round(summary.avgEfficiency)}% Average Efficiency
• ${summary.topSkills.slice(0, 3).join(", ")} and more!

🎯 Recent Highlights:
${items.slice(0, 2).map(item => `
• ${item.title}
  Impact: ${Math.round(item.impact.efficiency)}% efficiency improvement
`).join('\n')}

🌟 Overall Impact:
• ${summary.overallImpact.tasksCompleted} Tasks Completed
• ${Math.round(summary.overallImpact.efficiencyImprovement)}% Efficiency Improvement
• ${Math.round(summary.overallImpact.timesSaved / 3600)} Hours Saved

Would love to connect with other professionals in ${portfolio.summary.topSkills[0]} and related fields!
  `.trim();

  const hashtags = [
    "#ProfessionalDevelopment",
    "#CareerGrowth",
    ...portfolio.summary.topSkills.map(skill => `#${skill.replace(/\s+/g, '')}`).slice(0, 3)
  ];

  return {
    title,
    content,
    hashtags,
    metrics: {
      tasks: summary.overallImpact.tasksCompleted,
      efficiency: Math.round(summary.avgEfficiency),
      impact: Math.round(summary.overallImpact.efficiencyImprovement)
    }
  };
};

export const shareOnLinkedIn = async (accessToken: string, post: FormattedLinkedInPost): Promise<void> => {
  const response = await fetch(
    `${LINKEDIN_BASE_URL}/${LINKEDIN_API_VERSION}/shares`,
    {
      method: 'POST',
      headers: {
        ...getHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner: 'urn:li:person:{person_id}',
        subject: post.title,
        text: {
          text: `${post.content}\n\n${post.hashtags.join(' ')}`
        },
        distribution: {
          linkedInDistributionTarget: {
            visibleToGuest: true
          }
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to share post on LinkedIn');
  }
};

