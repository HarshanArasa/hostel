import { getSupabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/seed
 * One-time route to create the default admin account from env vars.
 * Uses ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME from .env.local
 * Safe to call multiple times — skips if admin already exists.
 */
export async function POST() {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        const name = process.env.ADMIN_NAME || 'Admin';

        if (!email || !password) {
            return Response.json(
                { error: 'ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local' },
                { status: 500 }
            );
        }

        // Check if admin already exists
        const { data: existing } = await getSupabaseAdmin()
            .from('users')
            .select('id, email')
            .eq('email', email)
            .single();

        if (existing) {
            return Response.json({
                message: 'Admin account already exists',
                email: existing.email,
            });
        }

        // Hash password and create admin
        const hashedPassword = await bcrypt.hash(password, 12);

        const { data, error } = await getSupabaseAdmin()
            .from('users')
            .insert([{ name, email, password: hashedPassword, role: 'admin' }])
            .select('id, name, email, role')
            .single();

        if (error) throw error;

        const token = signToken({ userId: data.id, email: data.email, role: data.role });

        return Response.json({
            message: '✅ Admin account created successfully',
            user: data,
            token,
        }, { status: 201 });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
