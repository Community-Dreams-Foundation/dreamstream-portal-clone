
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GitHubContent } from "@/types/portfolio";

interface GitHubPortfolioPreviewProps {
  content: GitHubContent;
  onSave: () => Promise<void>;
}

export function GitHubPortfolioPreview({ content, onSave }: GitHubPortfolioPreviewProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GitHub Portfolio Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="readme">
          <TabsList className="mb-4">
            <TabsTrigger value="readme">README.md</TabsTrigger>
            <TabsTrigger value="page">Portfolio Page</TabsTrigger>
          </TabsList>
          
          <TabsContent value="readme">
            <div className="bg-zinc-950 text-zinc-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {content.readmeContent}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="page">
            <iframe
              srcDoc={content.portfolioPage}
              className="w-full h-[600px] border rounded-md"
              title="Portfolio Preview"
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={onSave}>
            Save to GitHub
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
