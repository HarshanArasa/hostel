import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAuth, requireAdmin } from '@/middleware/auth';

/**
 * PUT /api/complaints/:id
 * Admin-only: updates the status of a complaint.
 * Valid statuses: 'Pending', 'In Progress', 'Resolved'
 */
export async function PUT(req, { params }) {
    try {
        const payload = requireAuth(req);
        requireAdmin(payload);

        const { id } = await params;
        const { status } = await req.json();

        const validStatuses = ['Pending', 'In Progress', 'Resolved'];
        if (!validStatuses.includes(status)) {
            return Response.json({ error: `Status must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
        }

        const { data, error } = await getSupabaseAdmin()
            .from('complaints')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return Response.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return Response.json({ message: 'Complaint updated successfully', complaint: data });
    } catch (err) {
        const status = err.message.includes('token') || err.message.includes('auth') || err.message.includes('admin') ? 401 : 500;
        return Response.json({ error: err.message }, { status });
    }
}
