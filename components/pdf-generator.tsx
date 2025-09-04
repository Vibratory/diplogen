"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, FileText, Package, AlertCircle, CheckCircle, X } from "lucide-react"
import JSZip from "jszip"
import FileSaver from "file-saver"

interface DiplomaField {
  id: string
  type: "text" | "image" | "signature"
  title: string
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  color: string
  fontWeight: string
  textAlign: "left" | "center" | "right"
  fontStyle?: "normal" | "italic"
  textDecoration?: "none" | "underline"
  letterSpacing?: number
  lineHeight?: number
  textTransform?: "none" | "uppercase" | "capitalize"
  rotation?: number
  opacity?: number
}

interface PDFGeneratorProps {
  template: string
  fields: DiplomaField[]
  bulkData?: { headers: string[]; records: any[] } | null
  singleData?: Record<string, string>
  canvasDimensions: { width: number; height: number }
  displayDimensions?: { width: number; height: number }
  dpi?: number
}


export function PDFGenerator({ template, fields, bulkData, singleData, canvasDimensions, displayDimensions, dpi }: PDFGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedPDFs, setGeneratedPDFs] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Convert a URL/Blob into a data URL to ensure server can embed it
  const toDataUrl = async (src: string): Promise<string> => {
    try {
      if (!src) return src
      if (src.startsWith('data:image/')) return src
      const res = await fetch(src)
      const blob = await res.blob()
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch {
      return src
    }
  }

  const resolveImagesInFields = async (arr: DiplomaField[]): Promise<DiplomaField[]> => {
    const out: DiplomaField[] = []
    for (const f of arr) {
      if (f.type === 'image' && typeof f.content === 'string' && f.content && !f.content.startsWith('data:image/')) {
        out.push({ ...f, content: await toDataUrl(f.content) })
      } else {
        out.push(f)
      }
    }
    return out
  }

  const generateSinglePDF = async () => {
    setGenerating(true)
    setProgress(0)
    setError(null)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 20, 90))
      }, 200)

      // Don't transform text visually in the editor; send raw data.
      const enrichedFields = fields.map((f: any) =>
        f.type === "text"
          ? {
              ...f,
              fontStyle: f.fontStyle || "normal",
              textDecoration: f.textDecoration || "none",
              letterSpacing: f.letterSpacing ?? 0,
              lineHeight: f.lineHeight ?? 1.2,
              textTransform: f.textTransform || "none",
              rotation: f.rotation ?? 0,
              opacity: f.opacity ?? 1,
            }
          : f,
      )

      const resolvedTemplate = await toDataUrl(template)
      const resolvedFields = await resolveImagesInFields(enrichedFields as any)

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: resolvedTemplate,
          fields: resolvedFields,
          data: singleData,
          format: "single",
          canvasDimensions,
          displayDimensions,
          dpi,
          includeTemplate: true,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "PDF generation failed")
      }

      const result = await response.json()
      setGeneratedPDFs([result.pdf])
      setPreviewUrl(result.pdf.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Generation failed"
      setError(errorMessage)
    } finally {
      setGenerating(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const generateBulkPDFs = async () => {
    if (!bulkData || !bulkData.records || bulkData.records.length === 0) {
      setError("No bulk data available")
      return
    }

    setGenerating(true)
    setProgress(0)
    setError(null)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 300)

      // Do not transform bulk data; server will apply textTransform during rendering.
      const enrichedFields = fields.map((f: any) =>
        f.type === "text"
          ? {
              ...f,
              fontStyle: f.fontStyle || "normal",
              textDecoration: f.textDecoration || "none",
              letterSpacing: f.letterSpacing ?? 0,
              lineHeight: f.lineHeight ?? 1.2,
              textTransform: f.textTransform || "none",
              rotation: f.rotation ?? 0,
              opacity: f.opacity ?? 1,
            }
          : f,
      )

      const resolvedTemplate = await toDataUrl(template)
      const resolvedFields = await resolveImagesInFields(enrichedFields as any)

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: resolvedTemplate,
          fields: resolvedFields,
          format: "bulk",
          bulkData: bulkData.records,
          headers: bulkData.headers,
          canvasDimensions,
          displayDimensions,
          dpi,
          includeTemplate: true,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Bulk PDF generation failed")
      }

      const result = await response.json()
      setGeneratedPDFs(result.pdfs)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Bulk generation failed"
      setError(errorMessage)
    } finally {
      setGenerating(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const downloadPDF = (pdf: any) => {
    const link = document.createElement("a")
    link.href = pdf.data
    link.download = pdf.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllPDFs = () => {
    generatedPDFs.forEach((pdf, index) => {
      setTimeout(() => downloadPDF(pdf), index * 100)
    })
  }

  const downloadAllPDFsAsZip = async () => {
    if (generatedPDFs.length === 0) return

    const zip = new JSZip()
    generatedPDFs.forEach((pdf) => {
      const base64Data = pdf.data.includes(",") ? pdf.data.split(",")[1] : pdf.data
      zip.file(pdf.filename, base64Data, { base64: true })
    })

    const content = await zip.generateAsync({ type: "blob" })
    FileSaver.saveAs(content, "diplomas.zip")
  }

  const previewPDF = (pdf: any) => {
    setPreviewUrl(pdf.data)
  }

  const closePreview = () => {
    setPreviewUrl(null)
  }

  return (
    <div className="space-y-4">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF Generation
          </CardTitle>
          <CardDescription className="text-xs">Generate professional diploma PDFs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single PDF Generation */}
          <div className="space-y-2">
            <Button onClick={generateSinglePDF} disabled={generating} size="sm" className="w-full">
              {generating ? (
                <>
                  <FileText className="h-4 w-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Generate Preview PDF
                </>
              )}
            </Button>
          </div>

          {/* Bulk PDF Generation */}
          {bulkData && bulkData.records && bulkData.records.length > 0 && (
            <div className="space-y-2">
              <Button
                onClick={generateBulkPDFs}
                disabled={generating}
                size="sm"
                className="w-full bg-transparent"
                variant="outline"
              >
                {generating ? (
                  <>
                    <Package className="h-4 w-4 mr-2 animate-pulse" />
                    Generating {bulkData.records.length} PDFs...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    Generate {bulkData.records.length} Bulk PDFs
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Progress Bar */}
          {generating && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                {progress < 100 ? "Generating PDFs..." : "Almost done!"}
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated PDFs */}
      {generatedPDFs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Generated PDFs ({generatedPDFs.length})
            </CardTitle>
            <CardDescription className="text-xs">Your diplomas are ready for download</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bulk Download Options */}
            {generatedPDFs.length > 1 && (
              <div className="space-y-2">
                <Button onClick={downloadAllPDFs} size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download All PDFs (Sequential)
                </Button>
                <Button onClick={downloadAllPDFsAsZip} size="sm" variant="outline" className="w-full bg-transparent">
                  <Package className="h-4 w-4 mr-2" />
                  Download as ZIP Package
                </Button>
              </div>
            )}

            {/* Individual PDFs */}
            <div className="space-y-2">
              {generatedPDFs.map((pdf, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <FileText className="h-6 w-6 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{pdf.filename}</p>
                    <p className="text-xs text-muted-foreground">PDF Document</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Ready
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => previewPDF(pdf)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadPDF(pdf)}>
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">PDF Preview</h3>
              <Button variant="ghost" size="sm" onClick={closePreview}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="PDF Preview"
                style={{ border: "none", minHeight: "500px" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
