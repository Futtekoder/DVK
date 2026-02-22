import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare, Plus, Clock, MessagesSquare } from "lucide-react";

export default async function ForumPage() {
    const session = await getServerSession(authOptions);

    const threads = await prisma.thread.findMany({
        orderBy: { updated_at: 'desc' },
        include: {
            author: true,
            _count: {
                select: { posts: true }
            }
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Forum</h1>
                    <p className="text-text-secondary mt-2">DVK&apos;s digitale vinkælder og debat.</p>
                </div>
                <Link href="/forum/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Start Tråd
                </Link>
            </header>

            {threads.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-20 text-text-muted text-center space-y-4">
                    <MessageSquare className="w-12 h-12 text-wine-deep" />
                    <p className="text-lg">Intet liv i forummet endnu.</p>
                    <Link href="/forum/new" className="text-accent-gold hover:underline">
                        Vær den første til at starte en debat.
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {threads.map((thread) => (
                        <Link key={thread.id} href={`/forum/${thread.id}`} className="group block">
                            <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 hover:bg-secondary/40 transition-colors cursor-pointer border-transparent hover:border-white/5">

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-wine-burgundy/20 flex items-center justify-center shrink-0">
                                        <MessagesSquare className="w-5 h-5 text-accent-gold" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-playfair font-semibold leading-tight text-text-primary group-hover:text-accent-gold transition-colors mb-1">
                                            {thread.title}
                                        </h3>
                                        <p className="text-sm text-text-muted flex items-center gap-2">
                                            Startet af <span className="text-text-secondary font-medium">{thread.author.name}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-text-muted sm:text-right shrink-0 ml-16 sm:ml-0 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0 w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex items-center gap-1.5 min-w-[5rem] sm:justify-end">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{thread._count.posts} {thread._count.posts === 1 ? 'svar' : 'svar'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 min-w-[8rem] sm:justify-end">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                            {thread.updated_at.toLocaleDateString("da-DK", { day: 'numeric', month: 'short' })}
                                        </span>
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
