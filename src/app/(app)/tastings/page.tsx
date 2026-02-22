import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Wine, CalendarDays, Star, Search } from "lucide-react";

export default async function TastingsPage() {
    const session = await getServerSession(authOptions);

    const tastings = await prisma.tasting.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            meeting: true,
            bottle: true,
            _count: {
                select: { scores: true }
            }
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Smagninger</h1>
                    <p className="text-text-secondary mt-2">DVK&apos;s dom over kælderen.</p>
                </div>
            </header>

            {tastings.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-20 text-text-muted text-center space-y-4">
                    <Wine className="w-12 h-12 text-wine-deep" />
                    <p className="text-lg">Ingen smagninger registreret endnu.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tastings.map((tasting) => (
                        <Link key={tasting.id} href={`/tastings/${tasting.id}`} className="group block">
                            <div className="card h-full flex flex-col relative overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1">

                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-xs font-bold px-3 py-1 rounded-full border bg-secondary border-white/10 text-text-muted">
                                        {tasting.meeting.title || "Ukendt møde"}
                                    </div>
                                    {tasting.average_score && (
                                        <div className="flex items-center gap-1 text-accent-gold font-bold">
                                            <Star className="w-4 h-4 fill-accent-gold" />
                                            <span>{tasting.average_score.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-16 h-20 bg-wine-burgundy/20 rounded-md flex items-center justify-center shrink-0">
                                        {tasting.bottle.image_url ? (
                                            <img src={tasting.bottle.image_url} alt="" className="h-full object-cover mix-blend-luminosity opacity-80" />
                                        ) : (
                                            <Wine className="w-6 h-6 text-wine-deep/50" />
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center flex-1">
                                        <p className="text-xs text-text-muted uppercase tracking-widest font-medium mb-1">
                                            {tasting.bottle.producer || "Ukendt Producent"}
                                        </p>
                                        <h3 className="text-xl font-playfair font-semibold leading-tight text-text-primary group-hover:text-accent-gold transition-colors mb-2 line-clamp-2">
                                            {tasting.bottle.name}
                                        </h3>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-sm text-text-muted">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays className="w-4 h-4 text-wine-deep" />
                                        <span>{tasting.created_at.toLocaleDateString("da-DK")}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span>{tasting._count.scores} anmeldelser</span>
                                    </div>
                                </div>

                                {tasting.verdict && (
                                    <div className="absolute top-0 right-0 h-10 w-10 overflow-hidden transform group-hover:scale-110 transition-transform">
                                        <div className="absolute top-0 right-0 w-20 h-5 bg-wine-burgundy/60 text-[8px] uppercase tracking-widest text-accent-gold font-bold flex items-center justify-center origin-bottom-left rotate-45 transform translate-x-5 -translate-y-2">
                                            {tasting.verdict}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
