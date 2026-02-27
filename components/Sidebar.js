'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    PlusCircle,
    ClipboardList,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    GraduationCap,
} from 'lucide-react';

const studentLinks = [
    { href: '/dashboard/student', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/student?tab=submit', icon: PlusCircle, label: 'Submit Complaint' },
    { href: '/dashboard/student?tab=history', icon: ClipboardList, label: 'My Complaints' },
];

const adminLinks = [
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/admin?tab=all', icon: ClipboardList, label: 'All Complaints' },
    { href: '/dashboard/admin?tab=settings', icon: Settings, label: 'Settings' },
];

/**
 * Animated Sidebar with role-based navigation links.
 * Collapses to an icon strip on mobile.
 */
export default function Sidebar({ role }) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const links = role === 'admin' ? adminLinks : studentLinks;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCollapsed(true)}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                className="fixed top-0 left-0 h-full z-40 flex flex-col bg-slate-950/95 backdrop-blur-xl border-r border-white/10"
                animate={{ width: collapsed ? 72 : 240 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 h-16">
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="font-bold text-lg bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent whitespace-nowrap"
                            >
                                HostelOps
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        {collapsed ? <Menu size={18} /> : <X size={18} />}
                    </button>
                </div>

                {/* Role badge */}
                <div className="px-3 py-3 border-b border-white/10">
                    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
                        {role === 'admin' ? (
                            <Shield size={16} className="text-violet-400 shrink-0" />
                        ) : (
                            <GraduationCap size={16} className="text-indigo-400 shrink-0" />
                        )}
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs text-slate-400 capitalize"
                                >
                                    {role}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
                    {links.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href.split('?')[0];
                        return (
                            <motion.button
                                key={href}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => router.push(href)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                  ${isActive
                                        ? 'bg-violet-500/20 text-violet-300 font-medium'
                                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                                    }
                  ${collapsed ? 'justify-center' : ''}
                `}
                            >
                                <Icon size={18} className="shrink-0" />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="whitespace-nowrap"
                                        >
                                            {label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 pb-4 border-t border-white/10 pt-3">
                    <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={18} className="shrink-0" />
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </motion.aside>
        </>
    );
}
