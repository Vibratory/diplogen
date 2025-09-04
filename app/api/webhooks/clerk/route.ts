import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma } from '@/lib/db'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, created_at } = evt.data
      
      await prisma.user.upsert({
        where: { id },
        update: {
          email: email_addresses[0]?.email_address || '',
          lastActive: new Date()
        },
        create: {
          id,
          email: email_addresses[0]?.email_address || '',
          signedUpAt: new Date(created_at)
        }
      })

      // Update global statistics
      await prisma.statistics.upsert({
        where: { id: 'global' },
        update: {
          totalUsers: { increment: 1 }
        },
        create: {
          id: 'global',
          totalUsers: 1
        }
      })
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses } = evt.data
      
      await prisma.user.upsert({
        where: { id },
        update: {
          email: email_addresses[0]?.email_address || '',
          lastActive: new Date()
        },
        create: {
          id,
          email: email_addresses[0]?.email_address || ''
        }
      })
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data
      
      await prisma.user.delete({
        where: { id }
      }).catch(() => {
        // User might not exist in our database
      })

      // Update global statistics
      await prisma.statistics.upsert({
        where: { id: 'global' },
        update: {
          totalUsers: { decrement: 1 }
        },
        create: {
          id: 'global',
          totalUsers: 0
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json({ error: 'Failed to handle webhook' }, { status: 500 })
  }
}