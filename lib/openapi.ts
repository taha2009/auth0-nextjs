export const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Auth0 + Next.js API',
    version: '1.0.0',
    description: 'Internal API — protected endpoints require a valid Auth0 JWT as a Bearer token.',
  },
  servers: [{ url: '' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Auth0 JWT access token. Obtain one via the login flow, then copy it from your server logs or the session store.',
      },
    },
  },
  paths: {
    '/api/resource/protected': {
      get: {
        summary: 'Protected resource',
        description: 'Verifies the JWT against Auth0 JWKS and returns protected data. This simulates what a resource server would expose.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Access granted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Access granted' },
                    sub: { type: 'string', example: 'auth0|abc123' },
                    data: {
                      type: 'object',
                      properties: {
                        secret: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Missing or invalid token' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Current user profile',
        description: 'Returns the authenticated user\'s profile from the server-side session. Requires the session_id cookie (set automatically after login).',
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sub: { type: 'string', example: 'auth0|abc123' },
                    name: { type: 'string', example: 'Taha Z' },
                    email: { type: 'string', example: 'taha@example.com' },
                    picture: { type: 'string', format: 'uri' },
                    nickname: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/auth/login': {
      get: {
        summary: 'Initiate login',
        description: 'Redirects the browser to Auth0 Universal Login with a CSRF state cookie.',
        responses: {
          302: { description: 'Redirect to Auth0 /authorize' },
        },
      },
    },
    '/api/auth/logout': {
      get: {
        summary: 'Logout',
        description: 'Deletes the server-side session, clears the session cookie, and redirects to Auth0 /v2/logout.',
        responses: {
          302: { description: 'Redirect to Auth0 logout' },
        },
      },
    },
  },
};
