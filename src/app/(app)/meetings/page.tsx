import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, CalendarDays, MapPin, Users, Wine } from "lucide-react";

export default async function MeetingsPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const meetings = await prisma.meeting.findMany({
        orderBy: { date: 'asc' },
        include: {
            _count: {
                select: { proposals: true, tastings: true }
            }
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'planning': return 'bg-secondary text-text-muted border-white/10';
            case 'voting': return 'bg-wine-burgundy/20 text-accent-gold border-accent-gold/20';
            case 'scheduled': return 'bg-accent-amber/20 text-accent-amber border-accent-amber/30';
            case 'completed': return 'bg-wine-deep/40 text-text-primary border-wine-deep';
            default: return 'bg-secondary text-text-muted border-white/10';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'planning': return 'Planlægges';
            case 'voting': return 'Afstemning I Gang';
            case 'scheduled': return 'Planlagt';
            case 'completed': return 'Afholdt';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Møder</h1>
                    <p className="text-text-secondary mt-2">Klubbens smagninger, afstemninger og samvær.</p>
                </div>
                {isAdmin && (
                    <Link href="/meetings/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Opret Møde
                    </Link>
                )}
            </header>

            {meetings.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-20 text-text-muted text-center space-y-4">
                    <CalendarDays className="w-12 h-12 text-wine-deep" />
                    <p className="text-lg">Ingen møder i kalenderen.</p>
                    {isAdmin && (
                        <Link href="/meetings/new" className="text-accent-gold hover:underline">
                            Planlæg det første møde.
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {meetings.map((meeting) => (
                        <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="group block">
                            <div className="card h-full flex flex-col relative overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1">

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(meeting.status)}`}>
                                        {getStatusLabel(meeting.status)}
                                    </div>
                                </div>

                                <h3 className="text-xl font-playfair font-semibold leading-tight text-text-primary group-hover:text-accent-gold transition-colors mb-2">
                                    {meeting.title || "DVK Møde"}
                                </h3>

                                <div className="space-y-2 mt-2 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        <CalendarDays className="w-4 h-4 text-wine-deep" />
                                        <span>{meeting.date ? new Date(meeting.date).toLocaleDateString("da-DK", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "Dato afventer"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        <MapPin className="w-4 h-4 text-wine-deep" />
                                        <span>{meeting.location || "Lokation afventer"}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-sm text-text-muted">
                                    <div className="flex items-center gap-1.5">
                                        <Wine className="w-4 h-4" />
                                        <span>{meeting._count.proposals} Forslag</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{meeting.status === 'completed' ? meeting._count.tastings + " Smagt" : "4/4"}</span>
                                    </div>
                                </div>

                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
