import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const approved = searchParams.get('approved')
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')

    const where: any = {}
    
    if (approved === 'true') {
      where.approved = true
    } else if (approved === 'false') {
      where.approved = false
    }
    
    if (category) {
      where.category = category
    }
    
    if (userId) {
      where.uploader = userId
    }

    const templates = await prisma.template.findMany({
      where,
      include: {
        uploaderUser: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, image, source, requireApproval, autoApprove } = body

    if (!name || !image) {
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 })
    }

    // Ensure user exists in our database
    await prisma.user.upsert({
      where: { id: userId },
      update: { 
        lastActive: new Date(),
        templatesUploaded: { increment: 1 }
      },
      create: {
        id: userId,
        email: '', // Will be updated by webhook
        templatesUploaded: 1
      }
    })

    // Determine approval policy: only templates uploaded via the Templates page require admin approval
    const needsApproval = typeof requireApproval === 'boolean'
      ? requireApproval
      : (source === 'templatesPage')
    const isAutoApprove = typeof autoApprove === 'boolean' ? autoApprove : !needsApproval

    const template = await prisma.template.create({
      data: {
        name,
        description: description || '',
        category: category || 'other',
        image,
        uploader: userId,
        approved: isAutoApprove,
        approvedBy: isAutoApprove ? userId : null,
        approvedAt: isAutoApprove ? new Date() : null
      }
    })

    // Update statistics
    await prisma.statistics.upsert({
      where: { id: 'global' },
      update: {
        totalTemplates: { increment: 1 },
        ...(isAutoApprove
          ? { approvedTemplates: { increment: 1 } }
          : { pendingTemplates: { increment: 1 } })
      },
      create: {
        id: 'global',
        totalTemplates: 1,
        approvedTemplates: isAutoApprove ? 1 : 0,
        pendingTemplates: isAutoApprove ? 0 : 1
      }
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}