import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create some sample templates
  const templates = await Promise.all([
    prisma.template.create({
      data: {
        name: 'Professional Diploma',
        description: 'A professional-looking diploma template',
        category: 'education',
        image: '/professional-diploma-template.png',
        approved: true,
        approvedBy: 'admin',
        approvedAt: new Date(),
        uses: 45,
        generatedDiplomas: 123
      }
    }),
    prisma.template.create({
      data: {
        name: 'Classic Certificate',
        description: 'A classic certificate design',
        category: 'awards',
        image: '/classic-diploma-template.png',
        approved: true,
        approvedBy: 'admin',
        approvedAt: new Date(),
        uses: 32,
        generatedDiplomas: 87
      }
    }),
    prisma.template.create({
      data: {
        name: 'Modern Clean Certificate',
        description: 'A modern and clean certificate template',
        category: 'training',
        image: '/modern-clean-certificate.png',
        approved: true,
        approvedBy: 'admin',
        approvedAt: new Date(),
        uses: 28,
        generatedDiplomas: 65
      }
    }),
    prisma.template.create({
      data: {
        name: 'Elegant Diploma',
        description: 'An elegant diploma template',
        category: 'education',
        image: '/elegant-diploma-template.png',
        approved: true,
        approvedBy: 'admin',
        approvedAt: new Date(),
        uses: 19,
        generatedDiplomas: 41
      }
    }),
    prisma.template.create({
      data: {
        name: 'Pending Template',
        description: 'A template waiting for approval',
        category: 'other',
        image: '/pending-template.png',
        approved: false,
        uses: 0,
        generatedDiplomas: 0
      }
    })
  ])

  // Create the only allowed admin user. Update the id to the real Clerk user ID after first login if needed.
  await prisma.admin.upsert({
    where: { email: 'adnenanen@gmail.com' },
    update: {},
    create: {
      id: 'admin_user_id', // TODO: replace with real Clerk user ID for adnenanen@gmail.com
      name: 'Admin',
      email: 'adnenanen@gmail.com',
      approvedTemplates: 0,
      uploadedTemplates: 0,
    }
  })

  // Create some sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user_1',
        email: 'user1@example.com',
        diplomasCreated: 5,
        templatesUploaded: 0,
        languagePreference: 'en'
      }
    }),
    prisma.user.create({
      data: {
        id: 'user_2',
        email: 'user2@example.com',
        diplomasCreated: 12,
        templatesUploaded: 1,
        languagePreference: 'es'
      }
    }),
    prisma.user.create({
      data: {
        id: 'user_3',
        email: 'user3@example.com',
        diplomasCreated: 3,
        templatesUploaded: 0,
        languagePreference: 'fr'
      }
    })
  ])

  // Create some generation sessions
  await Promise.all([
    prisma.generationSession.create({
      data: {
        userId: users[0].id,
        templateId: templates[0].id,
        count: 3
      }
    }),
    prisma.generationSession.create({
      data: {
        userId: users[0].id,
        templateId: templates[1].id,
        count: 2
      }
    }),
    prisma.generationSession.create({
      data: {
        userId: users[1].id,
        templateId: templates[0].id,
        count: 5
      }
    }),
    prisma.generationSession.create({
      data: {
        userId: users[1].id,
        templateId: templates[2].id,
        count: 7
      }
    })
  ])

  // Create template usage records
  await Promise.all([
    prisma.userTemplateUsed.create({
      data: {
        userId: users[0].id,
        templateId: templates[0].id
      }
    }),
    prisma.userTemplateUsed.create({
      data: {
        userId: users[0].id,
        templateId: templates[1].id
      }
    }),
    prisma.userTemplateUsed.create({
      data: {
        userId: users[1].id,
        templateId: templates[0].id
      }
    }),
    prisma.userTemplateUsed.create({
      data: {
        userId: users[1].id,
        templateId: templates[2].id
      }
    })
  ])

  // Create initial statistics
  await prisma.statistics.create({
    data: {
      id: 'global',
      totalDiplomas: 316,
      totalUsers: 3,
      totalTemplates: 5,
      approvedTemplates: 4,
      pendingTemplates: 1,
      activeUsers: 2,
      monthlyGrowth: 23.5,
      conversionRate: 12.8
    }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })