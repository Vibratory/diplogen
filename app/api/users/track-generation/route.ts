import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { count = 1, templateImage } = body

    // Find template by image URL
    let templateId = null
    if (templateImage) {
      const template = await prisma.template.findFirst({
        where: { image: templateImage }
      })
      templateId = template?.id
    }

    // Update user stats
    await prisma.user.upsert({
      where: { id: userId },
      update: { 
        lastActive: new Date(),
        diplomasCreated: { increment: count }
      },
      create: {
        id: userId,
        email: '', // Will be updated by webhook
        diplomasCreated: count
      }
    })

    // Create generation session if template found
    if (templateId) {
      await prisma.generationSession.create({
        data: {
          userId,
          templateId,
          count
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking user generation:', error)
    return NextResponse.json({ error: 'Failed to track user generation' }, { status: 500 })
  }
}