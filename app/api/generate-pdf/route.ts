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
  textAlign: "left" | "center" | "right"
  fontStyle?: "normal" | "italic"
  textDecoration?: "none" | "underline"
  letterSpacing?: number
  lineHeight?: number
  textTransform?: "none" | "uppercase" | "capitalize"
  rotation?: number
  opacity?: number
}

interface GeneratePDFRequest {
  template: string
  fields: DiplomaField[]
  data?: Record<string, string>
  format?: "single" | "bulk"
  bulkData?: Record<string, string>[]
  headers?: string[]
  canvasDimensions?: { width: number; height: number }
  displayDimensions?: { width: number; height: number }
  dpi?: number
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
      displayDimensions,
      dpi = 300,
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

      // Convert px -> mm using provided DPI (mm per px = 25.4 / DPI). Default DPI=300 for print-accurate size.
      const MM_PER_PX = 25.4 / dpi
      const pdfWidth = canvasDimensions.width * MM_PER_PX // Convert px to mm
      const pdfHeight = canvasDimensions.height * MM_PER_PX // Convert px to mm

      // All field sizes/positions are stored relative to the full canvas in px
      // Convert px -> mm directly using DPI; no display scaling needed here
      const pxToMm = MM_PER_PX

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
          // Helper to resolve any URL/path to a data URL suitable for addImage
          const resolveToDataUrl = async (src: string): Promise<{ dataUrl: string; format: "PNG" | "JPEG" }> => {
            if (src.startsWith("data:image/")) {
              const isPng = src.toLowerCase().startsWith("data:image/png")
              return { dataUrl: src, format: isPng ? "PNG" : "JPEG" }
            }
            let url = src
            if (src.startsWith("/")) {
              // Build absolute URL for local public assets
              const origin = request.nextUrl.origin
              url = new URL(src, origin).toString()
            }
            const res = await fetch(url)
            if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
            const buf = Buffer.from(await res.arrayBuffer())
            const contentType = res.headers.get("content-type") || "image/png"
            const base64 = buf.toString("base64")
            const dataUrl = `data:${contentType};base64,${base64}`
            const isPng = contentType.toLowerCase().includes("png")
            return { dataUrl, format: isPng ? "PNG" : "JPEG" }
          }

          const { dataUrl, format } = await resolveToDataUrl(template)
          doc.addImage(dataUrl, format, 0, 0, pdfWidth, pdfHeight, undefined, "FAST")
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
          // Resolve actual content from recordData by matching the field title
          let content = field.content
          if (recordData && field.title) {
            const fieldKey = Object.keys(recordData).find((key) =>
              key.toLowerCase() === field.title.toLowerCase() ||
              key.toLowerCase().includes(field.title.toLowerCase()) ||
              field.title.toLowerCase().includes(key.toLowerCase()) ||
              key.toLowerCase().replace(/[^a-z0-9]/g, "") === field.title.toLowerCase().replace(/[^a-z0-9]/g, ""),
            )
            if (fieldKey) content = String((recordData as any)[fieldKey])
          }

          // Always draw text content in the PDF preview/generation.
          // Previously we skipped when content matched the field's placeholder and includeTemplate was true,
          // which caused PDFs with only the background and no text. We now always render the text box contents.
          // no-op

          // Apply textTransform to content (PDF-only)
          const tform = (field.textTransform || "none").toLowerCase()
          if (tform === "uppercase") {
            content = content.toUpperCase()
          } else if (tform === "capitalize") {
            content = content.replace(/\b\w/g, (c) => c.toUpperCase())
          }

          // Position and sizing
          const leftMm = (field.x / 100) * pdfWidth
          const topMm = (field.y / 100) * pdfHeight
          const boxWidthMm = (field.width || 0) * pxToMm
          const boxHeightMm = (field.height || 0) * pxToMm

          // Map font family to jsPDF base families
          const ff = (field.fontFamily || "").toLowerCase()
          // Expanded detection lists (lowercased, substring match)
          const serifGroup = [
            "serif",
            "times", "times new roman", "georgia", "garamond", "palatino", "palatino linotype", "cambria", "noto serif",
            // Google serif families used in editor
            "playfair display", "merriweather", "lora", "libre baskerville", "spectral", "cormorant garamond"
          ]
          const monoGroup = [
            "monospace", "mono", "courier", "courier new", "lucida console",
            // Popular monos
            "fira code", "jetbrains mono", "inconsolata", "source code pro"
          ]
          const isSerif = serifGroup.some((s) => ff.includes(s))
          const isMono = monoGroup.some((m) => ff.includes(m))
          const fontFamily = isSerif ? "times" : isMono ? "courier" : "helvetica"

          // Determine style (normal | bold | italic | bolditalic)
          let style: "normal" | "bold" | "italic" | "bolditalic" = "normal"
          const isBold = (field.fontWeight || "normal").toLowerCase() === "bold"
          const isItalic = (field.fontStyle || "normal").toLowerCase() === "italic"
          if (isBold && isItalic) style = "bolditalic"
          else if (isBold) style = "bold"
          else if (isItalic) style = "italic"

          const fontSizePx = field.fontSize || 16
          const fontSizePt = fontSizePx * (72 / dpi)
          doc.setFont(fontFamily, style)
          doc.setFontSize(fontSizePt)

          // Color and opacity
          const color = field.color || "#000000"
          const r = parseInt(color.slice(1, 3), 16)
          const g = parseInt(color.slice(3, 5), 16)
          const b = parseInt(color.slice(5, 7), 16)
          doc.setTextColor(r, g, b)

          const opacity = Math.max(0, Math.min(1, field.opacity ?? 1))
          let resetOpacity: (() => void) | null = null
          try {
            const GS = (doc as any).GState
            if (GS && (doc as any).setGState) {
              ;(doc as any).setGState(new GS({ opacity }))
              resetOpacity = () => {
                ;(doc as any).setGState(new GS({ opacity: 1 }))
              }
            } else if ((doc as any).setAlpha) {
              ;(doc as any).setAlpha(opacity)
              resetOpacity = () => {
                ;(doc as any).setAlpha(1)
              }
            }
          } catch {}

          // Alignment
          const align: "left" | "center" | "right" = field.textAlign === "center" ? "center" : field.textAlign === "right" ? "right" : "left"

          // Compute anchor position
          let xMm = leftMm
          if (align === "center") xMm = leftMm + boxWidthMm / 2
          else if (align === "right") xMm = leftMm + boxWidthMm

          const fontHeightMm = fontSizePx * MM_PER_PX
          let yMm = topMm
          if (boxHeightMm > 0) {
            yMm = topMm + Math.max(0, (boxHeightMm - fontHeightMm) / 2)
          }

          // Letter spacing (px -> mm)
          const letterSpacingMm = (field.letterSpacing ?? 0) * pxToMm
          const angle = field.rotation ?? 0
          const lineHeightMult = field.lineHeight ?? 1.2
          const underline = (field.textDecoration || "none") === "underline"

          // Support multiple lines (split on \n)
          const lines = String(content).split(/\r?\n/)

          const drawLineText = (line: string, baseX: number, baseY: number) => {
            if (letterSpacingMm === 0) {
              // Single call with angle
              doc.text(line, baseX, baseY, { align, baseline: "top", angle })
              if (underline) {
                const textWidth = doc.getTextWidth(line)
                let startX = baseX
                if (align === "center") startX = baseX - textWidth / 2
                else if (align === "right") startX = baseX - textWidth
                const underlineY = baseY + fontHeightMm * 0.88
                doc.setDrawColor(r, g, b)
                doc.setLineWidth(0.3)
                doc.line(startX, underlineY, startX + textWidth, underlineY)
              }
              return
            }
            // Draw character by character respecting letter spacing
            let xCursor = baseX
            // For alignment, compute total width first
            const widths = Array.from(line).map((ch) => doc.getTextWidth(ch))
            const totalWidth = widths.reduce((acc, w) => acc + w, 0) + Math.max(0, (line.length - 1) * letterSpacingMm)
            if (align === "center") xCursor = baseX - totalWidth / 2
            else if (align === "right") xCursor = baseX - totalWidth

            for (let i = 0; i < line.length; i++) {
              const ch = line[i]
              doc.text(ch, xCursor, baseY, { baseline: "top", angle })
              xCursor += widths[i] + letterSpacingMm
            }
            if (underline) {
              const underlineY = baseY + fontHeightMm * 0.88
              doc.setDrawColor(r, g, b)
              doc.setLineWidth(0.3)
              doc.line(xCursor - totalWidth, underlineY, xCursor, underlineY)
            }
          }

          for (let li = 0; li < lines.length; li++) {
            drawLineText(lines[li], xMm, yMm + li * fontHeightMm * lineHeightMult)
          }

          if (resetOpacity) resetOpacity()
        } else if (field.type === "image" && field.content) {
          try {
            const resolveToDataUrl = async (src: string): Promise<{ dataUrl: string; format: "PNG" | "JPEG" }> => {
              if (src.startsWith("data:image/")) {
                const isPng = src.toLowerCase().startsWith("data:image/png")
                return { dataUrl: src, format: isPng ? "PNG" : "JPEG" }
              }
              let url = src
              if (src.startsWith("/")) {
                const origin = request.nextUrl.origin
                url = new URL(src, origin).toString()
              }
              const res = await fetch(url)
              if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
              const buf = Buffer.from(await res.arrayBuffer())
              const contentType = res.headers.get("content-type") || "image/png"
              const base64 = buf.toString("base64")
              const dataUrl = `data:${contentType};base64,${base64}`
              const isPng = contentType.toLowerCase().includes("png")
              return { dataUrl, format: isPng ? "PNG" : "JPEG" }
            }
            const { dataUrl, format } = await resolveToDataUrl(field.content)
            const leftMm = (field.x / 100) * pdfWidth
            const topMm = (field.y / 100) * pdfHeight
            const wMm = (field.width || 0) * pxToMm
            const hMm = (field.height || 0) * pxToMm
            doc.addImage(dataUrl, format, leftMm, topMm, wMm, hMm, undefined, "FAST")
          } catch (e) {
            console.warn(" Failed to add image field:", e)
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
