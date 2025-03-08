
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { WaiverList } from "./WaiverList";
import { WaiverStats } from "./WaiverStats";

export function WaiverDashboard() {
  const { data: waiverStats, isLoading: statsLoading } = useQuery({
    queryKey: ["waiver-stats"],
    queryFn: async () => {
      // Simulated stats - replace with actual API call
      return {
        pending: 5,
        approved: 12,
        rejected: 3,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Waiver Administration</h2>
        <p className="text-muted-foreground">
          Manage waiver requests and review applications
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <WaiverStats isLoading={statsLoading} stats={waiverStats} />
      </div>

      <WaiverList />
    </div>
  );
}
