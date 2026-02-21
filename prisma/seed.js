const { PrismaClient, Role } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('dvk2026', 10)

    // Create admin
    await prisma.user.upsert({
        where: { email: 'admin@dvk.dk' },
        update: {},
        create: {
            email: 'admin@dvk.dk',
            name: 'DVK Admin',
            password,
            role: Role.admin,
        },
    })

    // Create 4 members
    const members = [
        { email: 'medlem1@dvk.dk', name: 'Medlem 1' },
        { email: 'medlem2@dvk.dk', name: 'Medlem 2' },
        { email: 'medlem3@dvk.dk', name: 'Medlem 3' },
        { email: 'medlem4@dvk.dk', name: 'Medlem 4' },
    ]

    for (const member of members) {
        await prisma.user.upsert({
            where: { email: member.email },
            update: {},
            create: {
                email: member.email,
                name: member.name,
                password,
                role: Role.member,
            },
        })
    }

    console.log('Database seeded with admin and 4 members.')
    console.log('Login: admin@dvk.dk / dvk2026')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
