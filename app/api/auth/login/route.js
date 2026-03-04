import { signToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return Response.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return Response.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Generate JWT
        const token = signToken({ userId: user.id, role: user.role });

        return Response.json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        return Response.json({ error: 'Login failed', details: err.message }, { status: 500 });
    }
}
