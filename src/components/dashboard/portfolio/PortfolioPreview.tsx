
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Share2, Award, Briefcase } from "lucide-react"
import { ProjectHighlights } from "./ProjectHighlights"
import { ImpactMetrics } from "./ImpactMetrics"
import { VisualSummary } from "./VisualSummary"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { PortfolioTemplate } from "./PortfolioTemplate"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Portfolio } from "@/types/portfolio"

interface PortfolioPreviewProps {
  portfolio: Portfolio;
  onShare?: (platform: 'linkedin' | 'github') => Promise<void>;
}

export function PortfolioPreview({ portfolio, onShare }: PortfolioPreviewProps) {
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const handleShare = async (platform: 'linkedin' | 'github') => {
    try {
      setIsSharing(true)
      await onShare?.(platform)
      toast({
        title: "Portfolio shared successfully",
        description: `Your portfolio has been shared to ${platform === 'linkedin' ? 'LinkedIn' : 'GitHub'}.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error sharing portfolio",
        description: "There was an error sharing your portfolio. Please try again.",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Professional Portfolio</span>
            <Badge variant="secondary" className="ml-2">
              {portfolio.metadata.format === 'linkedin' ? 'Leadership' : 'Technical'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              disabled={isSharing}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              Share to LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('github')}
              disabled={isSharing}
            >
              <Github className="h-4 w-4 mr-2" />
              Export to GitHub
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
              Share Link
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">
              <Briefcase className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="certifications">
              <Award className="h-4 w-4 mr-2" />
              Certifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <PortfolioTemplate portfolio={portfolio} />
            <ProjectHighlights items={portfolio.items} />
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-4 space-y-4">
            <ImpactMetrics summary={portfolio.summary} />
            <VisualSummary data={portfolio.items} />
          </TabsContent>
          
          <TabsContent value="certifications" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {portfolio.items.map((item) => (
                item.achievements.map((achievement, index) => (
                  <Card key={`${item.id}-${index}`} className="p-4">
                    <div className="flex items-start gap-3">
                      <Award className="h-8 w-8 text-primary shrink-0" />
                      <div className="space-y-1">
                        <h4 className="font-semibold">{achievement}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        {item.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ))}
              {!portfolio.items.some(item => item.achievements.length > 0) && (
                <Card className="md:col-span-2 p-4">
                  <div className="text-center text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2" />
                    <p>No certifications or achievements yet</p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
