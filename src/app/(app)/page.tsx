import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl">
          Godkendt, <span className="text-accent-gold">{session?.user?.name?.split(' ')[0]}</span>.
        </h1>
        <p className="text-text-secondary mt-2">Velkommen tilbage til klubben.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="card space-y-2">
          <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Samlet Værdi</p>
          <p className="text-3xl font-playfair font-semibold">
            {totalValue._sum.market_value?.toLocaleString("da-DK") || "0"} <span className="text-xl text-text-muted font-inter">kr</span>
          </p>
        </div>

        {/* ROI */}
        <div className="card space-y-2">
          <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Estimeret ROI</p>
          <p className="text-3xl font-playfair font-semibold text-accent-gold">
            {/* Logic for ROI here late */}
            +0,0 <span className="text-xl text-text-muted font-inter">%</span>
          </p>
        </div>

        {/* Bottles in Stock */}
        <div className="card space-y-2">
          <p className="text-sm text-text-muted font-medium uppercase tracking-wider">På Lager</p>
          <p className="text-3xl font-playfair font-semibold">
            {totalBottles} <span className="text-xl text-text-muted font-inter">stk</span>
          </p>
        </div>

        {/* Next Meeting */}
        <div className="card space-y-2">
          <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Næste Møde</p>
          <p className="text-3xl font-playfair font-semibold truncate">
            {nextMeeting?.date ? new Date(nextMeeting.date).toLocaleDateString("da-DK", { day: 'numeric', month: 'short' }) : "Intet planlagt"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Activity Feed Placeholder */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl pb-2 border-b border-white/5">Seneste Aktivitet</h2>
          <div className="card bg-card/50 border-dashed border-white/10 flex items-center justify-center py-12 text-text-muted">
            Aktivitetslog kommer snart...
          </div>
        </div>

        {/* Right column placeholders */}
        <div className="space-y-4">
          <h2 className="text-2xl pb-2 border-b border-white/5">Hurtige Handlinger</h2>
          <div className="flex flex-col gap-3">
            <button className="btn btn-primary w-full text-left flex justify-between items-center group">
              Tilføj flaske
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
            <button className="btn w-full text-left flex justify-between items-center group">
              Foreslå smagning
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
