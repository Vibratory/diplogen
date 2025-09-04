import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Strict admin check: only the allowed email can approve/reject
    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
    const ALLOWED_ADMIN_EMAIL = 'adnenanen@gmail.com'
    if (!email || email !== ALLOWED_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { templateId, approved } = body

    if (!templateId || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Template ID and approval status are required' }, { status: 400 })
    }

    let template
    if (approved) {
      template = await prisma.template.update({
        where: { id: templateId },
        data: {
          approved: true,
          approvedBy: userId,
          approvedAt: new Date(),
        }
      })
    } else {
      // On rejection, delete the template record
      const existing = await prisma.template.findUnique({ where: { id: templateId } })
      if (existing) {
        await prisma.template.delete({ where: { id: templateId } })
      }
      template = existing as any
    }

    // Update admin stats and global statistics accordingly
    if (approved) {
      // Upsert admin stats for the allowed admin only
      await prisma.admin.upsert({
        where: { email: 'adnenanen@gmail.com' },
        update: { approvedTemplates: { increment: 1 } },
        create: {
          id: userId,
          email: 'adnenanen@gmail.com',
          name: user?.fullName || 'Admin',
          approvedTemplates: 1,
          uploadedTemplates: 0,
        },
      })

      await prisma.statistics.upsert({
        where: { id: 'global' },
        update: {
          approvedTemplates: { increment: 1 },
          pendingTemplates: { decrement: 1 }
        },
        create: {
          id: 'global',
          approvedTemplates: 1,
          pendingTemplates: 0
        }
      })
    } else {
      // Rejection: reduce pending count but do not increase approvedTemplates
      await prisma.statistics.upsert({
        where: { id: 'global' },
        update: {
          pendingTemplates: { decrement: 1 }
        },
        create: {
          id: 'global',
          approvedTemplates: 0,
          pendingTemplates: 0
        }
      })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error approving template:', error)
    return NextResponse.json({ error: 'Failed to approve template' }, { status: 500 })
  }
}