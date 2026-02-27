'use client';

import { motion } from 'framer-motion';

const letters = 'HostelOps'.split('');

/**
 * FullScreenLoader — premium animated loader with:
 * - Layered spinning orbital rings
 * - Animated glowing core
 * - Staggered letter-by-letter brand name
 * - Ambient floating particles
 * - Pulsing radial gradient backdrop
 */
export default function Loader() {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
            style={{ background: 'rgb(2, 6, 23)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
        >
            {/* Ambient pulsing radial glow */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                    background: [
                        'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)',
                        'radial-gradient(ellipse 80% 65% at 50% 50%, rgba(99,102,241,0.20) 0%, transparent 70%)',
                        'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)',
                    ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Floating ambient particles */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-violet-400/40"
                    style={{
                        left: `${15 + i * 10}%`,
                        top: `${20 + (i % 4) * 15}%`,
                    }}
                    animate={{
                        y: [-12, 12, -12],
                        x: [-6, 6, -6],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [0.8, 1.4, 0.8],
                    }}
                    transition={{
                        duration: 2.5 + i * 0.3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.2,
                    }}
                />
            ))}

            {/* Orbital rings stack */}
            <div className="relative flex items-center justify-center mb-10">
                {/* Outer ring — slow, violet */}
                <motion.div
                    className="absolute w-28 h-28 rounded-full border-2 border-transparent"
                    style={{ borderTopColor: 'rgba(139,92,246,0.9)', borderRightColor: 'rgba(139,92,246,0.3)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                />
                {/* Outer ring dash counter-spin */}
                <motion.div
                    className="absolute w-28 h-28 rounded-full border-2 border-dashed border-violet-500/15"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />

                {/* Middle ring — medium, indigo */}
                <motion.div
                    className="absolute w-20 h-20 rounded-full border-2 border-transparent"
                    style={{ borderTopColor: 'rgba(99,102,241,1)', borderLeftColor: 'rgba(99,102,241,0.4)' }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                />
                {/* Middle ring trail */}
                <motion.div
                    className="absolute w-20 h-20 rounded-full border border-indigo-400/10"
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Inner ring — fast, sky/pink */}
                <motion.div
                    className="absolute w-12 h-12 rounded-full border-2 border-transparent"
                    style={{ borderTopColor: 'rgba(167,139,250,1)', borderBottomColor: 'rgba(129,140,248,0.6)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                />

                {/* Glowing core */}
                <motion.div
                    className="relative w-7 h-7 rounded-full flex items-center justify-center"
                    animate={{
                        boxShadow: [
                            '0 0 0px 0px rgba(139,92,246,0)',
                            '0 0 24px 8px rgba(139,92,246,0.6)',
                            '0 0 0px 0px rgba(139,92,246,0)',
                        ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <motion.div
                        className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500"
                        animate={{ scale: [0.85, 1.15, 0.85] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </motion.div>

                {/* Orbiting dot on outer ring */}
                <motion.div
                    className="absolute"
                    style={{ width: 112, height: 112 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                >
                    <div
                        className="absolute w-2.5 h-2.5 rounded-full bg-violet-400 shadow-lg"
                        style={{
                            top: -5,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            boxShadow: '0 0 10px rgba(139,92,246,0.9)',
                        }}
                    />
                </motion.div>

                {/* Orbiting dot on inner ring (opposite direction) */}
                <motion.div
                    className="absolute"
                    style={{ width: 80, height: 80 }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                >
                    <div
                        className="absolute w-2 h-2 rounded-full bg-indigo-300"
                        style={{
                            bottom: -4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            boxShadow: '0 0 8px rgba(99,102,241,0.9)',
                        }}
                    />
                </motion.div>
            </div>

            {/* Staggered letter animation */}
            <div className="flex items-center gap-0.5 mb-3">
                {letters.map((letter, i) => (
                    <motion.span
                        key={i}
                        className="text-2xl font-bold"
                        style={{
                            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.1 + i * 0.06,
                            duration: 0.4,
                            ease: 'easeOut',
                        }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </div>

            {/* Animated status text with dot pulse */}
            <div className="flex items-center gap-2">
                <motion.p
                    className="text-xs text-slate-500 tracking-[0.2em] uppercase"
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    Loading
                </motion.p>
                <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full bg-violet-500"
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Animated progress bar */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-0.5 bg-white/5 rounded-full overflow-hidden"
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, rgba(139,92,246,0.6), rgba(99,102,241,1), rgba(139,92,246,0.6))',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
            </motion.div>
        </motion.div>
    );
}
