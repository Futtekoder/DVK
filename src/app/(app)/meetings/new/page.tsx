import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createMeeting } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewMeetingPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
        redirect("/meetings");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4">
                <Link href="/meetings" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-accent-gold transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tilbage til Møder
                </Link>
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Planlæg Møde</h1>
                    <p className="text-text-secondary mt-2">Opret en ny vinaften for DVK.</p>
                </div>
            </header>

            <div className="card">
                <form action={createMeeting} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">Titel / Tema (Required)</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                placeholder="f.eks. DVK Q3 Smagning - Bordeaux"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-text-secondary mb-1">Dato</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors [color-scheme:dark]"
                                />
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-1">Lokation</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-gold transition-colors"
                                    placeholder="f.eks. Vinkælderen hos Anders"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <Link href="/meetings" className="btn bg-transparent hover:bg-white/5 border-none">
                            Annuller
                        </Link>
                        <button type="submit" className="btn btn-primary">
                            Opret Møde
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
