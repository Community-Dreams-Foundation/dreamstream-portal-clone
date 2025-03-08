
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { CostMetrics, ThresholdAlert } from "@/types/cost";
import { updateTaskCostMetrics } from "@/utils/costEvaluation";

export function CostOptimization() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCostMetrics = async () => {
      if (!currentUser?.uid) return;

      try {
        const metrics = await updateTaskCostMetrics(currentUser.uid);
        setMetrics(metrics);
      } catch (error) {
        console.error("Error loading cost metrics:", error);
        toast({
          variant: "destructive",
          title: "Error loading cost metrics",
          description: "Please try again later."
        });
      } finally {
        setLoading(false);
      }
    };

    loadCostMetrics();
    // Refresh metrics every 5 minutes
    const interval = setInterval(loadCostMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser?.uid, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
        </div>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Cost Optimization</h2>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(metrics.totalCost)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Efficiency Score</p>
                <p className={`text-lg font-semibold ${getEfficiencyColor(metrics.costEfficiencyScore)}`}>
                  {metrics.costEfficiencyScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(metrics.hourlyRate)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Budget Usage</p>
            <p className="text-sm font-medium">
              {formatCurrency(metrics.totalCost)} of {formatCurrency(metrics.totalCost + metrics.remainingBudget)}
            </p>
          </div>
          <Progress
            value={(metrics.totalCost / (metrics.totalCost + metrics.remainingBudget)) * 100}
            className="h-2"
          />
        </div>

        {metrics.thresholdAlerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Alerts</h3>
            {metrics.thresholdAlerts.map((alert: ThresholdAlert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  alert.status === "critical" ? "bg-red-50" : "bg-yellow-50"
                }`}
              >
                {alert.status === "critical" ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <p className={`text-sm ${
                  alert.status === "critical" ? "text-red-700" : "text-yellow-700"
                }`}>
                  Cost has exceeded {alert.status} threshold of {formatCurrency(alert.threshold)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium">Cost Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Labor Cost</p>
              <p className="text-lg font-semibold">
                {formatCurrency(metrics.costBreakdown.laborCost)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Tooling Cost</p>
              <p className="text-lg font-semibold">
                {formatCurrency(metrics.costBreakdown.toolingCost)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Overhead Cost</p>
              <p className="text-lg font-semibold">
                {formatCurrency(metrics.costBreakdown.overheadCost)}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Card>
  );
}
