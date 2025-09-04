import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const forwarded = headersList.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     headersList.get('x-real-ip') || 
                     request.ip || 
                     'unknown'

    // Generate a session ID based on IP and user agent (simple approach)
    const sessionId = Buffer.from(`${ipAddress}-${userAgent}`).toString('base64').slice(0, 32)

    // Update or create visitor record
    await prisma.visitor.upsert({
      where: { sessionId },
      update: { 
        lastSeen: new Date(),
        userAgent,
        ipAddress
      },
      create: {
        sessionId,
        lastSeen: new Date(),
        userAgent,
        ipAddress
      }
    })

    // Clean up old visitor records (older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    await prisma.visitor.deleteMany({
      where: {
        lastSeen: {
          lt: fiveMinutesAgo
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating visitor heartbeat:', error)
    return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 })
  }
}