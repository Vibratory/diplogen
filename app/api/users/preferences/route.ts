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
    const { language } = body

    if (!language) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 })
    }

    // Update user language preference
    await prisma.user.upsert({
      where: { id: userId },
      update: { 
        languagePreference: language,
        lastActive: new Date()
      },
      create: {
        id: userId,
        email: '', // Will be updated by webhook
        languagePreference: language
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        languagePreference: true,
        diplomasCreated: true,
        templatesUploaded: true,
        signedUpAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        languagePreference: 'en',
        diplomasCreated: 0,
        templatesUploaded: 0,
        signedUpAt: new Date()
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}