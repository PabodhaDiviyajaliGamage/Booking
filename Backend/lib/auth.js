import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Verify JWT token from request headers
 * @param {Request} request - The Next.js request object
 * @returns {Object|null} - Decoded token or null if invalid
 */
export function verifyToken(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Create an unauthorized response
 * @param {string} message - Error message
 * @returns {NextResponse} - 401 response
 */
export function unauthorizedResponse(message = 'Access denied. No token provided.') {
  return NextResponse.json(
    { success: false, message },
    { status: 401 }
  );
}
