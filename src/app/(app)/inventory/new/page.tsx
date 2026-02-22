import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createBottle } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewBottlePage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
        redirect("/inventory");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4">
                <Link href="/inventory" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-accent-gold transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tilbage til Lager
                </Link>
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Tilføj Flaske</h1>
                    <p className="text-text-secondary mt-2">Registrer en ny vin til kælderen.</p>
                </div>
            </header>

            <div className="card">
                <form action={createBottle} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Navn (Required)</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                placeholder="f.eks. Château Margaux"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="producer" className="block text-sm font-medium text-text-secondary mb-1">Producent</label>
                                <input
                                    type="text"
                                    id="producer"
                                    name="producer"
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                    placeholder="f.eks. Margaux"
                                />
                            </div>

                            <div>
                                <label htmlFor="vintage" className="block text-sm font-medium text-text-secondary mb-1">Årgang</label>
                                <input
                                    type="text"
                                    id="vintage"
                                    name="vintage"
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                    placeholder="f.eks. 2015"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors appearance-none"
                                >
                                    <option value="Rødvin">Rødvin</option>
                                    <option value="Hvidvin">Hvidvin</option>
                                    <option value="Champagne">Champagne</option>
                                    <option value="Rosé">Rosé</option>
                                    <option value="Portvin">Portvin</option>
                                    <option value="Andet">Andet</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-text-secondary mb-1">Antal i Kælderen</label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    defaultValue={1}
                                    min={0}
                                    required
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="purchase_price" className="block text-sm font-medium text-text-secondary mb-1">Købspris (kr)</label>
                                <input
                                    type="number"
                                    id="purchase_price"
                                    name="purchase_price"
                                    step="0.01"
                                    min={0}
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                    placeholder="f.eks. 1200"
                                />
                            </div>

                            <div>
                                <label htmlFor="market_value" className="block text-sm font-medium text-text-secondary mb-1">Anslået Værdi (kr)</label>
                                <input
                                    type="number"
                                    id="market_value"
                                    name="market_value"
                                    step="0.01"
                                    min={0}
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                    placeholder="f.eks. 1500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="image_url" className="block text-sm font-medium text-text-secondary mb-1">Billede URL</label>
                            <input
                                type="url"
                                id="image_url"
                                name="image_url"
                                className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <Link href="/inventory" className="btn bg-transparent hover:bg-white/5 border-none">
                            Annuller
                        </Link>
                        <button type="submit" className="btn btn-primary">
                            Gem Flaske
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
