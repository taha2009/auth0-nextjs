import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

/**
 * Verifies an Auth0 JWT access token against the tenant's public JWKS.
 *
 * Auth0 issues JWT access tokens only when an `audience` is set on the
 * authorization request (i.e. you have an API resource server configured).
 * Without an audience, Auth0 issues an opaque access token that cannot be
 * verified locally — use the /userinfo endpoint instead.
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  const jwks = createRemoteJWKSet(
    new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
  );

  const options: Parameters<typeof jwtVerify>[2] = {
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  };

  // Only validate audience when one is configured — a mismatch would throw.
  if (process.env.AUTH0_AUDIENCE) {
    options.audience = process.env.AUTH0_AUDIENCE;
  }

  const { payload } = await jwtVerify(token, jwks, options);
  return payload;
}
