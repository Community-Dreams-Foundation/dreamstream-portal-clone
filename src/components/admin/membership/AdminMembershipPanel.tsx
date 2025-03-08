
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentsTable } from "./PaymentsTable"
import { WaiversTable } from "../waiver/WaiversTable"
import type { WaiverRequest } from "@/types/waiver"

export function AdminMembershipPanel() {
  // Initialize empty waivers array state
  const [waivers, setWaivers] = useState<WaiverRequest[]>([])

  // Handler for reviewing waivers
  const handleReviewClick = (waiver: WaiverRequest) => {
    console.log('Reviewing waiver:', waiver)
    // Add review logic here
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Membership Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="waivers">Waivers</TabsTrigger>
          </TabsList>
          <TabsContent value="payments">
            <PaymentsTable />
          </TabsContent>
          <TabsContent value="waivers">
            <WaiversTable 
              waivers={waivers} 
              onReviewClick={handleReviewClick}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
