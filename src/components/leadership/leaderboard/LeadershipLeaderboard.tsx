
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Trophy, Award } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { LeadershipProfile } from "@/types/leadership"
import { getDatabase, ref, onValue } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"

interface LeaderboardEntry {
  userId: string;
  name: string;
  tier: string;
  score: number;
  achievements: number;
  rank?: number;
}

export function LeadershipLeaderboard() {
  const { currentUser } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    if (!currentUser) return

    const db = getDatabase()
    const leaderboardRef = ref(db, "leadershipProfiles")

    const unsubscribe = onValue(leaderboardRef, (snapshot) => {
      const profiles: Record<string, LeadershipProfile> = snapshot.val() || {}
      
      const entries = Object.entries(profiles)
        .map(([userId, profile]) => ({
          userId,
          name: profile.userId, // In a real app, you'd fetch user names
          tier: profile.currentTier,
          score: profile.metrics.overallScore,
          achievements: profile.achievements.length
        }))
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      setLeaderboard(entries)
      
      const userRankEntry = entries.find(entry => entry.userId === currentUser.uid)
      if (userRankEntry) {
        setUserRank(userRankEntry.rank)
      }
    })

    return () => unsubscribe()
  }, [currentUser])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leadership Leaderboard</h2>
        {userRank && (
          <Badge variant="secondary" className="text-lg">
            Your Rank: #{userRank}
          </Badge>
        )}
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Leader</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Achievements</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow key={entry.userId}>
                <TableCell>
                  {entry.rank === 1 ? (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  ) : entry.rank}
                </TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{entry.tier}</Badge>
                </TableCell>
                <TableCell>{entry.score}</TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end gap-1">
                    <Award className="h-4 w-4" />
                    {entry.achievements}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
