
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Map as MapIcon,
    UploadCloud,
    Settings,
    Menu,
    Leaf,
    LogOut,
    User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500", // Will be overridden by theme usually, but keeping specific colors is nice
    },
    {
        label: "Pest Maps",
        icon: MapIcon,
        href: "/dashboard/map",
        color: "text-emerald-500",
    },
    {
        label: "Upload Scan",
        icon: UploadCloud,
        href: "/dashboard/upload",
        color: "text-emerald-700",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-gray-500",
    },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <div className="space-y-4 py-4 flex flex-col h-full text-white bg-slate-900 border-r border-slate-800">
                    <div className="px-3 py-2 flex-1">
                        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                            <div className="relative w-10 h-10 mr-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/miyuani-logo.png" alt="Logo" className="object-contain" />
                            </div>
                            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-400" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.02em" }}>
                                Miyuani
                            </h1>
                        </Link>
                        <div className="space-y-1">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                        pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                                    )}
                                >
                                    <div className="flex items-center flex-1">
                                        <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                        {route.label}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* User Profile Section */}
                        <div className="px-3 pb-4 border-t border-slate-800 pt-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {user?.full_name || user?.username}
                                    </p>
                                    <p className="text-xs text-emerald-400 capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start"
                                onClick={logout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <main className="md:pl-72 h-full bg-slate-50">
                <div className="flex items-center p-4 md:hidden border-b bg-white">
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 text-white bg-slate-900 w-72 border-r-slate-800">
                            <div className="space-y-4 py-4 flex flex-col h-full">
                                <div className="px-3 py-2 flex-1">
                                    <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                                        <div className="relative w-10 h-10 mr-4">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="/miyuani-logo.png" alt="Logo" className="object-contain" />
                                        </div>
                                        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-400" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.02em" }}>
                                            Miyuani
                                        </h1>
                                    </Link>
                                    <div className="space-y-1">
                                        {routes.map((route) => (
                                            <Link
                                                key={route.href}
                                                href={route.href}
                                                onClick={() => setIsMobileOpen(false)}
                                                className={cn(
                                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                                    pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                                                )}
                                            >
                                                <div className="flex items-center flex-1">
                                                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                                    {route.label}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="font-black text-lg ml-4" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>Miyuani</div>
                </div>
                <div className="h-full p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
