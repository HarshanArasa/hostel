import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME;

        if (!adminEmail || !adminPassword) {
            return Response.json({ error: 'Admin credentials not configured' }, { status: 500 });
        }

        // Check if admin already exists
        let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

        if (admin) {
            return Response.json({ message: 'Admin account already exists', admin: { id: admin.id, email: admin.email } });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin
        admin = await prisma.user.create({
            data: {
                name: adminName || 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            },
        });

        return Response.json({
            message: 'Admin account seeded successfully',
            admin: { id: admin.id, email: admin.email, role: admin.role },
        }, { status: 201 });
    } catch (err) {
        console.error('Seed error:', err);
        return Response.json({ error: 'Seeding failed', details: err.message }, { status: 500 });
    }
}
