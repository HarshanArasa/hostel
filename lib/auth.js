import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Signs a JWT token with the given payload.
 * @param {Object} payload - Data to encode (userId, role, email)
 * @returns {string} Signed JWT token
 */
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 * @throws Will throw if token is invalid or expired
 */
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
