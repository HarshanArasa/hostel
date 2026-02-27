'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, BarChart3, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const feats = [
  { icon: Zap, label: 'Instant Submission' },
  { icon: BarChart3, label: 'Real-time Status' },
  { icon: Shield, label: 'Role-Based Access' },
  { icon: CheckCircle, label: 'Fast Resolution' },
];

export default function LandingPage() {
  const router = useRouter();

  // Redirect already-logged-in users to their dashboard
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      router.replace(parsed.role === 'admin' ? '/dashboard/admin' : '/dashboard/student');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-bold text-xl bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          HostelOps
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Maintenance Management, Simplified
          </span>

          <h1 className="text-5xl sm:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Manage Hostel</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Complaints Smarter
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            HostelOps is the modern dashboard for managing student complaints and maintenance requests — built for speed, clarity, and transparency.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300"
              >
                Start for Free
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 font-medium rounded-xl transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-4"
        >
          {feats.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300">
              <Icon size={15} className="text-violet-400" />
              {label}
            </div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid grid-cols-3 gap-8 text-center"
        >
          {[
            { value: '99%', label: 'Uptime' },
            { value: '<2h', label: 'Avg. Resolution' },
            { value: '100%', label: 'Secure' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
