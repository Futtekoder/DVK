"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function createThread(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const meeting_id = formData.get("meeting_id") as string | null;
    const bottle_id = formData.get("bottle_id") as string | null;

    if (!title || !content) {
        throw new Error("Titel og indhold er påkrævet");
    }

    const thread = await prisma.thread.create({
        data: {
            title,
            author_id: session.user.id,
            meeting_id: meeting_id || null,
            bottle_id: bottle_id || null,
            posts: {
                create: {
                    content,
                    author_id: session.user.id
                }
            }
        }
    });

    revalidatePath("/forum");
    redirect(`/forum/${thread.id}`);
}

export async function createPost(threadId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const content = formData.get("content") as string;
    if (!content) throw new Error("Indhold er påkrævet");

    await prisma.post.create({
        data: {
            content,
            thread_id: threadId,
            author_id: session.user.id
        }
    });

    // Tap thread to update updated_at timestamp
    await prisma.thread.update({
        where: { id: threadId },
        data: { updated_at: new Date() }
    });

    revalidatePath(`/forum/${threadId}`);
    revalidatePath("/forum");
}
