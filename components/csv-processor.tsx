"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react"

interface CSVRecord {
  [key: string]: string
}

interface CSVProcessorProps {
  onDataProcessed?: (data: { headers: string[]; records: CSVRecord[] }) => void
}

export function CSVProcessor({ onDataProcessed }: CSVProcessorProps) {
  const [csvInput, setCsvInput] = useState("")
  const [parsedData, setParsedData] = useState<{ headers: string[]; records: CSVRecord[] } | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null) // Added file upload state

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvInput(content)
      // Auto-process the uploaded file
      processUploadedData(content)
    }

    reader.readAsText(file)
  }

  const processUploadedData = async (content: string) => {
    setProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/parse-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvData: content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process file")
      }

      const result = await response.json()
      setParsedData({ headers: result.headers, records: result.records })
      onDataProcessed?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Processing failed"
      setError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const processCsvData = async () => {
    if (!csvInput.trim()) {
      setError("Please enter CSV data")
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/parse-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvData: csvInput }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process CSV")
      }

      const result = await response.json()
      setParsedData({ headers: result.headers, records: result.records })
      onDataProcessed?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Processing failed"
      setError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const sampleCsv = `Name,Degree,Date,Institution
John Doe,Bachelor of Science,2024-05-15,University of Technology
Jane Smith,Master of Arts,2024-05-15,State University
Mike Johnson,Bachelor of Engineering,2024-05-15,Tech Institute`

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Data Import
          </CardTitle>
          <CardDescription className="text-xs">Upload CSV/Excel file or paste data manually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="text-xs font-medium mb-2 block">Upload File</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {uploadedFile && <p className="text-xs text-green-600 mt-1">Uploaded: {uploadedFile.name}</p>}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or paste manually</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium">CSV Data</label>
              <Button variant="outline" size="sm" onClick={() => setCsvInput(sampleCsv)} className="text-xs h-7">
                Use Sample
              </Button>
            </div>
            <Textarea
              placeholder="Name,Degree,Date&#10;John Doe,Bachelor of Science,2024-05-15&#10;Jane Smith,Master of Arts,2024-05-15"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="font-mono text-xs"
              rows={6}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={processCsvData} disabled={processing || !csvInput.trim()} size="sm" className="w-full">
            {processing ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Process CSV Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Parsed Data Display */}
      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Processed Data
            </CardTitle>
            <CardDescription className="text-xs">
              Found {parsedData.records.length} records with {parsedData.headers.length} fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Headers */}
              <div>
                <p className="text-xs font-medium mb-2">Fields:</p>
                <div className="flex flex-wrap gap-1">
                  {parsedData.headers.map((header, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {header}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <p className="text-xs font-medium mb-2">Data Preview:</p>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {parsedData.headers.map((header, index) => (
                          <TableHead key={index} className="text-xs font-medium">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.records.slice(0, 5).map((record, index) => (
                        <TableRow key={index}>
                          {parsedData.headers.map((header, cellIndex) => (
                            <TableCell key={cellIndex} className="text-xs">
                              {record[header] || "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {parsedData.records.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2">Showing 5 of {parsedData.records.length} records</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
