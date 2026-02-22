"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function submitTastingScore(tastingId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const score = parseFloat(formData.get("score") as string);
    const notes = formData.get("notes") as string;

    if (isNaN(score) || score < 1 || score > 10) {
        throw new Error("Score skal være mellem 1 og 10");
    }

    // Upsert the score
    await prisma.tastingScore.upsert({
        where: {
            tasting_id_user_id: {
                tasting_id: tastingId,
                user_id: session.user.id
            }
        },
        update: { score, notes: notes || null },
        create: {
            tasting_id: tastingId,
            user_id: session.user.id,
            score,
            notes: notes || null
        }
    });

    // Calculate new average and auto-verdict for the tasting
    const allScores = await prisma.tastingScore.findMany({
        where: { tasting_id: tastingId }
    });

    if (allScores.length > 0) {
        const totalScore = allScores.reduce((acc, curr) => acc + curr.score, 0);
        const average_score = totalScore / allScores.length;

        let verdict = "Jævn";
        if (average_score >= 9) verdict = "Legendarisk";
        else if (average_score >= 8) verdict = "Fremragende";
        else if (average_score >= 6.5) verdict = "God";
        else if (average_score < 4) verdict = "Skuffelse";

        await prisma.tasting.update({
            where: { id: tastingId },
            data: { average_score, verdict }
        });

        // Also mark the bottle as tasted
        const tasting = await prisma.tasting.findUnique({ where: { id: tastingId } });
        if (tasting) {
            await prisma.bottle.update({
                where: { id: tasting.bottle_id },
                data: { is_tasted: true }
            });
        }
    }

    revalidatePath(`/tastings/${tastingId}`);
    revalidatePath(`/inventory`);
}
