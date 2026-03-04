import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';

export async function GET(req) {
    try {
        const payload = requireAuth(req);
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status');
        const categoryFilter = searchParams.get('category');

        const where = {};

        // Students only see their own complaints
        if (payload.role === 'student') {
            where.userId = payload.userId;
        }

        // Optional filters
        if (statusFilter) where.status = statusFilter;
        if (categoryFilter) where.category = categoryFilter;

        const complaints = await prisma.complaint.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return Response.json({ complaints });
    } catch (err) {
        const status = err.message.includes('token') || err.message.includes('auth') ? 401 : 500;
        return Response.json({ error: err.message }, { status });
    }
}

export async function POST(req) {
    try {
        const payload = requireAuth(req);

        // Only students can submit complaints
        if (payload.role !== 'student') {
            return Response.json({ error: 'Only students can submit complaints' }, { status: 403 });
        }

        const { category, description, priority } = await req.json();

        if (!category || !description || !priority) {
            return Response.json({ error: 'Category, description, and priority are required' }, { status: 400 });
        }

        const complaint = await prisma.complaint.create({
            data: {
                userId: payload.userId,
                category,
                description,
                priority,
                status: 'Pending',
            },
        });

        return Response.json({ message: 'Complaint submitted successfully', complaint }, { status: 201 });
    } catch (err) {
        const status = err.message.includes('token') || err.message.includes('auth') ? 401 : 500;
        return Response.json({ error: err.message }, { status });
    }
}
