
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeeHistory } from "./FeeHistory";
import { FeeCalculator } from "./FeeCalculator";
import { FeeMetrics } from "./FeeMetrics";

export function FeeTrackingDashboard() {
  return (
    <div className="space-y-6">
      <FeeMetrics />
      
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList>
          <TabsTrigger value="calculator">Fee Calculator</TabsTrigger>
          <TabsTrigger value="history">Fee History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator">
          <Card className="p-6">
            <FeeCalculator />
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="p-6">
            <FeeHistory />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
