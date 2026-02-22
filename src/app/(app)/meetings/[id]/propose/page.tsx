import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Wine } from "lucide-react";
import { proposeBottle } from "../actions";

export default async function ProposeBottlePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return null;
    }

    const meeting = await prisma.meeting.findUnique({
        where: { id: params.id },
        include: { proposals: true }
    });

    if (!meeting || meeting.status !== 'planning') {
        notFound();
    }

    // Get bottles not already proposed
    const proposedBottleIds = meeting.proposals.map(p => p.bottle_id);
    const availableBottles = await prisma.bottle.findMany({
        where: {
            stock: { gt: 0 },
            id: { notIn: proposedBottleIds }
        },
        orderBy: { created_at: 'desc' }
    });

    // Bind the meeting ID to the server action
    const proposeAction = proposeBottle.bind(null, meeting.id);

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-white/5 pb-6">
                <Link href={`/meetings/${meeting.id}`} className="inline-flex items-center text-sm font-medium text-text-muted hover:text-accent-gold transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tilbage til Mødet
                </Link>
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Foreslå Flaske</h1>
                    <p className="text-text-secondary mt-2">Vælg en flaske fra kælderen til {meeting.title}.</p>
                </div>
            </header>

            {availableBottles.length === 0 ? (
                <div className="card text-center py-12 text-text-muted">
                    Der er ingen tilgængelige flasker på lager, som ikke allerede er foreslået.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {availableBottles.map(bottle => (
                        <div key={bottle.id} className="p-4 rounded-xl bg-secondary/40 border border-white/5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-16 bg-wine-burgundy/20 rounded-md flex items-center justify-center shrink-0">
                                    {bottle.image_url ? (
                                        <img src={bottle.image_url} alt="" className="h-full object-cover mix-blend-luminosity opacity-80" />
                                    ) : (
                                        <Wine className="w-5 h-5 text-wine-deep/50" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-playfair font-semibold leading-tight">{bottle.name}</p>
                                    <p className="text-xs text-text-muted mt-1">{bottle.producer} • {bottle.vintage || "NV"}</p>
                                </div>
                            </div>
                            <form action={proposeAction}>
                                <input type="hidden" name="bottle_id" value={bottle.id} />
                                <button type="submit" className="btn btn-primary">
                                    Foreslå
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
