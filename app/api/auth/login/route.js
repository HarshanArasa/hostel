import { getSupabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token.
 */
export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Fetch user from Supabase
        const { data: user, error } = await getSupabaseAdmin()
            .from('users')
            .select('id, name, email, password, role')
            .eq('email', email)
            .single();

        if (error || !user) {
            return Response.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Compare password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return Response.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Sign JWT
        const token = signToken({ userId: user.id, email: user.email, role: user.role });

        // Return user info without password
        const { password: _, ...userWithoutPassword } = user;
        return Response.json({ message: 'Login successful', token, user: userWithoutPassword });
    } catch (err) {
        return Response.json({ error: err.message || 'Login failed' }, { status: 500 });
    }
}
