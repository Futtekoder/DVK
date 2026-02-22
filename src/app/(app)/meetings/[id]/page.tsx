import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Users, Vote, Wine, Settings2, Plus, Check } from "lucide-react";
import { toggleVoteStatus } from "./actions";

export default async function MeetingDetailsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";
    const userId = session?.user?.id as string;

    const meeting = await prisma.meeting.findUnique({
        where: { id: params.id },
        include: {
            proposals: {
                include: {
                    bottle: true,
                    user: true,
                    votes: true
                }
            },
            tastings: {
                include: { bottle: true, scores: true }
            }
        }
    });

    if (!meeting) {
        notFound();
    }

    // Helper stats
    const statusLabels: Record<string, string> = {
        'planning': 'Planlægges',
        'voting': 'Afstemning',
        'scheduled': 'Planlagt',
        'completed': 'Afholdt'
    };

    const statusColors: Record<string, string> = {
        'planning': 'bg-secondary text-text-muted border-white/10',
        'voting': 'bg-wine-burgundy/20 text-accent-gold border-accent-gold/20',
        'scheduled': 'bg-accent-amber/20 text-accent-amber border-accent-amber/30',
        'completed': 'bg-wine-deep/40 text-text-primary border-wine-deep'
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-white/5 pb-6">
                <Link href="/meetings" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-accent-gold transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tilbage til Møder
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full border ${statusColors[meeting.status]}`}>
                                {statusLabels[meeting.status]}
                            </span>
                        </div>
                        <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">{meeting.title || "DVK Møde"}</h1>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <button className="btn flex items-center gap-2">
                                <Settings2 className="w-4 h-4" /> Administrer Status
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-6 pt-2 text-text-secondary">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-wine-deep" />
                        <span>{meeting.date ? new Date(meeting.date).toLocaleDateString("da-DK", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "Dato mangler"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-wine-deep" />
                        <span>{meeting.location || "Lokation mangler"}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Flow Context based on Status */}
                <div className="lg:col-span-2 space-y-8">

                    {meeting.status === 'planning' && (
                        <div className="card space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h2 className="font-playfair text-2xl">Flaskeforslag</h2>
                                <Link href={`/meetings/${meeting.id}/propose`} className="btn btn-primary flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Foreslå Flaske
                                </Link>
                            </div>
                            {meeting.proposals.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-text-muted bg-secondary/20 rounded-lg border border-dashed border-white/5">
                                    <Wine className="w-8 h-8 opacity-50 mb-3" />
                                    <p>Ingen flasker foreslået endnu.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {meeting.proposals.map(prop => (
                                        <div key={prop.id} className="p-4 rounded-xl bg-secondary/40 border border-white/5 flex gap-4">
                                            <div className="w-16 h-20 bg-wine-burgundy/20 rounded-md flex items-center justify-center shrink-0">
                                                {prop.bottle.image_url ? (
                                                    <img src={prop.bottle.image_url} alt="" className="h-full object-cover mix-blend-luminosity opacity-80" />
                                                ) : (
                                                    <Wine className="w-6 h-6 text-wine-deep/50" />
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <p className="text-xs text-text-muted mb-1">Foreslået af: {prop.user.name.split(' ')[0]}</p>
                                                <p className="font-playfair font-semibold leading-tight">{prop.bottle.name}</p>
                                                <p className="text-xs text-text-muted mt-1">{prop.bottle.vintage || "NV"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {meeting.status === 'voting' && (
                        <div className="card space-y-6">
                            <div>
                                <h2 className="font-playfair text-2xl text-accent-gold">Afstemning Er Åben</h2>
                                <p className="text-text-secondary mt-1 text-sm">Stem på de flasker, du helst vil smage (anonymt indtil låst).</p>
                            </div>
                            <div className="space-y-4">
                                {meeting.proposals.map(prop => {
                                    const hasVoted = prop.votes.some(v => v.user_id === userId);
                                    return (
                                        <div key={prop.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${hasVoted ? 'bg-wine-burgundy/10 border-accent-gold/30' : 'bg-secondary/40 border-white/5'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-16 bg-wine-burgundy/20 rounded-md flex items-center justify-center shrink-0">
                                                    {prop.bottle.image_url ? (
                                                        <img src={prop.bottle.image_url} alt="" className="h-full object-cover mix-blend-luminosity opacity-80" />
                                                    ) : (
                                                        <Wine className="w-5 h-5 text-wine-deep/50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-playfair font-semibold leading-tight">{prop.bottle.name}</p>
                                                    <p className="text-xs text-text-muted mt-1">{prop.bottle.producer} • {prop.bottle.vintage || "NV"}</p>
                                                </div>
                                            </div>
                                            <form action={toggleVoteStatus.bind(null, meeting.id, prop.id)}>
                                                <button className={`btn flex items-center gap-2 ${hasVoted ? 'bg-transparent text-accent-gold border-accent-gold/50' : ''}`}>
                                                    {hasVoted ? <><Check className="w-4 h-4" /> Valgt</> : "Stem"}
                                                </button>
                                            </form>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {(meeting.status === 'scheduled' || meeting.status === 'completed') && (
                        <div className="card space-y-4">
                            <h2 className="font-playfair text-2xl">{meeting.status === 'scheduled' ? 'Udvalgte Flasker' : 'Smagte Flasker'}</h2>
                            <div className="space-y-4">
                                {meeting.tastings.length === 0 ? (
                                    <div className="py-8 text-center text-text-muted border border-dashed border-white/5 rounded-lg bg-secondary/20">
                                        Ingen resultater endnu.
                                    </div>
                                ) : (
                                    meeting.tastings.map(tasting => (
                                        <div key={tasting.id} className="p-4 rounded-xl bg-secondary/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <p className="font-playfair font-semibold leading-tight text-lg">{tasting.bottle.name}</p>
                                                <p className="text-xs text-text-muted mt-1">{tasting.bottle.vintage || "NV"}</p>
                                            </div>
                                            {meeting.status === 'completed' && tasting.average_score && (
                                                <div className="text-right">
                                                    <p className="text-xs text-text-muted uppercase">Gns. DVK Score</p>
                                                    <p className="font-playfair text-xl text-accent-gold font-bold">
                                                        {tasting.average_score.toFixed(1)} <span className="text-sm font-normal text-text-muted">/ 10</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Status info block */}
                <div className="space-y-6">
                    <div className="card space-y-4">
                        <h3 className="font-medium text-text-primary uppercase tracking-wider text-sm border-b border-white/5 pb-2">Status</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {meeting.status === 'planning' && 'Dette møde er i planlægningsfasen. Medlemmer kan foreslå flasker under "Flaskeforslag". Når nok flasker er samlet, kan admin starte afstemningen.'}
                            {meeting.status === 'voting' && 'Afstemningen er i fuld gang. Afgiv din anonyme stemme på de flasker, der skal åbnes til månedens/kvartalets møde.'}
                            {meeting.status === 'scheduled' && 'Afstemningen er slut, og mødet er låst i kalenderen. Vi ses til smagning!'}
                            {meeting.status === 'completed' && 'Mødet er afholdt. Se smagsnoter, point og domme.'}
                        </p>
                    </div>

                    <div className="card space-y-4">
                        <h3 className="font-medium text-text-primary uppercase tracking-wider text-sm border-b border-white/5 pb-2">Deltagere</h3>
                        <div className="flex -space-x-3 overflow-hidden p-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="inline-block h-10 w-10 rounded-full bg-wine-burgundy/50 ring-2 ring-card flex items-center justify-center text-xs font-bold text-accent-gold shadow-sm">
                                    {session?.user?.name ? session.user.name[0] : 'M'}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-text-muted text-center">+ 4 afventer svar</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
