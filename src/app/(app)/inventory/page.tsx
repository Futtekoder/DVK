import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Wine, TrendingUp, TrendingDown } from "lucide-react";

export default async function InventoryPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const bottles = await prisma.bottle.findMany({
        orderBy: { created_at: 'desc' },
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Lager</h1>
                    <p className="text-text-secondary mt-2">DVK&apos;s samlede vininvestering.</p>
                </div>
                {isAdmin && (
                    <Link href="/inventory/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Tilføj Flaske
                    </Link>
                )}
            </header>

            {bottles.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-20 text-text-muted text-center space-y-4">
                    <Wine className="w-12 h-12 text-wine-deep" />
                    <p className="text-lg">Kælderen er tom.</p>
                    {isAdmin && (
                        <Link href="/inventory/new" className="text-accent-gold hover:underline">
                            Vær den første til at tilføje en flaske.
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {bottles.map((bottle) => {
                        const hasStock = bottle.stock > 0;
                        const roi = bottle.market_value && bottle.purchase_price
                            ? ((bottle.market_value - bottle.purchase_price) / bottle.purchase_price) * 100
                            : null;

                        return (
                            <Link key={bottle.id} href={`/inventory/${bottle.id}`} className="group block">
                                <div className={`card h-full flex flex-col relative overflow-hidden transition-all duration-300 ${!hasStock ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                    {!hasStock && (
                                        <div className="absolute top-4 right-4 bg-wine-deep text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">
                                            Drukket (RIP)
                                        </div>
                                    )}
                                    {hasStock && (
                                        <div className="absolute top-4 right-4 bg-accent-amber/20 text-accent-amber border border-accent-amber/30 text-xs font-bold px-3 py-1 rounded-full z-10">
                                            I Kælderen ({bottle.stock})
                                        </div>
                                    )}

                                    <div className="h-48 -mx-6 -mt-6 mb-4 bg-wine-burgundy/10 flex items-center justify-center relative border-b border-white/5 group-hover:bg-wine-burgundy/20 transition-colors">
                                        {bottle.image_url ? (
                                            <img src={bottle.image_url} alt={bottle.name} className="h-full object-cover opacity-80 mix-blend-luminosity" />
                                        ) : (
                                            <Wine className="w-16 h-16 text-wine-deep/50" />
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <p className="text-xs text-text-muted uppercase tracking-widest font-medium mb-1">
                                            {bottle.producer || "Ukendt Producent"} • {bottle.vintage || "NV"}
                                        </p>
                                        <h3 className="text-xl font-playfair font-semibold leading-tight text-text-primary group-hover:text-accent-gold transition-colors mb-4 line-clamp-2">
                                            {bottle.name}
                                        </h3>

                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
                                            <div>
                                                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Værdi</p>
                                                <p className="font-medium text-lg">
                                                    {bottle.market_value ? `${bottle.market_value.toLocaleString("da-DK")} kr` : (
                                                        bottle.purchase_price ? `${bottle.purchase_price.toLocaleString("da-DK")} kr` : "Ukendt"
                                                    )}
                                                </p>
                                            </div>

                                            {roi !== null && (
                                                <div className={`flex items-center gap-1 text-sm font-medium ${roi >= 0 ? "text-green-500/80" : "text-wine-deep"}`}>
                                                    {roi >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                    {roi > 0 ? "+" : ""}{roi.toFixed(1)}%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
