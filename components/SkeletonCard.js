'use client';

/**
 * SkeletonCard — animated placeholder while data loads
 */
export default function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="h-4 bg-slate-700 rounded w-1/3" />
                <div className="h-6 bg-slate-700 rounded-full w-20" />
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-slate-700 rounded w-full" />
                <div className="h-3 bg-slate-700 rounded w-4/5" />
                <div className="h-3 bg-slate-700 rounded w-2/3" />
            </div>
            <div className="flex gap-3">
                <div className="h-5 bg-slate-700 rounded-full w-16" />
                <div className="h-5 bg-slate-700 rounded-full w-20" />
            </div>
        </div>
    );
}
