
import { getDatabase, ref, set, get, update } from "firebase/database";
import type { GamificationProfile, TeamChallenge } from "@/types/gamification";

export const fetchGamificationProfile = async (userId: string): Promise<GamificationProfile> => {
  const db = getDatabase();
  const profileRef = ref(db, `users/${userId}/gamification`);
  const snapshot = await get(profileRef);

  if (!snapshot.exists()) {
    // Create default profile if it doesn't exist
    const defaultProfile: GamificationProfile = {
      userId,
      level: 1,
      points: 0,
      badges: ["Newcomer"],
      challengesCompleted: 0,
      teamContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
      rewards: [
        {
          tier: "bronze",
          unlockedAt: Date.now(),
          benefits: ["Access to basic challenges", "Participation in team events"]
        }
      ]
    };

    await set(profileRef, defaultProfile);
    return defaultProfile;
  }

  return snapshot.val() as GamificationProfile;
};

export const addPointsToUser = async (
  userId: string, 
  points: number, 
  reason: string
): Promise<{ newTotal: number; levelUp: boolean }> => {
  const db = getDatabase();
  const profileRef = ref(db, `users/${userId}/gamification`);
  
  const snapshot = await get(profileRef);
  if (!snapshot.exists()) {
    await fetchGamificationProfile(userId);
    return addPointsToUser(userId, points, reason);
  }
  
  const profile = snapshot.val() as GamificationProfile;
  const newPoints = profile.points + points;
  
  // Calculate level based on points
  const basePoints = 1000;
  const newLevel = Math.floor(newPoints / basePoints) + 1;
  const levelUp = newLevel > profile.level;
  
  await update(profileRef, {
    points: newPoints,
    level: newLevel
  });
  
  // Add activity record
  const activityRef = ref(db, `users/${userId}/gamification/activity/${Date.now()}`);
  await set(activityRef, {
    type: "points_earned",
    points,
    reason,
    timestamp: Date.now()
  });
  
  return {
    newTotal: newPoints,
    levelUp
  };
};

export const awardBadgeToUser = async (
  userId: string,
  badge: string
): Promise<boolean> => {
  const db = getDatabase();
  const profileRef = ref(db, `users/${userId}/gamification`);
  
  const snapshot = await get(profileRef);
  if (!snapshot.exists()) {
    await fetchGamificationProfile(userId);
    return awardBadgeToUser(userId, badge);
  }
  
  const profile = snapshot.val() as GamificationProfile;
  
  // Check if user already has the badge
  if (profile.badges.includes(badge)) {
    return false;
  }
  
  const updatedBadges = [...profile.badges, badge];
  
  await update(profileRef, {
    badges: updatedBadges
  });
  
  // Add activity record
  const activityRef = ref(db, `users/${userId}/gamification/activity/${Date.now()}`);
  await set(activityRef, {
    type: "badge_earned",
    badge,
    timestamp: Date.now()
  });
  
  return true;
};

export const joinTeamChallenge = async (
  userId: string,
  challengeId: string
): Promise<boolean> => {
  const db = getDatabase();
  const challengeRef = ref(db, `teamChallenges/${challengeId}`);
  
  const snapshot = await get(challengeRef);
  if (!snapshot.exists()) {
    return false;
  }
  
  const challenge = snapshot.val() as TeamChallenge;
  
  if (challenge.participants.includes(userId)) {
    return false; // User already joined
  }
  
  if (challenge.participants.length >= challenge.teamSize) {
    return false; // Team is full
  }
  
  const updatedParticipants = [...challenge.participants, userId];
  
  await update(challengeRef, {
    participants: updatedParticipants
  });
  
  // Update user's team contributions count
  const profileRef = ref(db, `users/${userId}/gamification`);
  const profileSnapshot = await get(profileRef);
  
  if (profileSnapshot.exists()) {
    const profile = profileSnapshot.val() as GamificationProfile;
    await update(profileRef, {
      teamContributions: profile.teamContributions + 1
    });
  }
  
  return true;
};

export const checkDailyStreak = async (userId: string): Promise<number> => {
  const db = getDatabase();
  const profileRef = ref(db, `users/${userId}/gamification`);
  const activityRef = ref(db, `users/${userId}/gamification/activity`);
  
  const profileSnapshot = await get(profileRef);
  if (!profileSnapshot.exists()) {
    await fetchGamificationProfile(userId);
    return 0;
  }
  
  const profile = profileSnapshot.val() as GamificationProfile;
  const activitySnapshot = await get(activityRef);
  
  if (!activitySnapshot.exists()) {
    return profile.currentStreak;
  }
  
  const activities = activitySnapshot.val();
  const activityDates = Object.keys(activities).map(Number);
  activityDates.sort((a, b) => b - a); // Sort in descending order
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const latestActivityDate = new Date(activityDates[0]);
  latestActivityDate.setHours(0, 0, 0, 0);
  
  // Check if there was activity today
  if (latestActivityDate.getTime() === today.getTime()) {
    return profile.currentStreak;
  }
  
  // Check if there was activity yesterday
  if (latestActivityDate.getTime() === yesterday.getTime()) {
    // Update streak
    const newStreak = profile.currentStreak + 1;
    const longestStreak = Math.max(newStreak, profile.longestStreak);
    
    await update(profileRef, {
      currentStreak: newStreak,
      longestStreak
    });
    
    return newStreak;
  }
  
  // Streak broken
  await update(profileRef, {
    currentStreak: 0
  });
  
  return 0;
};

export const fetchLeaderboard = async (limit: number = 10): Promise<{
  individuals: any[];
  teams: any[];
}> => {
  const db = getDatabase();
  const usersRef = ref(db, 'users');
  const teamsRef = ref(db, 'teams');
  
  const usersSnapshot = await get(usersRef);
  const teamsSnapshot = await get(teamsRef);
  
  const users: any[] = [];
  const teams: any[] = [];
  
  if (usersSnapshot.exists()) {
    const usersData = usersSnapshot.val();
    
    Object.keys(usersData).forEach(userId => {
      if (usersData[userId].gamification) {
        users.push({
          id: userId,
          name: usersData[userId].profile?.displayName || 'Anonymous',
          avatar: usersData[userId].profile?.photoURL,
          points: usersData[userId].gamification.points || 0,
          level: usersData[userId].gamification.level || 1,
          badges: usersData[userId].gamification.badges || []
        });
      }
    });
    
    // Sort users by points (descending)
    users.sort((a, b) => b.points - a.points);
    
    // Add position and mock change data
    users.forEach((user, index) => {
      user.position = index + 1;
      user.change = ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same';
      user.changeAmount = user.change !== 'same' ? Math.floor(Math.random() * 3) + 1 : undefined;
    });
  }
  
  if (teamsSnapshot.exists()) {
    const teamsData = teamsSnapshot.val();
    
    Object.keys(teamsData).forEach(teamId => {
      teams.push({
        id: teamId,
        name: teamsData[teamId].name || 'Unnamed Team',
        avatar: teamsData[teamId].avatar,
        points: teamsData[teamId].points || 0,
        members: teamsData[teamId].members?.length || 0,
        achievements: teamsData[teamId].achievements || []
      });
    });
    
    // Sort teams by points (descending)
    teams.sort((a, b) => b.points - a.points);
    
    // Add position and mock change data
    teams.forEach((team, index) => {
      team.position = index + 1;
      team.change = ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same';
      team.changeAmount = team.change !== 'same' ? Math.floor(Math.random() * 3) + 1 : undefined;
    });
  }
  
  return {
    individuals: users.slice(0, limit),
    teams: teams.slice(0, limit)
  };
};
