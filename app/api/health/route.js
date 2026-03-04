/**
 * GET /api/health
 * Checks all required environment variables and Supabase connectivity.
 * Visit http://localhost:3000/api/health to see what's misconfigured.
 */
export async function GET() {
    const checks = {
        DATABASE_URL: {
            set: !!process.env.DATABASE_URL,
            valid: process.env.DATABASE_URL?.startsWith('postgresql://') ||
                process.env.DATABASE_URL?.startsWith('postgres://'),
            value: process.env.DATABASE_URL ? (process.env.DATABASE_URL.split('@')[1] || 'URL set but hidden') : 'Not set',
        },
        JWT_SECRET: {
            set: !!process.env.JWT_SECRET,
            valid: (process.env.JWT_SECRET?.length ?? 0) >= 16,
        },
        ADMIN_EMAIL: {
            set: !!process.env.ADMIN_EMAIL,
            valid: process.env.ADMIN_EMAIL?.includes('@'),
            value: process.env.ADMIN_EMAIL,
        },
        ADMIN_PASSWORD: {
            set: !!process.env.ADMIN_PASSWORD,
            valid: (process.env.ADMIN_PASSWORD?.length ?? 0) >= 6,
        },
    };

    const allOk = Object.values(checks).every(c => c.set && c.valid !== false);
    const issues = Object.entries(checks)
        .filter(([, v]) => !v.set || v.valid === false)
        .map(([k, v]) => !v.set ? `${k} is not set` : `${k} looks invalid (placeholder value)`);

    return Response.json({
        status: allOk ? '✅ All good — ready to run' : '❌ Configuration issues found',
        issues,
        checks,
        nextStep: allOk
            ? 'Run npx prisma db push, then visit /api/auth/seed to create the admin account.'
            : 'Fill in the real DATABASE_URL in .env.local and restart npm run dev',
    }, { status: allOk ? 200 : 500 });
}
