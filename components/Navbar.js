'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Sun, Moon, User } from 'lucide-react';

/**
 * Top Navbar with user info, dark mode toggle, and notification bell.
 */
export default function Navbar({ user }) {
    const [darkMode, setDarkMode] = useState(true);

    // Load saved dark mode preference on mount
    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        const isDark = saved !== null ? saved === 'true' : true;
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleDark = () => {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem('darkMode', String(next));
        document.documentElement.classList.toggle('dark', next);
    };

    return (
        <header className="fixed top-0 right-0 left-0 lg:left-[240px] z-20 h-16 px-6 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
            {/* Page breadcrumb area */}
            <div>
                <h1 className="text-sm font-semibold text-white">
                    Welcome back,{' '}
                    <span className="text-violet-400">{user?.name ?? 'User'}</span>
                </h1>
                <p className="text-xs text-slate-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Dark mode toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDark}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </motion.button>

                {/* Notification bell */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative"
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
                </motion.button>

                {/* User avatar */}
                <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                        <User size={14} className="text-white" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs font-medium text-white">{user?.name ?? '—'}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role ?? '—'}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
