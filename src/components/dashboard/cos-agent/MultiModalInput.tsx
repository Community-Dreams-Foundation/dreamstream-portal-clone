
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Upload, File, Image, Bot, Loader2 } from "lucide-react"
import { useCosRecommendations } from "@/hooks/useCosRecommendations"
import { useToast } from "@/hooks/use-toast"

interface MultiModalInputProps {
  onClose: () => void
}

export function MultiModalInput({ onClose }: MultiModalInputProps) {
  const [activeTab, setActiveTab] = useState("document")
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { createTaskRecommendation } = useCosRecommendations()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    
    // Create image preview if it's an image
    if (selectedFile.type.includes("image")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setImagePreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      
      if (droppedFile.type.includes("image")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(droppedFile)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsUploading(true)
    
    // Simulate file analysis
    setTimeout(() => {
      setIsUploading(false)
      
      // Create a recommendation based on the document/image analysis
      const fileType = file.type.includes("image") ? "image" : "document"
      const recommendationContent = fileType === "image"
        ? `Based on the image you uploaded, I recommend creating a task to process this visual content. ${prompt ? `\n\nYour notes: ${prompt}` : ""}`
        : `I've analyzed your document "${file.name}" and extracted key information. Would you like to create tasks based on this document? ${prompt ? `\n\nYour notes: ${prompt}` : ""}`

      createTaskRecommendation(
        `file-${Date.now()}`,
        file.name,
        recommendationContent,
        "medium"
      )

      toast({
        title: "Analysis Complete",
        description: `Your ${fileType} has been analyzed and recommendations created.`,
      })
      
      onClose()
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Upload Content for Analysis</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="document">
            <File className="h-4 w-4 mr-2" />
            Document
          </TabsTrigger>
          <TabsTrigger value="image">
            <Image className="h-4 w-4 mr-2" />
            Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="space-y-4">
          <div
            className="border-2 border-dashed rounded-md p-6 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop your document here or click to upload
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Document
            </Button>
            {file && !file.type.includes("image") && (
              <p className="mt-2 text-sm font-medium">{file.name}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <div
            className="border-2 border-dashed rounded-md p-6 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-40 mx-auto mb-2 rounded"
              />
            ) : (
              <Image className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            )}
            <p className="text-sm text-muted-foreground mb-2">
              Drop your image here or click to upload
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Image
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <label htmlFor="prompt" className="text-sm font-medium">
          Additional Notes (Optional)
        </label>
        <Textarea
          id="prompt"
          placeholder="Add any context or questions about the uploaded content..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="resize-none"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Bot className="h-4 w-4 mr-2" />
              Analyze with CoS
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
