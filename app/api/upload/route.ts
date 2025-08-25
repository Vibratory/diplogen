import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type based on upload type
    const validTypes = {
      template: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "image/svg+xml",
      ],
      image: ["image/png", "image/jpeg", "image/svg+xml", "image/gif"],
      data: [
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
    }

    if (
      type &&
      validTypes[type as keyof typeof validTypes] &&
      !validTypes[type as keyof typeof validTypes].includes(file.type)
    ) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Convert file to buffer for processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let fileUrl = `/uploads/${Date.now()}-${file.name}`

    // For image files (templates and images), create a data URL that can be used immediately
    if (file.type.startsWith("image/")) {
      const base64 = buffer.toString("base64")
      fileUrl = `data:${file.type};base64,${base64}`
    }

    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      url: fileUrl,
      buffer: buffer.toString("base64"), // Keep for backward compatibility
    }

    return NextResponse.json({
      success: true,
      file: fileInfo,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
