import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Example of a protected Next.js API route.
 *
 * Accepts the token from either:
 *   - The auth_token cookie (browser requests from this app)
 *   - An Authorization: Bearer <token> header (machine-to-machine / mobile clients)
 *
 * This pattern mirrors how a separate backend API (e.g. FastAPI, Express) would
 * protect its endpoints — swap out the cookie read for the header-only variant
 * when building a standalone API service.
 */
export async function GET(request: NextRequest) {
  const cookieToken = request.cookies.get('auth_token')?.value;
  const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);

    return NextResponse.json({
      message: 'Access granted to protected resource',
      subject: payload.sub,
      data: {
        secret: 'This data is only accessible to authenticated users',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
