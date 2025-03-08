
import { useState, useCallback } from 'react';
import { Team, LeadershipDomain } from '@/types/leadership';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useTeamManagement = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createTeam = useCallback(async (
    domain: LeadershipDomain,
    captainId: string,
    maxMembers: number = 10
  ) => {
    if (!currentUser) return null;
    
    setIsLoading(true);
    try {
      const db = getDatabase();
      const teamId = `team-${Date.now()}`;
      
      const newTeam: Team = {
        id: teamId,
        domain,
        captainId,
        memberIds: [captainId],
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

      await set(ref(db, `teams/${teamId}`), newTeam);
      
      // Update user's teamId
      await update(ref(db, `users/${captainId}`), {
        teamId
      });

      toast({
        title: "Team Created",
        description: `New team created for ${domain} domain`
      });

      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create team. Please try again."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  const addTeamMember = useCallback(async (teamId: string, memberId: string) => {
    if (!currentUser) return false;
    
    setIsLoading(true);
    try {
      const db = getDatabase();
      const teamRef = ref(db, `teams/${teamId}`);
      const teamSnapshot = await get(teamRef);
      
      if (!teamSnapshot.exists()) {
        throw new Error('Team not found');
      }

      const team = teamSnapshot.val() as Team;
      
      if (team.memberIds.includes(memberId)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User is already a member of this team"
        });
        return false;
      }

      if (team.memberIds.length >= team.maxMembers) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Team has reached maximum capacity"
        });
        return false;
      }

      const updatedMemberIds = [...team.memberIds, memberId];
      
      await update(ref(db, `teams/${teamId}`), {
        memberIds: updatedMemberIds
      });

      await update(ref(db, `users/${memberId}`), {
        teamId
      });

      toast({
        title: "Member Added",
        description: "New member added to team successfully"
      });

      return true;
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add team member. Please try again."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  const removeTeamMember = useCallback(async (teamId: string, memberId: string) => {
    if (!currentUser) return false;
    
    setIsLoading(true);
    try {
      const db = getDatabase();
      const teamRef = ref(db, `teams/${teamId}`);
      const teamSnapshot = await get(teamRef);
      
      if (!teamSnapshot.exists()) {
        throw new Error('Team not found');
      }

      const team = teamSnapshot.val() as Team;
      
      if (team.captainId === memberId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot remove team captain"
        });
        return false;
      }

      const updatedMemberIds = team.memberIds.filter(id => id !== memberId);
      
      await update(ref(db, `teams/${teamId}`), {
        memberIds: updatedMemberIds
      });

      await update(ref(db, `users/${memberId}`), {
        teamId: null
      });

      toast({
        title: "Member Removed",
        description: "Team member removed successfully"
      });

      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member. Please try again."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  const updateTeamPerformance = useCallback(async (
    teamId: string,
    performance: Team['performance']
  ) => {
    if (!currentUser) return false;
    
    setIsLoading(true);
    try {
      const db = getDatabase();
      await update(ref(db, `teams/${teamId}/performance`), performance);
      
      toast({
        title: "Performance Updated",
        description: "Team performance metrics updated successfully"
      });

      return true;
    } catch (error) {
      console.error('Error updating team performance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update team performance. Please try again."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  return {
    createTeam,
    addTeamMember,
    removeTeamMember,
    updateTeamPerformance,
    isLoading
  };
};
