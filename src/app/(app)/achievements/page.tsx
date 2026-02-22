import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Trophy, Medal, Award, CheckCircle2, Lock } from "lucide-react";

export default async function AchievementsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    // Since we haven't seeded achievements, let's just make sure there are some defaults
    const existingAchievements = await prisma.achievement.count();
    if (existingAchievements === 0) {
        // Basic auto-seeding of achievements
        await prisma.achievement.createMany({
            data: [
                { name: "Første Dråbe", description: "Deltag i din første DVK smagning.", icon: "Trophy" },
                { name: "Smagsdommer", description: "Afgiv anmeldelser på mere end 5 forskellige flasker.", icon: "Medal" },
                { name: "Initiativtager", description: "Foreslå en flaske der bliver valgt til et møde.", icon: "Award" },
                { name: "Kældermester", description: "Har været medlem i over et år og deltaget aktivt.", icon: "Crown" },
            ],
            skipDuplicates: true
        });
    }

    const allAchievements = await prisma.achievement.findMany();
    const userUnlocked = await prisma.userAchievement.findMany({
        where: { user_id: session.user.id },
        include: { achievement: true }
    });

    const unlockedIds = new Set(userUnlocked.map(ua => ua.achievement_id));

    // Determine Icon helper
    const renderIcon = (iconName: string | null, unlocked: boolean) => {
        const props = { className: `w-8 h-8 ${unlocked ? 'text-accent-gold' : 'text-text-muted opacity-50'}` };
        switch (iconName) {
            case 'Trophy': return <Trophy {...props} />;
            case 'Medal': return <Medal {...props} />;
            case 'Award': return <Award {...props} />;
            default: return <Trophy {...props} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <header className="border-b border-white/5 pb-6">
                <h1 className="text-4xl font-playfair font-bold text-accent-gold tracking-wider">Præstationer</h1>
                <p className="text-text-secondary mt-2">Dine DVK badges og anerkendelser.</p>
            </header>

            <div className="card bg-wine-burgundy/10 border-accent-gold/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-2xl font-playfair font-bold text-accent-gold">Din Samling</h2>
                    <p className="text-text-secondary">Du har låst op for {unlockedIds.size} af {allAchievements.length} tilgængelige badges.</p>
                </div>
                <div className="flex items-center gap-2">
                    {userUnlocked.slice(0, 3).map(ua => (
                        <div key={ua.id} className="w-14 h-14 rounded-full bg-card border border-accent-gold/30 flex items-center justify-center shadow-lg shadow-black/50">
                            {renderIcon(ua.achievement.icon, true)}
                        </div>
                    ))}
                    {userUnlocked.length === 0 && (
                        <div className="w-14 h-14 rounded-full bg-secondary/50 border border-white/10 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-text-muted opacity-50" />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allAchievements.map(ac => {
                    const isUnlocked = unlockedIds.has(ac.id);
                    const unlockData = userUnlocked.find(ua => ua.achievement_id === ac.id);

                    return (
                        <div key={ac.id} className={`card relative overflow-hidden transition-all duration-300 ${isUnlocked ? 'border-accent-gold/30 bg-secondary/20' : 'border-white/5 opacity-70 grayscale-[0.5]'}`}>
                            {isUnlocked && (
                                <div className="absolute top-4 right-4 text-accent-gold">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            )}

                            <div className="flex flex-col items-center text-center space-y-4 pt-4">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-wine-burgundy/20 ring-4 ring-card' : 'bg-secondary ring-2 ring-white/5'}`}>
                                    {renderIcon(ac.icon, isUnlocked)}
                                </div>

                                <div>
                                    <h3 className="text-xl font-playfair font-bold mb-1 text-text-primary">{ac.name}</h3>
                                    <p className="text-sm text-text-muted px-4 leading-relaxed">{ac.description}</p>
                                </div>

                                {isUnlocked && unlockData && (
                                    <div className="mt-4 pt-4 w-full border-t border-white/5 text-xs text-text-muted">
                                        Låst op: {unlockData.unlocked_at.toLocaleDateString("da-DK")}
                                    </div>
                                )}
                                {!isUnlocked && (
                                    <div className="mt-4 pt-4 w-full border-t border-white/5 text-xs text-text-muted flex items-center justify-center gap-1">
                                        <Lock className="w-3 h-3" /> Låst
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
