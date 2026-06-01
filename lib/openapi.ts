export const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Auth0 + Next.js API',
    version: '1.0.0',
    description: 'Authentication API — session cookie required for protected endpoints.',
  },
  servers: [{ url: '' }],
  paths: {
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
          401: { description: 'Not authenticated or session expired' },
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
