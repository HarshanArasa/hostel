import { signToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return Response.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Check if user already exists
        const exisitingUser = await prisma.user.findUnique({ where: { email } });
        if (exisitingUser) {
            return Response.json({ error: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'student',
            },
        });

        // Generate JWT
        const token = signToken({ userId: user.id, role: user.role });

        return Response.json({
            message: 'User registered successfully',
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token,
        }, { status: 201 });
    } catch (err) {
        console.error('Registration error:', err);
        return Response.json({ error: 'Registration failed', details: err.message }, { status: 500 });
    }
}
