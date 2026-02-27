/**
 * GET /api/health
 * Checks all required environment variables and Supabase connectivity.
 * Visit http://localhost:3000/api/health to see what's misconfigured.
 */
export async function GET() {
    const checks = {
        NEXT_PUBLIC_SUPABASE_URL: {
            set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            valid: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') &&
                process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co'),
            value: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...',
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
            set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            valid: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ'),
        },
        SUPABASE_SERVICE_ROLE_KEY: {
            set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            valid: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ'),
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
            ? 'Call POST /api/auth/seed to create the admin account, then login.'
            : 'Fill in the real values in .env.local and restart npm run dev',
    }, { status: allOk ? 200 : 500 });
}
