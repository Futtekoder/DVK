import Navigation from "@/components/Navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Providers } from "@/components/providers/SessionProvider";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <Providers>
            <div className="flex h-screen bg-bg overflow-hidden flex-col lg:flex-row">
                <Navigation />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </Providers>
    );
}
