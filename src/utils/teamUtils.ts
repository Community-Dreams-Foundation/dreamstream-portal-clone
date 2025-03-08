
import { getDatabase, ref, get, set, update } from "firebase/database";
import type { Team, LeadershipDomain } from "@/types/leadership";

export const createTeam = async (
  userId: string,
  domain: LeadershipDomain,
  maxMembers: number = 5
): Promise<Team> => {
  const db = getDatabase();
  const teamRef = ref(db, `teams/${domain}`);
  
  const newTeam: Team = {
    id: `team-${Date.now()}`,
    domain,
    captainId: userId,
    memberIds: [userId],
    maxMembers,
    createdAt: Date.now(),
    performance: {
      averageTaskCompletion: 0,
      teamEfficiency: 0,
      innovationScore: 0,
      collaborationRate: 0,
      communicationScore: 0,
      projectSuccessRate: 0
    }
  };

  await set(ref(db, `teams/${newTeam.id}`), newTeam);
  return newTeam;
};

export const addTeamMember = async (teamId: string, userId: string): Promise<boolean> => {
  const db = getDatabase();
  const teamRef = ref(db, `teams/${teamId}`);
  const teamSnapshot = await get(teamRef);
  
  if (!teamSnapshot.exists()) {
    throw new Error("Team not found");
  }
  
  const team = teamSnapshot.val() as Team;
  if (team.memberIds.length >= team.maxMembers) {
    throw new Error("Team is at maximum capacity");
  }
  
  if (team.memberIds.includes(userId)) {
    throw new Error("User is already a team member");
  }
  
  const updatedMembers = [...team.memberIds, userId];
  await update(teamRef, { memberIds: updatedMembers });
  return true;
};

export const updateTeamPerformance = async (
  teamId: string,
  performanceMetrics: Team["performance"]
): Promise<void> => {
  const db = getDatabase();
  await update(ref(db, `teams/${teamId}/performance`), performanceMetrics);
};

export const getDomainTeams = async (domain: LeadershipDomain): Promise<Team[]> => {
  const db = getDatabase();
  const teamsRef = ref(db, 'teams');
  const snapshot = await get(teamsRef);
  
  if (!snapshot.exists()) return [];
  
  const teams = Object.values(snapshot.val() as Record<string, Team>);
  return teams.filter(team => team.domain === domain);
};

export const getTeamPerformance = async (teamId: string): Promise<Team["performance"]> => {
  const db = getDatabase();
  const performanceRef = ref(db, `teams/${teamId}/performance`);
  const snapshot = await get(performanceRef);
  
  if (!snapshot.exists()) {
    throw new Error("Team performance data not found");
  }
  
  return snapshot.val();
};

export const validateDomainExpertise = (domain: LeadershipDomain): boolean => {
  const requiredScores = {
    "strategy": 70,
    "product-design": 75,
    "data-engineering": 80,
    "software-development": 75,
    "engagement": 70
  };
  
  return domain in requiredScores;
};

