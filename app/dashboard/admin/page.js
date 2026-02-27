'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, BarChart3, Users, Settings, HelpCircle,
    Bell, Search, Plus, LogOut, Filter, Download, ChevronLeft,
    ChevronRight, AlertTriangle, Clock, CheckCircle2, Ticket,
    User, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════════ */
/*  CONSTANTS                                                       */
/* ═══════════════════════════════════════════════════════════════ */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STATUS_TABS = ['All Complaints', 'Pending', 'In Progress', 'Resolved'];
const PAGE_SIZE = 8;

const statusCfg = {
    Pending: { label: 'Pending', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
    'In Progress': { label: 'In Progress', cls: 'bg-blue-500/20  text-blue-300   border-blue-500/40' },
    Resolved: { label: 'Resolved', cls: 'bg-green-500/20 text-green-300  border-green-500/40' },
};

const priorityCfg = {
    High: { dot: 'bg-red-500', text: 'text-red-400' },
    Medium: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
    Low: { dot: 'bg-slate-400', text: 'text-slate-400' },
};

/* ═══════════════════════════════════════════════════════════════ */
/*  HELPERS                                                         */
/* ═══════════════════════════════════════════════════════════════ */
function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const avatarColors = ['bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 'bg-cyan-600'];
function avatarColor(name = '') {
    const idx = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
}

/* ═══════════════════════════════════════════════════════════════ */
/*  WEEKLY BAR CHART (SVG)                                          */
/* ═══════════════════════════════════════════════════════════════ */
function WeeklyChart({ complaints }) {
    // Count complaints per day of week (0=Sun…6=Sat → Mon-Sun order)
    const counts = useMemo(() => {
        const arr = Array(7).fill(0);
        complaints.forEach(c => {
            const d = new Date(c.created_at).getDay(); // 0 Sun
            const monIdx = d === 0 ? 6 : d - 1;       // shift to Mon=0
            arr[monIdx]++;
        });
        return arr;
    }, [complaints]);

    const resolvedCounts = useMemo(() => {
        const arr = Array(7).fill(0);
        complaints.filter(c => c.status === 'Resolved').forEach(c => {
            const d = new Date(c.created_at).getDay();
            const monIdx = d === 0 ? 6 : d - 1;
            arr[monIdx]++;
        });
        return arr;
    }, [complaints]);

    const max = Math.max(...counts, 1);
    const H = 90, W = 240;
    const barW = 22, gap = (W - 7 * barW) / 8;

    return (
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full">
            {counts.map((val, i) => {
                const x = gap + i * (barW + gap);
                const totalH = (val / max) * H;
                const resolvedH = (resolvedCounts[i] / max) * H;
                return (
                    <g key={i}>
                        {/* Total bar */}
                        <rect
                            x={x} y={H - totalH} width={barW} height={totalH}
                            rx="4" fill="rgba(109,40,217,0.35)"
                        />
                        {/* Resolved bar (on top, brighter) */}
                        <rect
                            x={x} y={H - resolvedH} width={barW} height={resolvedH}
                            rx="4" fill="rgba(139,92,246,0.9)"
                        />
                        {/* Day label */}
                        <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize="9" fill="#64748b">
                            {DAYS[i]}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TOP CATEGORIES                                                  */
/* ═══════════════════════════════════════════════════════════════ */
function TopCategories({ complaints }) {
    const cats = useMemo(() => {
        const map = {};
        complaints.forEach(c => { map[c.category] = (map[c.category] || 0) + 1; });
        const total = complaints.length || 1;
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([cat, count]) => ({ cat, pct: Math.round((count / total) * 100) }));
    }, [complaints]);

    const barColors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500'];

    return (
        <div className="space-y-3">
            {cats.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No data yet</p>
            ) : cats.map(({ cat, pct }, i) => (
                <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{cat}</span>
                        <span className="text-slate-400">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={`h-full rounded-full ${barColors[i % barColors.length]}`}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STATUS BADGE                                                    */
/* ═══════════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
    const cfg = statusCfg[status] || statusCfg.Pending;
    return (
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STATUS DROPDOWN (inline)                                        */
/* ═══════════════════════════════════════════════════════════════ */
function StatusSelect({ complaint, onUpdate }) {
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/complaints/${complaint.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || 'Update failed'); return; }
            toast.success(`Marked as ${newStatus}`);
            onUpdate(complaint.id, newStatus);
        } catch { toast.error('Network error'); }
        finally { setLoading(false); }
    };

    return (
        <select
            value={complaint.status}
            onChange={handleChange}
            disabled={loading}
            onClick={e => e.stopPropagation()}
            className={`text-[11px] font-semibold px-2 py-1 rounded-lg border appearance-none cursor-pointer bg-transparent focus:outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-50
        ${(statusCfg[complaint.status] || statusCfg.Pending).cls}`}
        >
            <option value="Pending" className="bg-[#1a1730] text-white">Pending</option>
            <option value="In Progress" className="bg-[#1a1730] text-white">In Progress</option>
            <option value="Resolved" className="bg-[#1a1730] text-white">Resolved</option>
        </select>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN ADMIN DASHBOARD                                            */
/* ═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Complaints');
    const [activeNav, setActiveNav] = useState('complaints');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    /* auth */
    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!stored || !token) { router.replace('/login'); return; }
        const parsed = JSON.parse(stored);
        if (parsed.role !== 'admin') { router.replace('/dashboard/student'); return; }
        setUser(parsed);
    }, [router]);

    /* fetch */
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

    /* inline status update */
    const handleStatusUpdate = (id, newStatus) => {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    };

    /* logout */
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    /* derived */
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const highPriority = complaints.filter(c => c.priority === 'High').length;

    /* filtered + paginated */
    const filtered = useMemo(() => {
        let list = complaints;
        if (activeTab === 'Pending') list = list.filter(c => c.status === 'Pending');
        if (activeTab === 'In Progress') list = list.filter(c => c.status === 'In Progress');
        if (activeTab === 'Resolved') list = list.filter(c => c.status === 'Resolved');
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.category.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                (c.users?.name || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [complaints, activeTab, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleTabChange = (tab) => { setActiveTab(tab); setPage(1); };

    /* export CSV */
    const handleExport = () => {
        const rows = [
            ['Student', 'Category', 'Priority', 'Status', 'Date'],
            ...filtered.map(c => [
                c.users?.name || 'Unknown',
                c.category,
                c.priority,
                c.status,
                new Date(c.created_at).toLocaleDateString(),
            ]),
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'complaints.csv'; a.click();
        URL.revokeObjectURL(url);
        toast.success('Exported!');
    };

    /* ── NAV ITEMS ── */
    const navMain = [
        { id: 'complaints', label: 'Complaints', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'staff', label: 'Staff Management', icon: Users },
    ];
    const navSystem = [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'support', label: 'Support', icon: HelpCircle },
    ];

    return (
        <div className="flex h-screen bg-[#0a0818] text-white overflow-hidden">

            {/* ════════════════════════════════════════════ SIDEBAR */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-56 shrink-0 flex flex-col bg-[#0f0d1e] border-r border-white/5"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
                    <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
                        <BarChart3 size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white leading-none">HostelOps</p>
                        <p className="text-[10px] text-slate-500">Admin Console</p>
                    </div>
                </div>

                {/* Nav */}
                <div className="flex-1 overflow-y-auto py-4 px-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 px-3 mb-2 font-semibold">Main Menu</p>
                    <nav className="space-y-0.5 mb-5">
                        {navMain.map(({ id, label, icon: Icon }) => (
                            <motion.button key={id} whileTap={{ scale: 0.97 }}
                                onClick={() => setActiveNav(id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${activeNav === id
                                        ? 'bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon size={15} className="shrink-0" />{label}
                            </motion.button>
                        ))}
                    </nav>
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 px-3 mb-2 font-semibold">Systems</p>
                    <nav className="space-y-0.5">
                        {navSystem.map(({ id, label, icon: Icon }) => (
                            <motion.button key={id} whileTap={{ scale: 0.97 }}
                                onClick={() => setActiveNav(id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${activeNav === id
                                        ? 'bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon size={15} className="shrink-0" />{label}
                            </motion.button>
                        ))}
                    </nav>
                </div>

                {/* Admin user */}
                <div className="px-3 pb-4 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-white/5 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(user?.name)}`}>
                            {initials(user?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{user?.name ?? '—'}</p>
                            <p className="text-[10px] text-slate-500">Super Admin</p>
                        </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={13} />Sign Out
                    </motion.button>
                </div>
            </motion.aside>

            {/* ════════════════════════════════════════════ MAIN */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top bar */}
                <header className="h-14 px-6 flex items-center gap-4 border-b border-white/5 bg-[#0f0d1e]/60 backdrop-blur shrink-0">
                    <h1 className="text-sm font-bold text-white whitespace-nowrap">Complaint Management</h1>
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by student, category..."
                            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/8 text-white text-xs rounded-xl placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                        <button className="relative p-1.5 text-slate-400 hover:text-white transition-colors">
                            <Bell size={17} />
                            {pending > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-violet-500 rounded-full" />}
                        </button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={() => handleTabChange('All Complaints')}
                            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                        >
                            <Plus size={13} /> New Task
                        </motion.button>
                    </div>
                </header>

                {/* Content area (scrollable) */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Centre column */}
                    <div className="flex-1 overflow-y-auto p-5">

                        {/* ── STATS ROW ── */}
                        <div className="grid grid-cols-4 gap-3 mb-5">
                            {[
                                { icon: Ticket, label: 'Total Tickets', value: total, sub: `${pending} pending`, iconBg: 'bg-violet-600/20', iconColor: 'text-violet-400' },
                                { icon: Clock, label: 'In Progress', value: inProgress, sub: 'Currently active', iconBg: 'bg-blue-600/20', iconColor: 'text-blue-400' },
                                { icon: AlertTriangle, label: 'High Priority', value: highPriority, sub: highPriority > 0 ? 'Urgent attention' : 'All clear', iconBg: 'bg-red-600/20', iconColor: 'text-red-400' },
                                { icon: CheckCircle2, label: 'Resolved', value: resolved, sub: `${total > 0 ? Math.round((resolved / total) * 100) : 0}% resolution rate`, iconBg: 'bg-emerald-600/20', iconColor: 'text-emerald-400' },
                            ].map(({ icon: Icon, label, value, sub, iconBg, iconColor }) => (
                                <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="rounded-2xl border border-white/8 bg-[#13112a] p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{label}</p>
                                        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                                            <Icon size={15} className={iconColor} />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-white mb-1">{String(value).padStart(2, '0')}</p>
                                    <p className={`text-xs ${value > 0 && label === 'High Priority' ? 'text-red-400' : 'text-slate-500'}`}>{sub}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* ── TABS + TABLE ── */}
                        <div className="rounded-2xl border border-white/8 bg-[#13112a] overflow-hidden">
                            {/* Tab bar */}
                            <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-white/5 flex-wrap">
                                {STATUS_TABS.map(tab => (
                                    <button key={tab} onClick={() => handleTabChange(tab)}
                                        className={`px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px
                      ${activeTab === tab
                                                ? 'border-violet-500 text-violet-300'
                                                : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {tab}
                                        {tab === 'Resolved' && resolved > 0 && (
                                            <span className="ml-1.5 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">{resolved}</span>
                                        )}
                                    </button>
                                ))}
                                <div className="ml-auto flex items-center gap-2 pb-1">
                                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                                        <Filter size={11} /> Filter
                                    </button>
                                    <button onClick={handleExport}
                                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Download size={11} /> Export
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            {['Student Name', 'Category', 'Priority', 'Status', 'Action'].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-slate-600 font-semibold">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {loading ? (
                                                [...Array(5)].map((_, i) => (
                                                    <tr key={i} className="border-b border-white/5">
                                                        {[...Array(5)].map((_, j) => (
                                                            <td key={j} className="px-4 py-3">
                                                                <div className="h-3 bg-slate-700/50 rounded animate-pulse" />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))
                                            ) : paginated.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-16 text-slate-500">
                                                        <Ticket size={28} className="mx-auto mb-2 text-slate-700" />
                                                        No complaints found
                                                    </td>
                                                </tr>
                                            ) : paginated.map(complaint => (
                                                <motion.tr
                                                    key={complaint.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                                                >
                                                    {/* Student */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${avatarColor(complaint.users?.name)}`}>
                                                                {initials(complaint.users?.name || 'U')}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-white">{complaint.users?.name || 'Unknown'}</p>
                                                                <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{complaint.description.slice(0, 30)}…</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Category */}
                                                    <td className="px-4 py-3">
                                                        <span className="bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-md text-[11px]">
                                                            {complaint.category}
                                                        </span>
                                                    </td>
                                                    {/* Priority */}
                                                    <td className="px-4 py-3">
                                                        <div className={`flex items-center gap-1.5 font-medium ${(priorityCfg[complaint.priority] || priorityCfg.Low).text}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${(priorityCfg[complaint.priority] || priorityCfg.Low).dot}`} />
                                                            {complaint.priority}
                                                        </div>
                                                    </td>
                                                    {/* Status (dropdown) */}
                                                    <td className="px-4 py-3">
                                                        <StatusSelect complaint={complaint} onUpdate={handleStatusUpdate} />
                                                    </td>
                                                    {/* Date */}
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                                <p className="text-xs text-slate-500">
                                    Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                    >
                                        <ChevronLeft size={12} /> Prev
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                        ${page === i + 1
                                                    ? 'bg-violet-600 text-white'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                    >
                                        Next <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ════════════ RIGHT PANEL */}
                    <aside className="w-64 shrink-0 border-l border-white/5 overflow-y-auto p-4 space-y-5 bg-[#0f0d1e]/40">

                        {/* Weekly Trends */}
                        <div className="rounded-2xl border border-white/8 bg-[#13112a] p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Weekly Trends</p>
                                <TrendingUp size={13} className="text-violet-400" />
                            </div>
                            <div className="flex gap-3 text-[10px] mb-3">
                                <span className="flex items-center gap-1 text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-violet-500/35 inline-block" /> Total
                                </span>
                                <span className="flex items-center gap-1 text-slate-400">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 inline-block" /> Resolved
                                </span>
                            </div>
                            <WeeklyChart complaints={complaints} />
                        </div>

                        {/* Top Categories */}
                        <div className="rounded-2xl border border-white/8 bg-[#13112a] p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Top Categories</p>
                            <TopCategories complaints={complaints} />
                        </div>

                        {/* Resolution Summary */}
                        <div className="rounded-2xl border border-white/8 bg-[#13112a] p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Resolution Summary</p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Resolved', value: resolved, pct: total > 0 ? Math.round((resolved / total) * 100) : 0, color: 'bg-emerald-500' },
                                    { label: 'In Progress', value: inProgress, pct: total > 0 ? Math.round((inProgress / total) * 100) : 0, color: 'bg-blue-500' },
                                    { label: 'Pending', value: pending, pct: total > 0 ? Math.round((pending / total) * 100) : 0, color: 'bg-yellow-500' },
                                ].map(({ label, value, pct, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-300">{label} ({value})</span>
                                            <span className="text-slate-400">{pct}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8 }}
                                                className={`h-full rounded-full ${color}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
