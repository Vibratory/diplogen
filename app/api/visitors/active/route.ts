import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Count visitors active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const activeVisitors = await prisma.visitor.count({
      where: {
        lastSeen: {
          gte: fiveMinutesAgo
        }
      }
    })

    return NextResponse.json({ activeVisitors })
  } catch (error) {
    console.error('Error fetching active visitors:', error)
    return NextResponse.json({ error: 'Failed to fetch active visitors' }, { status: 500 })
  }
}