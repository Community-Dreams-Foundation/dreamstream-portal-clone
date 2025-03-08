
import type { Portfolio, GitHubContent } from "@/types/portfolio";
import { getDatabase, ref, set } from "firebase/database";

export const generateGitHubReadme = (portfolio: Portfolio): string => {
  const { summary, items } = portfolio;
  
  return `# ${portfolio.metadata.title}

## About Me
${portfolio.metadata.description}

## Skills
${summary.topSkills.map(skill => `- ${skill}`).join('\n')}

## Impact & Metrics
- Completed ${summary.overallImpact.tasksCompleted} tasks
- Improved efficiency by ${summary.overallImpact.efficiencyImprovement}%
- Saved ${summary.overallImpact.timesSaved} hours through optimization

## Project Highlights
${items.map(item => `
### ${item.title}
${item.description}

**Impact:**
- Time Efficiency: ${item.impact.timeEfficiency}%
- Tasks Completed: ${item.impact.tasksCompleted}
- Efficiency Improvement: ${item.impact.efficiency}%

**Key Achievements:**
${item.achievements.map(achievement => `- ${achievement}`).join('\n')}
`).join('\n')}
`;
};

export const generatePortfolioPage = (portfolio: Portfolio): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolio.metadata.title} - Portfolio</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
  <main class="max-w-4xl mx-auto py-12 px-4">
    <h1 class="text-4xl font-bold mb-8">${portfolio.metadata.title}</h1>
    <p class="text-lg text-gray-600 mb-12">${portfolio.metadata.description}</p>
    
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Skills</h2>
      <div class="flex flex-wrap gap-2">
        ${portfolio.summary.topSkills.map(skill => 
          `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">${skill}</span>`
        ).join('')}
      </div>
    </section>
    
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Impact Metrics</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-white rounded-lg shadow">
          <p class="text-sm text-gray-500">Tasks Completed</p>
          <p class="text-3xl font-bold">${portfolio.summary.overallImpact.tasksCompleted}</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow">
          <p class="text-sm text-gray-500">Efficiency Improvement</p>
          <p class="text-3xl font-bold">${portfolio.summary.overallImpact.efficiencyImprovement}%</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow">
          <p class="text-sm text-gray-500">Time Saved</p>
          <p class="text-3xl font-bold">${portfolio.summary.overallImpact.timesSaved}h</p>
        </div>
      </div>
    </section>
    
    <section>
      <h2 class="text-2xl font-semibold mb-6">Projects</h2>
      ${portfolio.items.map(item => `
        <div class="mb-8 p-6 bg-white rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-2">${item.title}</h3>
          <p class="text-gray-600 mb-4">${item.description}</p>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-500">Time Efficiency</p>
              <p class="font-semibold">${item.impact.timeEfficiency}%</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Tasks Completed</p>
              <p class="font-semibold">${item.impact.tasksCompleted}</p>
            </div>
          </div>
          <div>
            <h4 class="font-medium mb-2">Achievements</h4>
            <ul class="list-disc list-inside text-gray-600">
              ${item.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('')}
    </section>
  </main>
</body>
</html>`;
};

export const saveGitHubContent = async (
  userId: string,
  content: GitHubContent
): Promise<void> => {
  const db = getDatabase();
  const githubContentRef = ref(db, `users/${userId}/github-portfolio`);
  
  await set(githubContentRef, {
    ...content,
    updatedAt: Date.now()
  });
};

export const generateGitHubContent = (portfolio: Portfolio): GitHubContent => {
  const readmeContent = generateGitHubReadme(portfolio);
  const portfolioPage = generatePortfolioPage(portfolio);
  const repositoryName = `${portfolio.metadata.title.toLowerCase().replace(/\s+/g, '-')}-portfolio`;
  
  return {
    readmeContent,
    portfolioPage,
    repositoryName,
    commitMessage: `Update portfolio content - ${new Date().toISOString()}`
  };
};
