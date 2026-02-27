import { getSupabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/register
 * Registers a new user with hashed password and sets their role.
 */
export async function POST(req) {
    try {
        const { name, email, password, role } = await req.json();

        // Validate required fields
        if (!name || !email || !password || !role) {
            return Response.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Validate role
        if (!['student', 'admin'].includes(role)) {
            return Response.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user into Supabase
        const { data, error } = await getSupabaseAdmin()
            .from('users')
            .insert([{ name, email, password: hashedPassword, role }])
            .select('id, name, email, role')
            .single();

        if (error) {
            if (error.code === '23505') {
                return Response.json({ error: 'Email already registered' }, { status: 409 });
            }
            throw error;
        }

        // Sign JWT
        const token = signToken({ userId: data.id, email: data.email, role: data.role });

        return Response.json(
            { message: 'Registration successful', token, user: data },
            { status: 201 }
        );
    } catch (err) {
        return Response.json({ error: 'Registration failed', details: err.message }, { status: 500 });
    }
}
