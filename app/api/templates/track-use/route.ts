import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const body = await request.json()
    const { templateImage } = body

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

    // Increment template uses
    await prisma.template.update({
      where: { id: template.id },
      data: { uses: { increment: 1 } }
    })

    // If user is authenticated, track their template usage
    if (userId) {
      // Ensure user exists
      await prisma.user.upsert({
        where: { id: userId },
        update: { lastActive: new Date() },
        create: {
          id: userId,
          email: '', // Will be updated by webhook
        }
      })

      // Track template usage for user (upsert to avoid duplicates)
      await prisma.userTemplateUsed.upsert({
        where: {
          userId_templateId: {
            userId,
            templateId: template.id
          }
        },
        update: {
          usedAt: new Date()
        },
        create: {
          userId,
          templateId: template.id
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking template use:', error)
    return NextResponse.json({ error: 'Failed to track template use' }, { status: 500 })
  }
}