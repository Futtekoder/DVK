import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Wine, Star, CalendarDays, Edit3, Users } from "lucide-react";
import { submitTastingScore } from "./actions";

export default async function TastingDetailsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = session.user.id;

    const tasting = await prisma.tasting.findUnique({
        where: { id: params.id },
        include: {
            meeting: true,
            bottle: true,
            scores: {
                include: { user: true },
                orderBy: { created_at: 'desc' }
            }
        }
    });

    if (!tasting) notFound();

    const myScore = tasting.scores.find(s => s.user_id === userId);
    const submitAction = submitTastingScore.bind(null, tasting.id);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-white/5 pb-6">
                <Link href="/tastings" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-accent-gold transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tilbage til Smagninger
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs uppercase font-bold px-3 py-1 rounded-full border bg-secondary border-white/10 text-text-muted">
                                {tasting.meeting.title || "Ukendt Møde"}
                            </span>
                            <span className="text-xs uppercase font-bold px-3 py-1 rounded-full border bg-wine-burgundy/20 border-accent-gold/20 text-accent-gold flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {tasting.meeting.date ? new Date(tasting.meeting.date).toLocaleDateString("da-DK") : "Dato mangler"}
                            </span>
                        </div>
                        <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">{tasting.bottle.name}</h1>
                        <p className="text-text-secondary mt-1">{tasting.bottle.producer} • {tasting.bottle.vintage || "NV"}</p>
                    </div>

                    {tasting.average_score && (
                        <div className="text-right card !py-3 !px-6 border-accent-gold/20 bg-wine-burgundy/10">
                            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">DVK Dom</p>
                            <div className="flex items-end gap-3">
                                <p className="font-playfair text-3xl font-bold text-accent-gold">
                                    {tasting.average_score.toFixed(1)} <span className="text-lg text-text-muted font-normal">/ 10</span>
                                </p>
                                {tasting.verdict && (
                                    <span className="text-sm font-bold uppercase tracking-wider text-wine-deep bg-accent-gold px-2 py-1 rounded mb-1">
                                        {tasting.verdict}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Tasting Score Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card space-y-6 !border-accent-gold/30">
                        <h2 className="font-playfair text-2xl flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-accent-gold" />
                            {myScore ? 'Din Anmeldelse' : 'Anmeld Flasken'}
                        </h2>

                        <form action={submitAction} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text-secondary">DVK Point (1-10)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        name="score"
                                        min="1"
                                        max="10"
                                        step="0.5"
                                        defaultValue={myScore?.score || 5}
                                        className="flex-1 accent-accent-gold"
                                        onChange={(e) => {
                                            const display = document.getElementById("scoreDisplay");
                                            if (display) display.textContent = parseFloat(e.target.value).toFixed(1);
                                        }}
                                    />
                                    <div className="w-12 h-12 rounded-full bg-secondary border border-white/10 flex items-center justify-center font-playfair font-bold text-xl text-accent-gold shrink-0">
                                        <span id="scoreDisplay">{myScore?.score.toFixed(1) || "5.0"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-text-secondary">Smagsnoter</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={4}
                                    defaultValue={myScore?.notes || ""}
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-gold transition-colors custom-scrollbar resize-none"
                                    placeholder="Hvad synes du om vinen? Næse, palette, finish..."
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-full">
                                {myScore ? 'Opdater Anmeldelse' : 'Gem Anmeldelse'}
                            </button>
                        </form>
                    </div>

                    <div className="w-full aspect-[3/4] bg-wine-burgundy/10 flex items-center justify-center rounded-xl border border-white/5 overflow-hidden">
                        {tasting.bottle.image_url ? (
                            <img src={tasting.bottle.image_url} alt="" className="h-full w-full object-cover mix-blend-luminosity opacity-80" />
                        ) : (
                            <Wine className="w-24 h-24 text-wine-deep/50" />
                        )}
                    </div>
                </div>

                {/* Right Column: All Scores */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card space-y-6">
                        <h2 className="font-playfair text-2xl flex items-center gap-2 border-b border-white/5 pb-4">
                            <Users className="w-5 h-5 text-wine-deep" />
                            Medlemmernes Dom
                        </h2>

                        {tasting.scores.length === 0 ? (
                            <div className="py-12 text-center text-text-muted">
                                Ingen medlemmer har anmeldt denne flaske endnu.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasting.scores.map(score => (
                                    <div key={score.id} className="p-4 rounded-xl bg-secondary/40 border border-white/5 flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-wine-burgundy/50 ring-2 ring-card flex items-center justify-center text-sm font-bold text-accent-gold shrink-0">
                                            {score.user.name[0]}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-text-primary">{score.user.name}</p>
                                                    <p className="text-xs text-text-muted mt-0.5">{score.created_at.toLocaleDateString("da-DK")}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-accent-gold font-bold bg-white/5 px-2 py-1 rounded">
                                                    <Star className="w-4 h-4 fill-accent-gold" />
                                                    <span>{score.score.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            {score.notes && (
                                                <p className="text-sm text-text-secondary leading-relaxed italic bg-black/20 p-3 rounded-r-lg border-l-2 border-wine-deep">
                                                    &quot;{score.notes}&quot;
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
