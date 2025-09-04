import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET() {
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

    // Get current statistics
    const stats = await prisma.statistics.findUnique({
      where: { id: 'global' }
    })

    // Get real-time counts
    const totalUsers = await prisma.user.count()
    const totalTemplates = await prisma.template.count()
    const approvedTemplates = await prisma.template.count({
      where: { approved: true }
    })
    const pendingTemplates = await prisma.template.count({
      where: { approved: false }
    })
    const totalDiplomas = await prisma.generationSession.aggregate({
      _sum: { count: true }
    })

    // Get active visitors (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const activeVisitors = await prisma.visitor.count({
      where: {
        lastSeen: { gte: fiveMinutesAgo }
      }
    })

    // Get monthly growth (compare with last month)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const lastMonthUsers = await prisma.user.count({
      where: {
        signedUpAt: {
          gte: lastMonth,
          lt: thisMonth
        }
      }
    })

    const thisMonthUsers = await prisma.user.count({
      where: {
        signedUpAt: {
          gte: thisMonth
        }
      }
    })

    const monthlyGrowth = lastMonthUsers > 0 ? 
      ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0

    // Get template categories distribution
    const templateCategories = await prisma.template.groupBy({
      by: ['category'],
      where: { approved: true },
      _count: { category: true }
    })

    // Get top templates by usage
    const topTemplates = await prisma.template.findMany({
      where: { approved: true },
      orderBy: { uses: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        uses: true,
        generatedDiplomas: true,
        category: true
      }
    })

    // Get recent activity
    const recentSessions = await prisma.generationSession.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        template: { select: { name: true } }
      }
    })

    // Update statistics in database
    await prisma.statistics.upsert({
      where: { id: 'global' },
      update: {
        totalUsers,
        totalTemplates,
        approvedTemplates,
        pendingTemplates,
        totalDiplomas: totalDiplomas._sum.count || 0,
        activeUsers: activeVisitors,
        monthlyGrowth
      },
      create: {
        id: 'global',
        totalUsers,
        totalTemplates,
        approvedTemplates,
        pendingTemplates,
        totalDiplomas: totalDiplomas._sum.count || 0,
        activeUsers: activeVisitors,
        monthlyGrowth
      }
    })

    return NextResponse.json({
      totalDiplomas: totalDiplomas._sum.count || 0,
      totalUsers,
      totalTemplates,
      approvedTemplates,
      pendingTemplates,
      activeVisitors,
      monthlyGrowth,
      templateCategories,
      topTemplates,
      recentActivity: recentSessions
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}