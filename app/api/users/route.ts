import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { id: userId }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      include: {
        generationSessions: {
          select: {
            count: true,
            createdAt: true,
            template: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        templatesUsed: {
          include: {
            template: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        uploadedTemplates: {
          select: {
            id: true,
            name: true,
            approved: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        signedUpAt: 'desc'
      }
    })

    const totalUsers = await prisma.user.count()

    return NextResponse.json({ 
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}