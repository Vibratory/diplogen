import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { csvData } = await request.json()

    if (!csvData) {
      return NextResponse.json({ error: "No CSV data provided" }, { status: 400 })
    }

    // Parse CSV/TSV data with delimiter detection and quoted field support
    const rawLines = csvData.split(/\r?\n/).filter((l: string) => l.trim().length > 0)
    if (rawLines.length < 2) {
      return NextResponse.json({ error: "CSV must have at least a header and one data row" }, { status: 400 })
    }

    // Guess delimiter from header line
    const guessDelimiter = (sample: string) => {
      const counts: Record<string, number> = {
        ",": (sample.match(/,/g) || []).length,
        "\t": (sample.match(/\t/g) || []).length,
        ";": (sample.match(/;/g) || []).length,
        "|": (sample.match(/\|/g) || []).length,
      }
      let best = ","
      let max = -1
      for (const [delim, count] of Object.entries(counts)) {
        if (count > max) {
          max = count
          best = delim
        }
      }
      return best
    }

    const splitCSVLine = (line: string, delimiter: string): string[] => {
      const out: string[] = []
      let cur = ""
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') {
          // Handle escaped quotes ""
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            cur += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (!inQuotes && ch === delimiter) {
          out.push(cur)
          cur = ""
        } else {
          cur += ch
        }
      }
      out.push(cur)
      return out.map((v) => v.trim().replace(/^"|"$/g, ""))
    }

    const headerLine = rawLines[0]
    const delimiter = guessDelimiter(headerLine)
    const headers = splitCSVLine(headerLine, delimiter)

    const records: Record<string, string>[] = []
    for (let i = 1; i < rawLines.length; i++) {
      const values = splitCSVLine(rawLines[i], delimiter)
      if (values.length === 0) continue
      const record: Record<string, string> = {}
      for (let h = 0; h < headers.length; h++) {
        record[headers[h]] = values[h] ?? ""
      }
      records.push(record)
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
