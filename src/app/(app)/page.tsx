import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, CalendarDays, Wine, MessageSquare, BarChart3, Trophy, ArrowRight } from "lucide-react";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Fetch some basic stats
  const totalBottles = await prisma.bottle.count({ where: { stock: { gt: 0 } } });
  const totalValue = await prisma.bottle.aggregate({
    where: { stock: { gt: 0 } },
    _sum: { market_value: true, purchase_price: true }
  });

  const nextMeeting = await prisma.meeting.findFirst({
    where: { date: { gte: new Date() } },
    orderBy: { date: 'asc' }
  });

  const features = [
    { name: "Vinkælderen", desc: "Se og administrer samlingen af flydende aktiver.", icon: Package, href: "/inventory", color: "text-accent-gold" },
    { name: "Møder & Afstemning", desc: "Planlæg næste komsammen og stem på flasker.", icon: CalendarDays, href: "/meetings", color: "text-wine-deep" },
    { name: "Smagninger", desc: "Afgiv point og noter til blinde smagninger.", icon: Wine, href: "/tastings", color: "text-accent-amber" },
    { name: "Forum", desc: "Deltag i den fortløbende snak om alt og intet.", icon: MessageSquare, href: "/forum", color: "text-blue-400" },
    { name: "Statistik", desc: "Dyk ned i data, ROI og medlemmernes vaner.", icon: BarChart3, href: "/stats", color: "text-green-400" },
    { name: "Præstationer", desc: "Se dine opnåede badges og milesten i klubben.", icon: Trophy, href: "/achievements", color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-10">
      <header className="relative overflow-hidden rounded-2xl bg-card border border-white/5 p-8 md:p-12 shadow-2xl mt-4">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-20 blur-3xl pointer-events-none">
          <div className="w-96 h-96 bg-wine-burgundy rounded-full mix-blend-screen"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
            Velkommen til <span className="text-accent-gold">DVK</span>, {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-8">
            Din digitale hub for alt vedrørende Den Vilde Kælder. Udforsk porteføljen, planlæg de næste store smagninger, eller tag del i debatten maskeret af tid og vin.
          </p>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="card space-y-2 border-l-2 border-transparent hover:border-accent-gold transition-all">
          <p className="text-xs text-text-muted font-medium uppercase tracking-widest">Samlet Værdi</p>
          <p className="text-3xl font-playfair font-semibold">
            {totalValue._sum.market_value?.toLocaleString("da-DK") || "0"} <span className="text-xl text-text-muted font-inter">kr</span>
          </p>
        </div>

        {/* ROI Placeholder */}
        <div className="card space-y-2 border-l-2 border-transparent hover:border-accent-amber transition-all">
          <p className="text-xs text-text-muted font-medium uppercase tracking-widest">Estimeret ROI</p>
          <p className="text-3xl font-playfair font-semibold text-accent-gold">
            +0,0 <span className="text-xl text-text-muted font-inter">%</span>
          </p>
        </div>

        {/* Bottles in Stock */}
        <div className="card space-y-2 border-l-2 border-transparent hover:border-wine-deep transition-all">
          <p className="text-xs text-text-muted font-medium uppercase tracking-widest">På Lager</p>
          <p className="text-3xl font-playfair font-semibold">
            {totalBottles} <span className="text-xl text-text-muted font-inter">stk</span>
          </p>
        </div>

        {/* Next Meeting */}
        <div className="card space-y-2 border-l-2 border-transparent hover:border-white transition-all">
          <p className="text-xs text-text-muted font-medium uppercase tracking-widest">Næste Møde</p>
          <p className="text-3xl font-playfair font-semibold truncate">
            {nextMeeting?.date ? new Date(nextMeeting.date).toLocaleDateString("da-DK", { day: 'numeric', month: 'short' }) : "Intet planlagt"}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-playfair font-bold text-white mb-6 flex items-center gap-3">
          Gå på opdagelse
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Link key={idx} href={feature.href} className="group block h-full">
              <div className="card h-full border border-white/5 hover:border-accent-gold/40 hover:bg-white/5 transition-all duration-300 flex flex-col pt-8 pb-6 px-6 relative overflow-hidden">
                <div className={`w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-playfair text-white mb-2 group-hover:text-accent-gold transition-colors">{feature.name}</h3>
                <p className="text-text-secondary text-sm leading-relaxed flex-1">{feature.desc}</p>
                <div className="mt-6 flex items-center text-sm font-medium text-accent-gold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Besøg sektion <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
