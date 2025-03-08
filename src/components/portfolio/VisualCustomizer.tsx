
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import type { VisualCustomization } from "@/types/portfolio";

const defaultCustomization: VisualCustomization = {
  colorScheme: {
    primary: "#22C55E",
    secondary: "#F0FDF4",
    accent: "#86EFAC",
    background: "#FFFFFF",
    text: "#111827",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    fontSize: {
      base: "16px",
      heading: "32px",
      subheading: "24px",
    },
  },
  layout: {
    template: "classic",
    spacing: "comfortable",
    alignment: "left",
  },
  branding: {
    brandColors: [],
  },
};

export function VisualCustomizer() {
  const [customization, setCustomization] = useState<VisualCustomization>(defaultCustomization);

  const handleColorChange = (key: keyof VisualCustomization["colorScheme"], value: string) => {
    setCustomization((prev) => ({
      ...prev,
      colorScheme: {
        ...prev.colorScheme,
        [key]: value,
      },
    }));
  };

  const handleTypographyChange = (key: keyof VisualCustomization["typography"], value: string) => {
    setCustomization((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: value,
      },
    }));
  };

  const handleLayoutChange = (key: keyof VisualCustomization["layout"], value: string) => {
    setCustomization((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: value as any,
      },
    }));
  };

  const handleSave = () => {
    localStorage.setItem("portfolioCustomization", JSON.stringify(customization));
    toast({
      title: "Customization Saved",
      description: "Your portfolio appearance has been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {Object.entries(customization.colorScheme).map(([key, value]) => (
            <div key={key} className="grid gap-2">
              <Label htmlFor={key} className="capitalize">
                {key}
              </Label>
              <Input
                id={key}
                type="color"
                value={value}
                onChange={(e) =>
                  handleColorChange(key as keyof VisualCustomization["colorScheme"], e.target.value)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="headingFont">Heading Font</Label>
            <Select
              value={customization.typography.headingFont}
              onValueChange={(value) => handleTypographyChange("headingFont", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select heading font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bodyFont">Body Font</Label>
            <Select
              value={customization.typography.bodyFont}
              onValueChange={(value) => handleTypographyChange("bodyFont", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select body font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="template">Template</Label>
            <Select
              value={customization.layout.template}
              onValueChange={(value) => handleLayoutChange("template", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="spacing">Spacing</Label>
            <Select
              value={customization.layout.spacing}
              onValueChange={(value) => handleLayoutChange("spacing", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select spacing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="alignment">Alignment</Label>
            <Select
              value={customization.layout.alignment}
              onValueChange={(value) => handleLayoutChange("alignment", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Save Customization
      </Button>
    </div>
  );
}
