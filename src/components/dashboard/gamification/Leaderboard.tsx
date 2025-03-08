
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Users, ArrowUp, ArrowDown, Minus } from "lucide-react"

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  position: number;
  change: 'up' | 'down' | 'same';
  changeAmount?: number;
  badges: string[];
}

interface TeamLeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  members: number;
  position: number;
  change: 'up' | 'down' | 'same';
  changeAmount?: number;
  achievements: string[];
}

interface LeaderboardProps {
  individuals: LeaderboardEntry[];
  teams: TeamLeaderboardEntry[];
  userId?: string;
  teamId?: string;
}

export function Leaderboard({ individuals, teams, userId, teamId }: LeaderboardProps) {
  const getChangeIcon = (change: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'same':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="individual" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual" className="space-y-4">
            <div className="space-y-2">
              {individuals.map((entry) => (
                <Card 
                  key={entry.id} 
                  className={`p-3 ${entry.id === userId ? 'border-primary border-2' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {entry.position}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar} alt={entry.name} />
                        <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{entry.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Medal className="h-3 w-3 mr-1" />
                          Level {entry.level}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {getChangeIcon(entry.change)}
                        {entry.change !== 'same' && (
                          <span className="text-xs">{entry.changeAmount}</span>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {entry.points} pts
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4">
            <div className="space-y-2">
              {teams.map((team) => (
                <Card 
                  key={team.id} 
                  className={`p-3 ${team.id === teamId ? 'border-primary border-2' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {team.position}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={team.avatar} alt={team.name} />
                        <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          {team.members} members
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {getChangeIcon(team.change)}
                        {team.change !== 'same' && (
                          <span className="text-xs">{team.changeAmount}</span>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {team.points} pts
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
