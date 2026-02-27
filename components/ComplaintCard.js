'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, Tag, Calendar, User } from 'lucide-react';

const statusConfig = {
    'Pending': {
        color: 'text-amber-400',
        bg: 'bg-amber-500/15 border-amber-500/30',
        icon: Clock,
    },
    'In Progress': {
        color: 'text-blue-400',
        bg: 'bg-blue-500/15 border-blue-500/30',
        icon: AlertCircle,
    },
    'Resolved': {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/15 border-emerald-500/30',
        icon: CheckCircle2,
    },
};

const priorityColor = {
    Low: 'text-slate-400 bg-slate-500/20',
    Medium: 'text-yellow-400 bg-yellow-500/20',
    High: 'text-red-400 bg-red-500/20',
};

/**
 * ComplaintCard — glassmorphism card displaying a single complaint.
 * Used in both Student and Admin dashboards.
 *
 * @param {Object} complaint - Complaint data object
 * @param {boolean} isAdmin - If true, shows status update dropdown
 * @param {Function} onStatusChange - Callback for admin status updates
 */
export default function ComplaintCard({ complaint, isAdmin, onStatusChange }) {
    const status = statusConfig[complaint.status] || statusConfig['Pending'];
    const StatusIcon = status.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-violet-500/30 hover:bg-white/8 transition-colors group"
        >
            {/* Subtle gradient glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-violet-500/10">
                        <Tag size={14} className="text-violet-400" />
                    </div>
                    <span className="font-semibold text-white text-sm">{complaint.category}</span>
                </div>

                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                    <StatusIcon size={12} />
                    {complaint.status}
                </span>
            </div>

            {/* Description */}
            <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                {complaint.description}
            </p>

            {/* Footer meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {/* Priority */}
                <span className={`px-2 py-0.5 rounded-full font-medium ${priorityColor[complaint.priority] || priorityColor.Low}`}>
                    {complaint.priority} Priority
                </span>

                {/* Date */}
                <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(complaint.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                    })}
                </span>

                {/* User name (admin only) */}
                {isAdmin && complaint.users?.name && (
                    <span className="flex items-center gap-1">
                        <User size={11} />
                        {complaint.users.name}
                    </span>
                )}
            </div>

            {/* Admin status update */}
            {isAdmin && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <select
                        value={complaint.status}
                        onChange={(e) => onStatusChange(complaint.id, e.target.value)}
                        className="w-full bg-slate-800/80 border border-white/10 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            )}
        </motion.div>
    );
}
