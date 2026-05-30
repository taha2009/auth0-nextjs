import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

/**
 * Verifies an Auth0 JWT access token against the tenant's public JWKS.
 *
 * Auth0 issues JWT access tokens only when an `audience` is set on the
 * authorization request (i.e. you have an API resource server configured).
 * Without an audience, Auth0 issues an opaque access token that cannot be
 * verified locally — use the /userinfo endpoint instead.
 */

// Cached per pod — env vars are fixed for the lifetime of the process, so a
// single RemoteJWKSet instance is correct even across concurrent requests.
// Different pods (e.g. different K8s stacks) each initialise their own instance
// from their own AUTH0_DOMAIN, with no cross-contamination.
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
  const options: Parameters<typeof jwtVerify>[2] = {
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  };

  // Only validate audience when one is configured — a mismatch would throw.
  if (process.env.AUTH0_AUDIENCE) {
    options.audience = process.env.AUTH0_AUDIENCE;
  }

  const { payload } = await jwtVerify(token, getJwks(), options);
  return payload;
}
