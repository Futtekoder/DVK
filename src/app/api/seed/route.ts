import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const password = await bcrypt.hash("dvk2026", 10);

        // Create admin
        await prisma.user.upsert({
            where: { email: "admin@dvk.dk" },
            update: {},
            create: {
                email: "admin@dvk.dk",
                name: "DVK Admin",
                password,
                role: "admin",
            },
        });

        // Create 4 members
        const members = [
            { email: "medlem1@dvk.dk", name: "Medlem 1" },
            { email: "medlem2@dvk.dk", name: "Medlem 2" },
            { email: "medlem3@dvk.dk", name: "Medlem 3" },
            { email: "medlem4@dvk.dk", name: "Medlem 4" },
        ];

        for (const member of members) {
            await prisma.user.upsert({
                where: { email: member.email },
                update: {},
                create: {
                    email: member.email,
                    name: member.name,
                    password,
                    role: "member",
                },
            });
        }

        return NextResponse.json({ success: true, message: "Seeded" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
