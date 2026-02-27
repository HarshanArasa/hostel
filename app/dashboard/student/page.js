'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, PlusCircle, Clock, CheckCircle2, AlertCircle,
    LogOut, X, Send, ChevronRight, Calendar, Tag, Search,
    User, BarChart3, Bell, History, UserCircle, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── constants ───────────────────────────────────────────────────── */
const CATEGORIES = ['Plumbing', 'Electrical', 'Housekeeping', 'Internet', 'Furniture', 'Security', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'new', label: 'New Complaint', icon: PlusCircle },
    { id: 'profile', label: 'Profile', icon: UserCircle },
];

/* ─── helpers ─────────────────────────────────────────────────────── */
const statusCfg = {
    'Pending': { label: 'PENDING', cls: 'bg-slate-500/20 text-slate-300  border-slate-500/40' },
    'In Progress': { label: 'IN PROGRESS', cls: 'bg-blue-500/20  text-blue-300   border-blue-500/40' },
    'Resolved': { label: 'RESOLVED', cls: 'bg-green-500/20 text-green-300  border-green-500/40' },
};
const priorityCls = { Low: 'text-slate-400', Medium: 'text-yellow-400', High: 'text-red-400' };

function cmpId(complaint) {
    // Generate a short complaint ID from the UUID
    return '#CMP-' + complaint.id.slice(-4).toUpperCase();
}

function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── sub-components ──────────────────────────────────────────────── */
function StatusBadge({ status }) {
    const c = statusCfg[status] || statusCfg['Pending'];
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide ${c.cls}`}>
            {c.label}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, color, badge }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl border border-white/8 bg-white/5 backdrop-blur p-5 flex flex-col gap-3"
        >
            {badge && (
                <span className="absolute top-3 right-3 text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">
                    +{badge} new
                </span>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} className="text-white" />
            </div>
            <div>
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="text-3xl font-bold text-white">{String(value).padStart(2, '0')}</p>
            </div>
        </motion.div>
    );
}

function ComplaintRow({ complaint, onClick }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={onClick}
            className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors group"
        >
            <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{cmpId(complaint)}</span>
                    <StatusBadge status={complaint.status} />
                </div>
                <button className="text-xs text-violet-400 group-hover:text-violet-300 flex items-center gap-0.5 shrink-0 transition-colors">
                    Details <ChevronRight size={12} />
                </button>
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">{complaint.category}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{complaint.description}</p>
            <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1">
                <Calendar size={10} />
                {fmtDate(complaint.created_at)}
            </p>
        </motion.div>
    );
}

function DetailModal({ complaint, onClose }) {
    if (!complaint) return null;
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1730] p-6"
                    initial={{ scale: 0.93, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.93, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-500">{cmpId(complaint)}</span>
                            <StatusBadge status={complaint.status} />
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Category</p>
                            <div className="flex items-center gap-2 text-white text-sm font-medium">
                                <Tag size={13} className="text-violet-400" />
                                {complaint.category}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Description</p>
                            <p className="text-sm text-slate-200 leading-relaxed bg-white/5 rounded-xl p-3 border border-white/5">
                                {complaint.description}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Priority</p>
                                <p className={`text-sm font-semibold ${priorityCls[complaint.priority]}`}>
                                    {complaint.priority}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Status</p>
                                <p className="text-sm text-white">{complaint.status}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Submitted</p>
                            <p className="text-sm text-slate-300 flex items-center gap-1">
                                <Calendar size={12} className="text-slate-500" />
                                {fmtDate(complaint.created_at)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-6 w-full py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-colors"
                    >
                        Close
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function SubmitForm({ onSuccess }) {
    const [form, setForm] = useState({ category: 'Plumbing', description: '', priority: 'Medium' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.description.trim()) { toast.error('Please add a description'); return; }
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || 'Submission failed'); return; }
            toast.success('Complaint submitted! ✓');
            setForm({ category: 'Plumbing', description: '', priority: 'Medium' });
            onSuccess?.();
        } catch { toast.error('Network error'); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Category</label>
                <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#0f0d1e] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none cursor-pointer"
                >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>

            {/* Description */}
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    placeholder="Please describe the issue..."
                    className="w-full bg-[#0f0d1e] border border-white/10 text-white text-sm rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                />
            </div>

            {/* Priority */}
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Priority Level</label>
                <div className="flex gap-3">
                    {PRIORITIES.map(p => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setForm({ ...form, priority: p })}
                            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all
                ${form.priority === p
                                    ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60 text-sm"
            >
                {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <> <Send size={14} /> Submit Request </>
                )}
            </motion.button>
        </form>
    );
}

/* ─── Main page ───────────────────────────────────────────────────── */
export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('overview');
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);   // for detail modal
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    /* auth guard */
    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!stored || !token) { router.replace('/login'); return; }
        const parsed = JSON.parse(stored);
        if (parsed.role !== 'student') { router.replace('/dashboard/admin'); return; }
        setUser(parsed);
    }, [router]);

    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) setComplaints(data.complaints || []);
            else toast.error(data.error || 'Failed to load');
        } catch { toast.error('Network error'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (user) fetchComplaints(); }, [user, fetchComplaints]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    /* derived stats */
    const total = complaints.length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const recent = [...complaints].slice(0, 5);

    /* filtered list for history tab */
    const filtered = complaints.filter(c => {
        const matchSearch = c.description.toLowerCase().includes(search.toLowerCase()) ||
            c.category.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="flex h-screen bg-[#0a0818] text-white overflow-hidden">
            {/* ── SIDEBAR ──────────────────────────────────────── */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-56 shrink-0 flex flex-col bg-[#0f0d1e] border-r border-white/5"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                        <BarChart3 size={15} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white leading-none">HostelOps</p>
                        <p className="text-[10px] text-slate-500">Student Portal</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-0.5">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <motion.button
                            key={id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setTab(id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                ${tab === id
                                    ? 'bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={16} className="shrink-0" />
                            {label}
                        </motion.button>
                    ))}
                </nav>

                {/* User footer */}
                <div className="px-3 pb-4 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-white/5 mb-2">
                        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                            <User size={12} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{user?.name ?? '—'}</p>
                            <p className="text-[10px] text-slate-500">Student</p>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </motion.button>
                </div>
            </motion.aside>

            {/* ── MAIN ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-[#0f0d1e]/60 backdrop-blur shrink-0">
                    <div>
                        <h1 className="text-sm font-semibold text-white">
                            {tab === 'overview' && 'Dashboard Overview'}
                            {tab === 'history' && 'Complaint History'}
                            {tab === 'new' && 'Submit New Complaint'}
                            {tab === 'profile' && 'My Profile'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-1.5 text-slate-400 hover:text-white transition-colors">
                            <Bell size={17} />
                            {pending > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-violet-500 rounded-full" />
                            )}
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold">
                                {(user?.name?.[0] ?? 'U').toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-300">{user?.name ?? '—'}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">

                        {/* ── OVERVIEW ─────────────────────── */}
                        {tab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <StatCard icon={BarChart3} label="Total Complaints" value={total} color="bg-violet-600" badge={pending > 0 ? pending : null} />
                                    <StatCard icon={AlertCircle} label="In Progress" value={inProgress} color="bg-blue-600" />
                                    <StatCard icon={CheckCircle2} label="Resolved" value={resolved} color="bg-emerald-600" />
                                </div>

                                {/* Two-col layout */}
                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Submit form */}
                                    <div className="rounded-2xl border border-white/8 bg-[#13112a] p-6">
                                        <h2 className="text-base font-bold text-white mb-1">Submit a Complaint</h2>
                                        <p className="text-xs text-slate-500 mb-5">Describe the issue and we'll resolve it ASAP.</p>
                                        <SubmitForm onSuccess={() => { fetchComplaints(); setTab('history'); }} />
                                    </div>

                                    {/* Recent complaints */}
                                    <div className="rounded-2xl border border-white/8 bg-[#13112a] overflow-hidden flex flex-col">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                                            <h2 className="text-sm font-bold text-white">Recent Complaints</h2>
                                            <button
                                                onClick={() => setTab('history')}
                                                className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-0.5"
                                            >
                                                View All <ChevronRight size={12} />
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                                            {loading ? (
                                                [...Array(4)].map((_, i) => (
                                                    <div key={i} className="p-4 animate-pulse space-y-2">
                                                        <div className="h-3 bg-slate-700 rounded w-1/3" />
                                                        <div className="h-3 bg-slate-700 rounded w-2/3" />
                                                        <div className="h-2 bg-slate-700 rounded w-1/4" />
                                                    </div>
                                                ))
                                            ) : recent.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                                    <BarChart3 size={28} className="text-slate-700 mb-2" />
                                                    <p className="text-sm text-slate-500">No complaints yet</p>
                                                </div>
                                            ) : (
                                                recent.map(c => (
                                                    <ComplaintRow key={c.id} complaint={c} onClick={() => setSelected(c)} />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── HISTORY ──────────────────────── */}
                        {tab === 'history' && (
                            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                {/* Filter bar */}
                                <div className="flex flex-wrap gap-3 mb-5 items-center">
                                    {/* Search */}
                                    <div className="relative flex-1 min-w-[180px]">
                                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder="Search complaints..."
                                            className="w-full pl-8 pr-3 py-2 bg-[#13112a] border border-white/10 text-white text-xs rounded-xl placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        />
                                    </div>

                                    {/* Status filter */}
                                    <div className="flex items-center gap-1">
                                        <Filter size={12} className="text-slate-500" />
                                        {['All', 'Pending', 'In Progress', 'Resolved'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setStatusFilter(s)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                          ${statusFilter === s
                                                        ? 'bg-violet-600/25 text-violet-300 border border-violet-500/40'
                                                        : 'text-slate-400 border border-white/10 hover:text-slate-200'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Count */}
                                <p className="text-xs text-slate-500 mb-3">{filtered.length} complaint{filtered.length !== 1 ? 's' : ''} found</p>

                                {/* Cards grid */}
                                {loading ? (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="animate-pulse rounded-2xl border border-white/8 bg-[#13112a] p-5 space-y-3">
                                                <div className="h-3 bg-slate-700 rounded w-1/3" />
                                                <div className="h-3 bg-slate-700 rounded w-3/4" />
                                                <div className="h-3 bg-slate-700 rounded w-1/2" />
                                            </div>
                                        ))}
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <History size={32} className="text-slate-700 mb-3" />
                                        <p className="text-slate-400 font-medium mb-1">No complaints found</p>
                                        <p className="text-slate-600 text-sm">Try adjusting your filters</p>
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <AnimatePresence>
                                            {filtered.map(c => (
                                                <motion.div
                                                    key={c.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    whileHover={{ y: -2 }}
                                                    onClick={() => setSelected(c)}
                                                    className="rounded-2xl border border-white/8 bg-[#13112a] p-5 cursor-pointer hover:border-violet-500/30 transition-all group"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-mono text-[11px] text-slate-500">{cmpId(c)}</span>
                                                        <StatusBadge status={c.status} />
                                                    </div>
                                                    <p className="text-sm font-semibold text-white mb-1 flex items-center gap-1">
                                                        <Tag size={12} className="text-violet-400" />
                                                        {c.category}
                                                    </p>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{c.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-xs font-medium ${priorityCls[c.priority]}`}>
                                                            {c.priority} Priority
                                                        </span>
                                                        <span className="text-xs text-slate-600 flex items-center gap-1">
                                                            <Calendar size={10} />{fmtDate(c.created_at)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                                                        <button className="text-xs text-violet-400 group-hover:text-violet-300 flex items-center gap-1 transition-colors">
                                                            View Details <ChevronRight size={12} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── NEW COMPLAINT ─────────────────── */}
                        {tab === 'new' && (
                            <motion.div
                                key="new"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="max-w-lg mx-auto"
                            >
                                <div className="rounded-2xl border border-white/8 bg-[#13112a] p-7">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                                            <PlusCircle size={18} className="text-violet-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-white">New Complaint</h2>
                                            <p className="text-xs text-slate-500">Fill in the details below</p>
                                        </div>
                                    </div>
                                    <SubmitForm onSuccess={() => { fetchComplaints(); setTab('history'); }} />
                                </div>
                            </motion.div>
                        )}

                        {/* ── PROFILE ──────────────────────── */}
                        {tab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="max-w-lg mx-auto"
                            >
                                <div className="rounded-2xl border border-white/8 bg-[#13112a] p-7">
                                    {/* Avatar */}
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-3xl font-bold mb-3">
                                            {(user?.name?.[0] ?? 'U').toUpperCase()}
                                        </div>
                                        <h2 className="text-lg font-bold text-white">{user?.name}</h2>
                                        <p className="text-sm text-slate-500">{user?.email}</p>
                                        <span className="mt-2 text-xs bg-violet-500/15 text-violet-300 px-3 py-0.5 rounded-full border border-violet-500/30">
                                            Student
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {[
                                            { label: 'Total', value: total, color: 'text-violet-400' },
                                            { label: 'Pending', value: pending, color: 'text-yellow-400' },
                                            { label: 'Resolved', value: resolved, color: 'text-emerald-400' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="text-center rounded-xl bg-white/5 py-4 border border-white/5">
                                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Full Name', value: user?.name },
                                            { label: 'Email', value: user?.email },
                                            { label: 'Role', value: 'Student' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5">
                                                <span className="text-xs text-slate-500">{label}</span>
                                                <span className="text-sm text-white">{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <motion.button
                                        onClick={handleLogout}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm font-medium transition-all"
                                    >
                                        <LogOut size={14} /> Sign Out
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </main>
            </div>

            {/* Detail modal */}
            {selected && <DetailModal complaint={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
