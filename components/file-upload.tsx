"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, FileText, ImageIcon, File, CheckCircle, AlertCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface FileUploadProps {
  type: "template" | "image" | "data"
  onUploadComplete?: (file: any) => void
  onUploadError?: (error: string) => void
  accept?: Record<string, string[]>
  maxSize?: number
  multiple?: boolean
}

export function FileUpload({
  type,
  onUploadComplete,
  onUploadError,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const defaultAccept = {
    template: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/*": [".png", ".jpg", ".jpeg", ".svg"],
    },
    image: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg", ".gif"],
    },
    data: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null)
      setUploading(true)
      setUploadProgress(0)

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("type", type)

          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 10, 90))
          }, 100)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          clearInterval(progressInterval)
          setUploadProgress(100)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Upload failed")
          }

          return await response.json()
        })

        const results = await Promise.all(uploadPromises)
        setUploadedFiles((prev) => [...prev, ...results.map((r) => r.file)])

        results.forEach((result) => {
          onUploadComplete?.(result.file)
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed"
        setError(errorMessage)
        onUploadError?.(errorMessage)
      } finally {
        setUploading(false)
        setTimeout(() => setUploadProgress(0), 1000)
      }
    },
    [type, onUploadComplete, onUploadError],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: accept || defaultAccept[type],
    maxSize,
    multiple,
    disabled: uploading,
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") return <FileText className="h-6 w-6 text-red-500" />
    if (fileType.includes("word")) return <File className="h-6 w-6 text-blue-500" />
    if (fileType.startsWith("image/")) return <ImageIcon className="h-6 w-6 text-green-500" />
    if (fileType.includes("csv") || fileType.includes("excel")) return <FileText className="h-6 w-6 text-emerald-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  const getTypeLabel = () => {
    switch (type) {
      case "template":
        return "Template Files"
      case "image":
        return "Images"
      case "data":
        return "Data Files"
      default:
        return "Files"
    }
  }

  const getTypeDescription = () => {
    switch (type) {
      case "template":
        return "Upload PDF, DOCX, or image files for diploma templates"
      case "image":
        return "Upload logos, signatures, or other images"
      case "data":
        return "Upload CSV or Excel files with student data"
      default:
        return "Upload files"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{getTypeLabel()}</CardTitle>
        <CardDescription className="text-xs">{getTypeDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : uploading
                ? "border-muted-foreground bg-muted/50 cursor-not-allowed"
                : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`h-8 w-8 mx-auto mb-3 ${uploading ? "text-muted-foreground" : "text-muted-foreground"}`} />

          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Uploading...</p>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          ) : isDragActive ? (
            <p className="text-primary font-medium">Drop files here...</p>
          ) : (
            <div>
              <p className="text-sm font-medium mb-1">Drag & drop files here, or click to select</p>
              <p className="text-xs text-muted-foreground">
                {type === "template" && "PDF, DOCX, PNG, JPG, SVG"}
                {type === "image" && "PNG, JPG, SVG, GIF"}
                {type === "data" && "CSV, XLSX, XLS"}
                {maxSize && ` • Max ${Math.round(maxSize / 1024 / 1024)}MB`}
              </p>
            </div>
          )}
        </div>

        {/* File Rejections */}
        {fileRejections.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {fileRejections.map((rejection, index) => (
                <div key={index}>
                  {rejection.file.name}: {rejection.errors.map((e) => e.message).join(", ")}
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium">Uploaded Files</p>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border border-border rounded-lg">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
