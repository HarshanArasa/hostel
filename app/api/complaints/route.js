import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/middleware/auth';

/**
 * GET /api/complaints
 * - Student: returns own complaints only
 * - Admin: returns all complaints (supports ?status= and ?category= filters)
 *
 * POST /api/complaints
 * - Student: creates a new complaint
 */

export async function GET(req) {
    try {
        const payload = requireAuth(req);
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status');
        const categoryFilter = searchParams.get('category');

        let query = getSupabaseAdmin()
            .from('complaints')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });

        // Students only see their own complaints
        if (payload.role === 'student') {
            query = query.eq('user_id', payload.userId);
        }

        // Optional filters (admin only effectively)
        if (statusFilter) query = query.eq('status', statusFilter);
        if (categoryFilter) query = query.eq('category', categoryFilter);

        const { data, error } = await query;
        if (error) throw error;

        return Response.json({ complaints: data });
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

        const { data, error } = await getSupabaseAdmin()
            .from('complaints')
            .insert([{
                user_id: payload.userId,
                category,
                description,
                priority,
                status: 'Pending',
            }])
            .select()
            .single();

        if (error) throw error;

        return Response.json({ message: 'Complaint submitted successfully', complaint: data }, { status: 201 });
    } catch (err) {
        const status = err.message.includes('token') || err.message.includes('auth') ? 401 : 500;
        return Response.json({ error: err.message }, { status });
    }
}
