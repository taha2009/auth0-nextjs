import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

/**
 * Verifies an Auth0 JWT access token against the tenant's public JWKS.
 * Only applicable when AUTH0_AUDIENCE is configured — Auth0 issues a signed
 * JWT access token only when an audience is present in the authorization request.
 */
const getJwks = (() => {
  let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  return () => {
    if (!jwks) {
      jwks = createRemoteJWKSet(
        new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
      );
    }
    return jwks;
  };
})();

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_AUDIENCE,
  });
  return payload;
}
