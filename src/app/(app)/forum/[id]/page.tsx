import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { createPost } from "../actions";

export default async function ThreadPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const thread = await prisma.thread.findUnique({
        where: { id: params.id },
        include: {
            author: true,
            posts: {
                include: { author: true },
                orderBy: { created_at: 'asc' }
            }
        }
    });

    if (!thread) notFound();

    const postAction = createPost.bind(null, thread.id);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-white/5 pb-6">
                <Link href="/forum" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-accent-gold transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tilbage til Forum
                </Link>
                <div>
                    <h1 className="text-3xl md:text-4xl font-playfair font-bold text-accent-gold tracking-wider leading-snug">{thread.title}</h1>
                    <div className="flex items-center gap-2 mt-4 text-sm text-text-muted">
                        <div className="w-6 h-6 rounded-full bg-wine-burgundy/50 flex items-center justify-center text-[10px] font-bold text-accent-gold">
                            {thread.author.name[0]}
                        </div>
                        <span>Startet af <span className="text-text-secondary font-medium">{thread.author.name}</span></span>
                        <span>•</span>
                        <span>{thread.created_at.toLocaleDateString("da-DK", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                {thread.posts.map((post, idx) => {
                    const isThreadStarter = idx === 0 && post.author_id === thread.author_id;

                    return (
                        <div key={post.id} className={`p-6 rounded-xl border ${isThreadStarter ? 'bg-wine-burgundy/5 border-accent-gold/20' : 'bg-secondary/40 border-white/5'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-wine-deep flex items-center justify-center text-sm font-bold text-accent-gold">
                                    {post.author.name[0]}
                                </div>
                                <div>
                                    <p className="font-playfair font-semibold text-text-primary text-lg leading-none">{post.author.name}</p>
                                    <p className="text-xs text-text-muted mt-1">{post.created_at.toLocaleString("da-DK", { dateStyle: 'short', timeStyle: 'short' })}</p>
                                </div>
                                {isThreadStarter && (
                                    <div className="ml-auto text-xs uppercase font-bold tracking-widest text-accent-gold bg-accent-gold/10 px-3 py-1 rounded-full border border-accent-gold/20">
                                        Forfatter
                                    </div>
                                )}
                            </div>
                            <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-p:leading-relaxed whitespace-pre-wrap">
                                <p>{post.content}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-8 border-t border-white/5">
                <div className="card">
                    <h3 className="font-playfair text-xl mb-4">Skriv et svar</h3>
                    <form action={postAction} className="space-y-4">
                        <textarea
                            name="content"
                            rows={4}
                            required
                            className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-gold transition-colors custom-scrollbar"
                            placeholder="Din besked..."
                        />
                        <div className="flex justify-end relative">
                            <button type="submit" className="btn btn-primary flex items-center gap-2 pr-5 pl-4">
                                <Send className="w-4 h-4 ml-[-2px] mr-1" /> Send Svar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
