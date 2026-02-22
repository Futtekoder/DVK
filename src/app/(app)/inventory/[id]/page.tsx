import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, TrendingUp, TrendingDown, Wine, Calendar, History } from "lucide-react";

export default async function BottleDetailsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const bottle = await prisma.bottle.findUnique({
        where: { id: params.id },
        include: {
            tastings: {
                include: { meeting: true },
                orderBy: { created_at: 'desc' }
            }
        }
    });

    if (!bottle) {
        notFound();
    }

    const hasStock = bottle.stock > 0;
    const roi = bottle.market_value && bottle.purchase_price
        ? ((bottle.market_value - bottle.purchase_price) / bottle.purchase_price) * 100
        : null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4">
                <Link href="/inventory" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-accent-gold transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tilbage til Lager
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-text-muted uppercase tracking-widest font-medium">
                                {bottle.producer || "Ukendt Producent"} • {bottle.vintage || "NV"} • {bottle.type || "Ukendt Type"}
                            </span>
                            {!hasStock && (
                                <span className="bg-wine-deep text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                    Drukket (RIP)
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">{bottle.name}</h1>
                    </div>
                    {isAdmin && (
                        <Link href={`/inventory/${bottle.id}/edit`} className="btn flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Rediger
                        </Link>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Image & Key Details */}
                <div className="space-y-6">
                    <div className="card !p-0 overflow-hidden relative group">
                        <div className="aspect-[3/4] bg-wine-burgundy/10 flex items-center justify-center relative">
                            {bottle.image_url ? (
                                <img src={bottle.image_url} alt={bottle.name} className="h-full w-full object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                            ) : (
                                <Wine className="w-24 h-24 text-wine-deep/50" />
                            )}
                            {hasStock && (
                                <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-md text-accent-amber border border-accent-amber/30 text-sm font-bold px-4 py-2 rounded-full shadow-xl">
                                    {bottle.stock} På Lager
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Col: Stats & Investment & History */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Investment Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card space-y-1">
                            <p className="text-xs text-text-muted uppercase tracking-wider">Købspris</p>
                            <p className="text-2xl font-playfair font-medium">
                                {bottle.purchase_price ? `${bottle.purchase_price.toLocaleString("da-DK")} kr` : "Ukendt"}
                            </p>
                        </div>
                        <div className="card space-y-1">
                            <p className="text-xs text-text-muted uppercase tracking-wider">Estimeret Værdi</p>
                            <p className="text-2xl font-playfair font-medium text-accent-gold">
                                {bottle.market_value ? `${bottle.market_value.toLocaleString("da-DK")} kr` : "Ukendt"}
                            </p>
                        </div>
                        <div className="card space-y-1">
                            <p className="text-xs text-text-muted uppercase tracking-wider">ROI</p>
                            {roi !== null ? (
                                <div className={`flex items-center gap-2 text-2xl font-playfair font-medium ${roi >= 0 ? "text-green-500/90" : "text-wine-deep"}`}>
                                    {roi >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                    {roi > 0 ? "+" : ""}{roi.toFixed(1)}%
                                </div>
                            ) : (
                                <p className="text-2xl font-playfair font-medium text-text-muted">-</p>
                            )}
                        </div>
                    </div>

                    {/* Investment Chart Placeholder */}
                    <div className="card space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-playfair text-xl text-text-primary">Værdiudvikling</h2>
                            <span className="text-xs px-2 py-1 rounded bg-secondary text-text-muted">Seneste 12 mdr</span>
                        </div>
                        <div className="h-48 w-full bg-secondary/30 rounded-lg flex items-center justify-center border border-dashed border-white/5 relative overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-accent-gold/5 to-transparent"></div>
                            {/* Very fake rough line placeholder using SVG */}
                            <svg className="w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polyline points="0,80 20,70 40,75 60,40 80,45 100,20" fill="none" stroke="var(--accent-gold)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            </svg>
                            <p className="absolute text-sm text-text-muted font-medium">Graf data kommer snart</p>
                        </div>
                    </div>

                    {/* Tasting History */}
                    <div className="card space-y-4">
                        <h2 className="font-playfair text-xl text-text-primary flex items-center gap-2">
                            <History className="w-5 h-5 text-accent-gold" />
                            Smagningshistorik
                        </h2>

                        {bottle.tastings.length === 0 ? (
                            <div className="py-8 text-center text-text-muted border border-dashed border-white/5 rounded-lg bg-secondary/20">
                                Denne flaske har ikke været smagt i DVK endnu.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bottle.tastings.map((tasting) => (
                                    <div key={tasting.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-secondary/40 border border-white/5 gap-4">
                                        <div>
                                            <h3 className="font-medium text-text-primary">
                                                {tasting.meeting.title || "Ukendt Møde"}
                                            </h3>
                                            <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {tasting.meeting.date ? new Date(tasting.meeting.date).toLocaleDateString("da-DK") : "Ukendt dato"}
                                            </p>
                                        </div>

                                        {tasting.average_score && (
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-xs text-text-muted uppercase">DVK Score</p>
                                                    <p className="font-playfair text-xl text-accent-gold font-bold">
                                                        {tasting.average_score.toFixed(1)} <span className="text-sm font-normal text-text-muted">/ 10</span>
                                                    </p>
                                                </div>
                                                {tasting.verdict && (
                                                    <div className="h-full px-3 py-1.5 bg-wine-burgundy/20 text-accent-gold border border-accent-gold/20 rounded-md text-sm font-medium">
                                                        {tasting.verdict}
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
