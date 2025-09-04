import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
    const ALLOWED_ADMIN_EMAIL = 'adnenanen@gmail.com'
    if (!email || email !== ALLOWED_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { templateId } = await request.json()
    if (!templateId) return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })

    const existing = await prisma.template.findUnique({ where: { id: templateId } })
    if (!existing) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

    await prisma.template.delete({ where: { id: templateId } })

    await prisma.statistics.upsert({
      where: { id: 'global' },
      update: {
        totalTemplates: { decrement: 1 },
        ...(existing.approved
          ? { approvedTemplates: { decrement: 1 } }
          : { pendingTemplates: { decrement: 1 } })
      },
      create: {
        id: 'global',
        totalTemplates: 0,
        approvedTemplates: 0,
        pendingTemplates: 0
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}