import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Resource server endpoint — accepts a JWT via Authorization: Bearer header.
 * Verifies the token against Auth0's JWKS and returns protected data.
 * This is what a separate resource server (e.g. your API) would implement.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing Bearer token' }, { status: 401 });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token);
    return NextResponse.json({
      message: 'Access granted',
      sub: payload.sub,
      data: {
        secret: 'This data is only accessible with a valid JWT',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
