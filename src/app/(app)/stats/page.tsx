import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrendingUp, TrendingDown, Crown, Frown, Users, BarChart3, Wine } from "lucide-react";
import Link from "next/link";

export default async function StatsPage() {
    const session = await getServerSession(authOptions);

    // Fetch all bottles that have financial data
    const bottles = await prisma.bottle.findMany({
        where: { purchase_price: { not: null }, market_value: { not: null } }
    });

    let totalPurchase = 0;
    let totalMarket = 0;
    bottles.forEach(b => {
        totalPurchase += (b.purchase_price || 0) * b.stock;
        totalMarket += (b.market_value || 0) * b.stock;
    });

    const totalRoi = totalPurchase > 0 ? ((totalMarket - totalPurchase) / totalPurchase) * 100 : 0;

    // Best / Worst Rated Bottles
    const tastings = await prisma.tasting.findMany({
        where: { average_score: { not: null } },
        include: { bottle: true },
        orderBy: { average_score: 'desc' },
    });

    const bestRated = tastings.slice(0, 3);
    const worstRated = tastings.slice().reverse().slice(0, 3);

    // Member Performance (Harsh vs Generous Critics)
    const users = await prisma.user.findMany({
        include: { tastingScores: true }
    });

    const memberStats = users.map(user => {
        const scores = user.tastingScores.map(s => s.score);
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return { name: user.name, avg, count: scores.length };
    }).filter(u => u.count > 0).sort((a, b) => b.avg - a.avg);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <header className="border-b border-white/5 pb-6">
                <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Statistik</h1>
                <p className="text-text-secondary mt-2">DVK&apos;s samlede resultater og analyser.</p>
            </header>

            {/* Main ROI Card */}
            <div className="card bg-gradient-to-br from-card to-wine-deep/10 border-accent-gold/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" /> Portefølje ROI (Estimeret)
                        </h2>
                        <div className={`flex items-end gap-4 ${totalRoi >= 0 ? 'text-green-500/90' : 'text-wine-deep'}`}>
                            <p className="text-5xl font-playfair font-bold">
                                {totalRoi > 0 ? "+" : ""}{totalRoi.toFixed(1)}%
                            </p>
                            {totalRoi >= 0 ? <TrendingUp className="w-8 h-8 mb-1" /> : <TrendingDown className="w-8 h-8 mb-1" />}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 text-right">
                        <div>
                            <p className="text-xs text-text-muted uppercase mb-1">Investeret Værdi</p>
                            <p className="text-xl font-medium">{totalPurchase.toLocaleString("da-DK")} kr</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-muted uppercase mb-1">Nuværende Værdi</p>
                            <p className="text-xl font-medium text-accent-gold">{totalMarket.toLocaleString("da-DK")} kr</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Hall of Fame */}
                <div className="card space-y-6 !border-accent-gold/20">
                    <h3 className="font-playfair text-2xl flex items-center gap-2">
                        <Crown className="w-6 h-6 text-accent-gold" /> Bedst Anmeldt
                    </h3>
                    <div className="space-y-4">
                        {bestRated.length === 0 ? (
                            <p className="text-text-muted italic">Ingen smagninger endnu.</p>
                        ) : bestRated.map((tasting, idx) => (
                            <Link key={tasting.id} href={`/tastings/${tasting.id}`} className="flex items-center gap-4 bg-secondary/30 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-accent-gold/20 text-accent-gold font-bold flex items-center justify-center shrink-0">
                                    #{idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-playfair font-semibold truncate leading-tight">{tasting.bottle.name}</p>
                                    <p className="text-xs text-text-muted">{tasting.bottle.vintage || "NV"}</p>
                                </div>
                                <div className="text-xl font-bold text-accent-gold">
                                    {tasting.average_score?.toFixed(1)}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Hall of Shame */}
                <div className="card space-y-6">
                    <h3 className="font-playfair text-2xl flex items-center gap-2 text-wine-deep">
                        <Frown className="w-6 h-6 text-wine-deep" /> Største Skuffelser
                    </h3>
                    <div className="space-y-4">
                        {worstRated.length === 0 ? (
                            <p className="text-text-muted italic">Ingen smagninger endnu.</p>
                        ) : worstRated.map((tasting, idx) => (
                            <Link key={tasting.id} href={`/tastings/${tasting.id}`} className="flex items-center gap-4 bg-secondary/30 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-wine-burgundy/20 text-wine-deep font-bold flex items-center justify-center shrink-0">
                                    #{tastings.length - idx}
                                </div>
                                <div className="flex-1">
                                    <p className="font-playfair font-semibold truncate leading-tight">{tasting.bottle.name}</p>
                                    <p className="text-xs text-text-muted">{tasting.bottle.vintage || "NV"}</p>
                                </div>
                                <div className="text-xl font-bold text-wine-deep opacity-80">
                                    {tasting.average_score?.toFixed(1)}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Member Performance */}
                <div className="lg:col-span-2 card space-y-6 mt-4">
                    <h3 className="font-playfair text-2xl flex items-center gap-2 border-b border-white/5 pb-4">
                        <Users className="w-6 h-6 text-text-secondary" /> Klubbens Dommere
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {memberStats.length === 0 ? (
                            <p className="text-text-muted italic col-span-3">Ingen scores afgivet af medlemmer endnu.</p>
                        ) : memberStats.map((member, idx) => (
                            <div key={member.name} className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                                <div>
                                    <p className="font-medium text-text-primary">{member.name}</p>
                                    <p className="text-xs text-text-muted mt-1">{member.count} anmeldelser</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Gns. DVK</p>
                                    <p className="font-playfair text-2xl text-accent-gold font-bold">{member.avg.toFixed(1)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
