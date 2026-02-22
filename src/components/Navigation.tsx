"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    CalendarDays,
    Vote,
    Wine,
    MessageSquare,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Trophy
} from "lucide-react";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Lager", href: "/inventory", icon: Package },
    { name: "Møder", href: "/meetings", icon: CalendarDays },
    { name: "Afstemning", href: "/voting", icon: Vote },
    { name: "Smagninger", href: "/tastings", icon: Wine },
    { name: "Forum", href: "/forum", icon: MessageSquare },
    { name: "Statistik", href: "/stats", icon: BarChart3 },
    { name: "Præstationer", href: "/achievements", icon: Trophy },
];

export default function Navigation() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isAdmin = session?.user?.role === "admin";

    const closeMenu = () => setMobileMenuOpen(false);

    const NavLinks = () => (
        <>
            <div className="space-y-2 flex-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={closeMenu}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-wine-burgundy/20 text-accent-gold border border-accent-gold/20"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-accent-gold" : "text-text-muted"}`} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}

                {isAdmin && (
                    <Link
                        href="/admin"
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-4 ${pathname?.startsWith("/admin")
                            ? "bg-wine-burgundy/20 text-accent-gold border border-accent-gold/20"
                            : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            }`}
                    >
                        <Settings className={`w-5 h-5 ${pathname?.startsWith("/admin") ? "text-accent-gold" : "text-text-muted"}`} />
                        <span className="font-medium">Admin</span>
                    </Link>
                )}
            </div>

            <div className="pt-6 border-t border-white/10 mt-auto">
                <div className="px-4 py-2 mb-4 text-sm text-text-muted">
                    <p className="truncate font-medium text-text-primary">{session?.user?.name}</p>
                    <p className="truncate text-xs opacity-70">{session?.user?.email}</p>
                </div>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-text-secondary hover:text-text-primary hover:bg-wine-deep/30 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5 text-text-muted" />
                    <span className="font-medium">Log ud</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-white/5 sticky top-0 z-50">
                <h1 className="font-playfair text-xl text-accent-gold font-bold tracking-wider">DVK</h1>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 -mr-2 text-text-secondary hover:text-text-primary"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={closeMenu}
                />
            )}

            {/* Sidebar Desktop & Mobile Drawer */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-white/5 flex flex-col p-6
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:w-72 lg:shrink-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex flex-col">
                        <h1 className="font-playfair text-3xl text-accent-gold font-bold tracking-wider relative inline-block">
                            DVK
                            <span className="absolute -bottom-2 left-0 w-1/2 h-[1px] bg-gradient-to-r from-accent-gold to-transparent"></span>
                        </h1>
                        <span className="text-xs text-text-muted tracking-widest uppercase mt-3 uppercase font-medium">Klubben</span>
                    </div>
                    <button onClick={closeMenu} className="lg:hidden p-2 text-text-secondary">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
                    <NavLinks />
                </nav>
            </aside>
        </>
    );
}
