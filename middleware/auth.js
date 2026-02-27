import { verifyToken } from '@/lib/auth';

/**
 * Extracts and verifies the JWT from the Authorization header.
 * Returns the decoded token payload (userId, role, email).
 * Throws an error if the token is missing or invalid.
 *
 * @param {Request} req - Next.js API request
 * @returns {Object} Decoded JWT payload
 */
export function requireAuth(req) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or malformed authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
        return verifyToken(token);
    } catch {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Checks if the authenticated user has the admin role.
 * @param {Object} payload - Decoded JWT payload
 */
export function requireAdmin(payload) {
    if (payload.role !== 'admin') {
        throw new Error('Access denied: admin only');
    }
}
