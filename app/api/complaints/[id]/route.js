import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/middleware/auth';

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const { status } = await req.json();

        const validStatuses = ['Pending', 'In Progress', 'Resolved'];
        if (!validStatuses.includes(status)) {
            return Response.json({ error: `Status must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
        }

        const complaint = await prisma.complaint.update({
            where: { id },
            data: { status },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!complaint) {
            return Response.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return Response.json({ message: 'Complaint updated successfully', complaint });
    } catch (err) {
        const status = (err.message.includes('token') || err.message.includes('auth') || err.message.includes('admin')) ? 401 : 500;
        return Response.json({ error: err.message }, { status });
    }
}
