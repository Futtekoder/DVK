import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createThread } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewThreadPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-white/5 pb-6">
                <Link href="/forum" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-accent-gold transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tilbage til Forum
                </Link>
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Start Tråd</h1>
                    <p className="text-text-secondary mt-2">Del en vinoplevelse, stil et spørgsmål eller diskuter noget internt med klubben.</p>
                </div>
            </header>

            <div className="card">
                <form action={createThread} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">Emne (Required)</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                placeholder="f.eks. Tanker om gårsdagens smagning"
                            />
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">Indhold (Required)</label>
                            <textarea
                                id="content"
                                name="content"
                                rows={8}
                                required
                                className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-gold transition-colors custom-scrollbar"
                                placeholder="Skriv dit indlæg her..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <Link href="/forum" className="btn bg-transparent hover:bg-white/5 border-none">
                            Annuller
                        </Link>
                        <button type="submit" className="btn btn-primary">
                            Opret Tråd
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
