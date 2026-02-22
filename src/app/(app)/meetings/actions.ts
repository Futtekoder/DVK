"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function createMeeting(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const dateStr = formData.get("date") as string;
    const location = formData.get("location") as string;

    if (!title) {
        throw new Error("Meeting title is required");
    }

    const meeting = await prisma.meeting.create({
        data: {
            title,
            date: dateStr ? new Date(dateStr) : null,
            location: location || null,
            status: "planning"
        }
    });

    revalidatePath("/meetings");
    revalidatePath("/");
    redirect(`/meetings/${meeting.id}`);
}
