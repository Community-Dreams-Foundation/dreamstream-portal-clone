
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Bell,
  Upload,
  Paperclip,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DocumentUpload, VisaStatus } from "@/types/immigration"

interface VisaStatusTrackerProps {
  status: VisaStatus;
  onSetReminder: (deadline: number) => void;
  onUploadDocument?: (data: DocumentUpload) => Promise<void>;
  onDeleteDocument?: (documentName: string) => Promise<void>;
}

export function VisaStatusTracker({
  status,
  onSetReminder,
  onUploadDocument,
  onDeleteDocument
}: VisaStatusTrackerProps) {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<"primary" | "supporting" | "optional">("supporting")
  const [notes, setNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const getStatusColor = (status: "valid" | "expiring" | "expired") => {
    switch (status) {
      case "valid":
        return "text-green-500 bg-green-500/10";
      case "expiring":
        return "text-yellow-500 bg-yellow-500/10";
      case "expired":
        return "text-red-500 bg-red-500/10";
    }
  };

  const handleSetReminder = (deadline: number) => {
    onSetReminder(deadline);
    toast({
      title: "Reminder Set",
      description: "You'll be notified before the deadline.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !onUploadDocument) return

    setIsUploading(true)
    try {
      await onUploadDocument({
        file: selectedFile,
        category: selectedCategory,
        notes: notes.trim() || undefined
      })
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been successfully uploaded.",
      })
      
      setSelectedFile(null)
      setNotes("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error uploading your document.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentName: string) => {
    if (!onDeleteDocument) return
    
    try {
      await onDeleteDocument(documentName)
      toast({
        title: "Document Deleted",
        description: "The document has been removed.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "There was an error deleting the document.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Visa Status Tracker</span>
          </div>
          <Badge 
            variant="secondary"
            className={getStatusColor(
              status.remainingDays < 30 ? "expiring" : 
              status.remainingDays < 0 ? "expired" : "valid"
            )}
          >
            {status.remainingDays} days remaining
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Current Status</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground">{status.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Expiry Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(status.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Required Documents</h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid w-full gap-2">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                  <div className="grid w-full gap-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as any)}
                    >
                      <option value="primary">Primary Document</option>
                      <option value="supporting">Supporting Document</option>
                      <option value="optional">Optional Document</option>
                    </select>
                  </div>
                  <div className="grid w-full gap-2">
                    <Textarea
                      placeholder="Add notes about this document..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="w-full"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {status.documents.map((doc) => (
              <div 
                key={doc.name}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{doc.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {doc.category}
                      </Badge>
                    </div>
                    {doc.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{doc.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                  {onDeleteDocument && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(doc.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Next Steps</h4>
          <div className="space-y-2">
            {status.nextSteps.map((step) => (
              <div 
                key={step.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className={
                    new Date(step.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                      ? "h-4 w-4 text-red-500"
                      : "h-4 w-4 text-yellow-500"
                  } />
                  <div>
                    <p className="text-sm">{step.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(step.deadline).toLocaleDateString()}
                    </p>
                    {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {step.requiredDocuments.map((doc) => (
                          <Badge
                            key={doc}
                            variant="outline"
                            className="text-xs"
                          >
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-1"
                  onClick={() => handleSetReminder(step.deadline)}
                >
                  <Bell className="h-4 w-4" />
                  Remind
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

