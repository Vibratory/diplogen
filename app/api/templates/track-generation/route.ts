import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const body = await request.json()
    const { templateImage, count = 1 } = body

    if (!templateImage) {
      return NextResponse.json({ error: 'Template image is required' }, { status: 400 })
    }

    // Find template by image URL
    const template = await prisma.template.findFirst({
      where: { image: templateImage }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Increment template generation count
    await prisma.template.update({
      where: { id: template.id },
      data: { generatedDiplomas: { increment: count } }
    })

    // If user is authenticated, create generation session
    if (userId) {
      // Ensure user exists
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

      // Create generation session
      await prisma.generationSession.create({
        data: {
          userId,
          templateId: template.id,
          count
        }
      })
    }

    // Update global statistics
    await prisma.statistics.upsert({
      where: { id: 'global' },
      update: {
        totalDiplomas: { increment: count }
      },
      create: {
        id: 'global',
        totalDiplomas: count
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking template generation:', error)
    return NextResponse.json({ error: 'Failed to track template generation' }, { status: 500 })
  }
}