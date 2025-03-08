
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadershipTracker } from "./LeadershipTracker"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { fetchPerformanceData } from "@/utils/performanceUtils"

export function AdminLeadershipPanel() {
  const { currentUser } = useAuth()

  const { data: performanceMetrics, isLoading } = useQuery({
    queryKey: ['performance', currentUser?.uid],
    queryFn: () => fetchPerformanceData(currentUser?.uid || ''),
    enabled: !!currentUser,
  })

  if (isLoading || !performanceMetrics) {
    return <div>Loading...</div>
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Leadership Analytics</CardTitle>
      </CardHeader>
      <div className="p-6">
        <LeadershipTracker metrics={performanceMetrics} />
      </div>
    </Card>
  )
}
