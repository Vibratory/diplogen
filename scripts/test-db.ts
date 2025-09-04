import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  console.log('Testing database connection...')

  try {
    // Test basic queries
    const templateCount = await prisma.template.count()
    const userCount = await prisma.user.count()
    const adminCount = await prisma.admin.count()

    console.log(`Templates: ${templateCount}`)
    console.log(`Users: ${userCount}`)
    console.log(`Admins: ${adminCount}`)

    // Test approved templates
    const approvedTemplates = await prisma.template.findMany({
      where: { approved: true },
      select: { name: true, uses: true, generatedDiplomas: true }
    })

    console.log('\nApproved templates:')
    approvedTemplates.forEach(t => {
      console.log(`- ${t.name}: ${t.uses} uses, ${t.generatedDiplomas} diplomas`)
    })

    // Test pending templates
    const pendingTemplates = await prisma.template.findMany({
      where: { approved: false },
      select: { name: true, category: true }
    })

    console.log('\nPending templates:')
    pendingTemplates.forEach(t => {
      console.log(`- ${t.name} (${t.category})`)
    })

    // Test statistics
    const stats = await prisma.statistics.findUnique({
      where: { id: 'global' }
    })

    console.log('\nGlobal statistics:')
    console.log(JSON.stringify(stats, null, 2))

    console.log('\nDatabase test completed successfully!')

  } catch (error) {
    console.error('Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()