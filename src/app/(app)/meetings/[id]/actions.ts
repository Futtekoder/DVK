"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function proposeBottle(meetingId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const bottleId = formData.get("bottle_id") as string;
    if (!bottleId) throw new Error("Bottle ID is required");

    // Verify meeting is in planning state
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting || meeting.status !== 'planning') {
        throw new Error("Du kan kun foreslå flasker under planlægningsfasen");
    }

    try {
        await prisma.proposal.create({
            data: {
                meeting_id: meetingId,
                bottle_id: bottleId,
                user_id: session.user.id
            }
        });
    } catch (e: any) {
        if (e.code === 'P2002') {
            throw new Error("Denne flaske er allerede foreslået til mødet");
        }
        throw e;
    }

    revalidatePath(`/meetings/${meetingId}`);
    redirect(`/meetings/${meetingId}`);
}

export async function toggleVoteStatus(meetingId: string, proposalId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting || meeting.status !== 'voting') {
        throw new Error("Afstemningen er ikke åben for dette møde");
    }

    const existingVote = await prisma.vote.findUnique({
        where: {
            user_id_proposal_id: {
                user_id: session.user.id,
                proposal_id: proposalId
            }
        }
    });

    if (existingVote) {
        await prisma.vote.delete({ where: { id: existingVote.id } });
    } else {
        await prisma.vote.create({
            data: {
                user_id: session.user.id,
                proposal_id: proposalId
            }
        });
    }

    revalidatePath(`/meetings/${meetingId}`);
}
