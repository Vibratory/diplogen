import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { csvData } = await request.json()

    if (!csvData) {
      return NextResponse.json({ error: "No CSV data provided" }, { status: 400 })
    }

    // Parse CSV data
    const lines = csvData.trim().split("\n")
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have at least a header and one data row" }, { status: 400 })
    }

    const headers = lines[0].split(",").map((h: string) => h.trim().replace(/"/g, ""))
    const records = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v: string) => v.trim().replace(/"/g, ""))
      if (values.length === headers.length) {
        const record: Record<string, string> = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ""
        })
        records.push(record)
      }
    }

    return NextResponse.json({
      success: true,
      headers,
      records,
      count: records.length,
    })
  } catch (error) {
    console.error("CSV parsing error:", error)
    return NextResponse.json({ error: "Failed to parse CSV data" }, { status: 500 })
  }
}
