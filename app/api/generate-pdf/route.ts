import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"

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
}

interface GeneratePDFRequest {
  template: string
  fields: DiplomaField[]
  data?: Record<string, string>
  format?: "single" | "bulk"
  bulkData?: Record<string, string>[]
  headers?: string[]
  canvasDimensions?: { width: number; height: number }
  includeTemplate?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const {
      template,
      fields,
      data,
      format = "single",
      bulkData,
      headers,
      canvasDimensions = { width: 800, height: 600 },
      includeTemplate = true,
    }: GeneratePDFRequest = await request.json()

    if (!template || !fields) {
      return NextResponse.json({ error: "Template and fields are required" }, { status: 400 })
    }

    if (format === "bulk" && (!bulkData || bulkData.length === 0)) {
      return NextResponse.json({ error: "Bulk data is required for bulk generation" }, { status: 400 })
    }

    const pdfs = []
    const dataToProcess = format === "bulk" ? bulkData! : [data || {}]

    for (let i = 0; i < dataToProcess.length; i++) {
      const recordData = dataToProcess[i]

      const pdfWidth = canvasDimensions.width * 0.264583 // Convert px to mm
      const pdfHeight = canvasDimensions.height * 0.264583 // Convert px to mm

      // Create new PDF document with proper dimensions
      const doc = new jsPDF({
        orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      })

      // Set document properties
      doc.setProperties({
        title: "Diploma Certificate",
        subject: "Generated Diploma",
        author: "DiplomaGen",
        creator: "DiplomaGen App",
      })

      if (includeTemplate && template) {
        try {
          if (template.startsWith("data:image/")) {
            // Handle base64 data URLs from uploaded templates
            console.log(" Loading base64 template image")
            doc.addImage(template, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST")
          } else if (template.startsWith("http") || template.startsWith("/")) {
            // Handle regular URLs and paths
            console.log(" Loading template from URL:", template)

            // For local paths, we need to load them differently
            if (template.startsWith("/")) {
              // Create a canvas to load and convert the image
              const img = new Image()
              img.crossOrigin = "anonymous"

              await new Promise((resolve, reject) => {
                img.onload = () => {
                  const canvas = document.createElement("canvas")
                  const ctx = canvas.getContext("2d")
                  canvas.width = img.width
                  canvas.height = img.height
                  ctx?.drawImage(img, 0, 0)
                  const dataURL = canvas.toDataURL("image/jpeg", 0.8)
                  doc.addImage(dataURL, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST")
                  resolve(true)
                }
                img.onerror = reject
                img.src = template
              })
            } else {
              // Direct URL loading
              doc.addImage(template, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST")
            }
          } else {
            // Fallback to styled backgrounds for template names
            console.log(" Using styled background for template:", template)
            if (template.includes("classic")) {
              doc.setFillColor(248, 249, 250)
              doc.rect(0, 0, pdfWidth, pdfHeight, "F")
              // Add decorative border
              doc.setDrawColor(139, 69, 19)
              doc.setLineWidth(2)
              doc.rect(5, 5, pdfWidth - 10, pdfHeight - 10)
              doc.setLineWidth(1)
              doc.rect(8, 8, pdfWidth - 16, pdfHeight - 16)
            } else if (template.includes("modern")) {
              doc.setFillColor(255, 255, 255)
              doc.rect(0, 0, pdfWidth, pdfHeight, "F")
              // Add modern border
              doc.setDrawColor(34, 197, 94)
              doc.setLineWidth(3)
              doc.rect(3, 3, pdfWidth - 6, pdfHeight - 6)
            } else {
              // Default elegant style
              doc.setFillColor(254, 254, 254)
              doc.rect(0, 0, pdfWidth, pdfHeight, "F")
              doc.setDrawColor(0, 0, 0)
              doc.setLineWidth(1.5)
              doc.rect(4, 4, pdfWidth - 8, pdfHeight - 8)
            }
          }
        } catch (error) {
          console.warn(" Could not load template background:", error)
          // Fallback to white background with border
          doc.setFillColor(255, 255, 255)
          doc.rect(0, 0, pdfWidth, pdfHeight, "F")
          doc.setDrawColor(0, 0, 0)
          doc.setLineWidth(1)
          doc.rect(2, 2, pdfWidth - 4, pdfHeight - 4)
        }
      }

      // Process each field
      for (const field of fields) {
        if (field.type === "text") {
          const x = (field.x / 100) * pdfWidth
          const y = (field.y / 100) * pdfHeight

          // Set font properties
          const fontFamily =
            field.fontFamily === "serif" ? "times" : field.fontFamily === "mono" ? "courier" : "helvetica"
          const fontStyle = field.fontWeight === "bold" ? "bold" : "normal"

          doc.setFont(fontFamily, fontStyle)
          doc.setFontSize(field.fontSize * 0.75) // Scale font size for PDF

          // Set text color
          const color = field.color || "#000000"
          const r = Number.parseInt(color.slice(1, 3), 16)
          const g = Number.parseInt(color.slice(3, 5), 16)
          const b = Number.parseInt(color.slice(5, 7), 16)
          doc.setTextColor(r, g, b)

          let content = field.content
          if (recordData && field.title) {
            const fieldKey = Object.keys(recordData).find(
              (key) =>
                key.toLowerCase() === field.title.toLowerCase() ||
                key.toLowerCase().includes(field.title.toLowerCase()) ||
                field.title.toLowerCase().includes(key.toLowerCase()) ||
                key.toLowerCase().replace(/[^a-z0-9]/g, "") === field.title.toLowerCase().replace(/[^a-z0-9]/g, ""),
            )
            content = fieldKey ? String(recordData[fieldKey]) : field.content
            console.log(` Field "${field.title}" mapped to "${fieldKey}" with value: "${content}"`)
          }

          // Add text with proper positioning
          doc.text(content, x, y + field.fontSize * 0.75 * 0.3)
        }

        // Handle image and signature fields
        if (field.type === "image" || field.type === "signature") {
          const x = (field.x / 100) * pdfWidth
          const y = (field.y / 100) * pdfHeight
          const width = (field.width / 100) * pdfWidth
          const height = (field.height / 100) * pdfHeight

          if (
            field.content &&
            (field.content.startsWith("data:image/") ||
              field.content.startsWith("http") ||
              field.content.startsWith("/"))
          ) {
            try {
              doc.addImage(field.content, "JPEG", x, y, width, height, undefined, "FAST")
            } catch (error) {
              console.warn(" Could not load image:", error)
              // Fallback to placeholder
              doc.setDrawColor(200, 200, 200)
              doc.setFillColor(240, 240, 240)
              doc.rect(x, y, width, height, "FD")
              doc.setFontSize(8)
              doc.setTextColor(100, 100, 100)
              doc.text(field.type === "image" ? "Image" : "Signature", x + 2, y + 10)
            }
          } else {
            // Add placeholder rectangle for empty images/signatures
            doc.setDrawColor(200, 200, 200)
            doc.setFillColor(240, 240, 240)
            doc.rect(x, y, width, height, "FD")
            doc.setFontSize(8)
            doc.setTextColor(100, 100, 100)
            doc.text(field.type === "image" ? "Logo" : "Signature", x + 2, y + 10)
          }
        }
      }

      // Convert to base64
      const pdfBase64 = doc.output("datauristring")

      let filename = "diploma.pdf"
      if (format === "bulk" && recordData) {
        const nameField = fields.find(
          (f) =>
            f.title.toLowerCase().includes("name") ||
            f.title.toLowerCase().includes("student") ||
            f.title.toLowerCase().includes("recipient"),
        )
        let nameValue = null
        if (nameField) {
          const fieldKey = Object.keys(recordData).find(
            (key) =>
              key.toLowerCase() === nameField.title.toLowerCase() ||
              key.toLowerCase().includes(nameField.title.toLowerCase()) ||
              nameField.title.toLowerCase().includes(key.toLowerCase()),
          )
          nameValue = fieldKey ? String(recordData[fieldKey]).replace(/[^a-zA-Z0-9]/g, "-") : null
        }
        filename = `diploma-${nameValue || `record-${i + 1}`}.pdf`
      }

      pdfs.push({
        filename,
        data: pdfBase64,
        size: { width: pdfWidth, height: pdfHeight },
      })
    }

    if (format === "single") {
      return NextResponse.json({
        success: true,
        pdf: pdfs[0],
        message: "PDF generated successfully",
      })
    } else {
      return NextResponse.json({
        success: true,
        pdfs,
        count: pdfs.length,
        message: `${pdfs.length} PDFs generated successfully`,
      })
    }
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 })
  }
}
