# Auth0 + Next.js

If you are building an app — your own idea, a side project, something for your team — and you are thinking about adding login, **please don't build auth yourself.**

Not because it's too hard. Because it's too easy to get wrong in ways that are invisible until someone gets hurt. Password hashing, token storage, session fixation, brute force protection, secure cookie flags, CSRF — each one is a chapter in a security textbook, and getting any of them slightly wrong quietly exposes your users.

This repo exists so you don't have to think about any of that.

---

## Use Auth0. Here's why.

[Auth0](https://auth0.com) is free for most personal and small projects (up to 25,000 monthly active users on the free tier). It handles:

- Passwords, hashing, and breach detection
- Social login (Google, GitHub, etc.) in a few clicks
- Multi-factor authentication
- Suspicious login detection
- Token signing and rotation
- Compliance (SOC2, GDPR, HIPAA)

Years of security engineering, maintained by a dedicated team, free. There is no version of rolling your own auth that beats this — not for a side project, not for a startup, not for an internal tool.

The only thing Auth0 doesn't do is wire itself into your app. That's what this repo is for.

---

## What this repo is

A working Next.js 15 app that shows exactly how to connect Auth0 to your application — no magic, no black-box SDK, just the real OAuth 2.0 Authorization Code flow written out so you can read it, understand it, and adapt it.

Built with a **server-side session store** and a **BFF (Backend for Frontend)** pattern:

- The JWT (the token Auth0 gives you after login) **never leaves the server**
- The browser only ever holds an opaque session ID — useless on its own
- All API calls from the browser go through Next.js API routes, which attach the token before forwarding to any backend service

You can copy this directly, or use it as a reference when building your own.

---

## How the login flow works

```mermaid
sequenceDiagram
    participant Browser
    participant Next.js
    participant Auth0
    participant Resource Server

    Browser->>Next.js: GET /api/auth/login
    Next.js-->>Browser: 302 to Auth0 /authorize
    Note over Browser,Next.js: Set-Cookie: auth_state (CSRF token)

    Browser->>Auth0: GET /authorize?response_type=code&state=xyz
    Note over Auth0: User logs in
    Auth0-->>Browser: 302 to /api/auth/callback?code=abc&state=xyz

    Browser->>Next.js: GET /api/auth/callback?code=abc&state=xyz
    Note over Next.js: Verify state, exchange code for JWT
    Next.js->>Auth0: POST /oauth/token
    Auth0-->>Next.js: access_token (JWT)
    Note over Next.js: Store JWT in session store, issue session ID
    Next.js-->>Browser: 302 to /dashboard
    Note over Browser,Next.js: Set-Cookie: session_id=uuid (HttpOnly)

    Browser->>Next.js: GET /api/protected (session_id cookie)
    Note over Next.js: Look up JWT by session ID, verify it
    Next.js->>Resource Server: GET /data (Authorization: Bearer JWT)
    Resource Server-->>Next.js: 200 data
    Next.js-->>Browser: 200 data
```

The browser never sees the JWT. It sends a session cookie, Next.js looks up the token on the server, verifies it, and makes the downstream call. Your resource server (an API, a database proxy, whatever) only ever talks to Next.js — never directly to the browser.

---

## Session design

| | JWT in cookie (common but weaker) | This implementation |
|---|---|---|
| Cookie content | The JWT itself | Opaque session ID (UUID) |
| JWT visible in DevTools | Yes | No |
| Revocable before expiry | No | Yes — delete from store |
| Scales across replicas | Yes (stateless) | Needs shared store (Redis) |

The in-memory store in `lib/session-store.ts` is intentionally simple to swap out. Replace `createSession`, `getSessionData`, and `deleteSessionData` with Redis calls and nothing else in the codebase changes.

---

## Project structure

```
├── middleware.ts              Edge-layer guard: redirects /dashboard and /profile if no session cookie
├── lib/
│   ├── auth.ts                verifyToken() — validates JWT against Auth0 JWKS using jose
│   ├── session-store.ts       In-memory session store (swap for Redis/DB in production)
│   └── session.ts             getSession() / requireSession() — for Server Components
└── app/
    ├── page.tsx               Landing page (redirects to /dashboard if already logged in)
    ├── dashboard/page.tsx     Protected Server Component — session resolved server-side
    ├── profile/page.tsx       Protected Client Component — fetches from /api/auth/me
    └── api/
        ├── auth/login/        Redirects to Auth0 /authorize with a CSRF state cookie
        ├── auth/callback/     Exchanges code for JWT, creates session, sets session_id cookie
        ├── auth/logout/       Deletes session from store, clears cookie, redirects to Auth0 /v2/logout
        ├── auth/me/           Resolves session → JWT → Auth0 /userinfo, returns profile
        └── protected/         Example BFF route: resolves session → JWT → forwards to resource server
```

---

## Patterns

### Server Component

```ts
// app/dashboard/page.tsx
import { requireSession } from '@/lib/session';

export default async function DashboardPage() {
  const { payload } = await requireSession(); // redirects to / if no valid session
  return <div>Hello {String(payload.sub)}</div>;
}
```

`requireSession()` reads the session ID cookie, looks up the JWT in the store, and verifies it — all on the server, in one step.

### Client Component

```ts
// app/profile/page.tsx
'use client';
useEffect(() => {
  fetch('/api/auth/me').then(res => res.json()).then(setProfile);
}, []);
```

Client Components can't access the session store directly, so they call a Next.js API route which resolves the session and returns only the data the browser needs.

### BFF API route (proxying to a resource server)

```ts
// app/api/your-resource/route.ts
import { getSessionData } from '@/lib/session-store';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const data = getSessionData(sessionId);
  if (!data) return NextResponse.json({ error: 'Session not found' }, { status: 401 });

  await verifyToken(data.token); // throws if expired or invalid

  // Forward to your resource server with the JWT — browser never sees this URL or token
  const res = await fetch(`${process.env.RESOURCE_SERVER_URL}/endpoint`, {
    headers: { Authorization: `Bearer ${data.token}` },
  });

  return NextResponse.json(await res.json());
}
```

The browser calls `/api/your-resource`. Next.js resolves the session to a JWT and forwards to the real backend. The resource server URL and JWT stay server-side.

---

## Setup

### 1. Create an Auth0 application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/) → **Applications** → **Create Application**
2. Choose **Regular Web Application**
3. In **Settings**, set:
   - **Allowed Callback URLs:** `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs:** `http://localhost:3000`
   - **Allowed Web Origins:** `http://localhost:3000`

### 2. Create an Auth0 API (optional but recommended)

Without an API audience, Auth0 issues an opaque access token that cannot be verified locally. With one, it issues a JWT.

1. Go to **APIs** → **Create API**
2. Set an **Identifier** (e.g. `https://myapp.example.com`) — this becomes `AUTH0_AUDIENCE`
3. Keep the default signing algorithm (RS256)

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://myapp.example.com   # from step 2, or leave empty
AUTH0_SCOPE=openid profile email
APP_BASE_URL=http://localhost:3000
```

### 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Sign in with Auth0**.

---

## Security notes

| Concern | How it's handled |
|---|---|
| CSRF on the callback | `state` parameter — random UUID in a short-lived HTTP-only cookie, verified on return |
| JWT never reaches browser | JWT lives in the server-side session store — only an opaque session ID is sent to the client |
| XSS token theft | Session ID cookie is `httpOnly` — inaccessible to JavaScript |
| Token expiry | `jwtVerify` (jose) rejects expired tokens; session resolves to null, user redirected to `/` |
| Session revocation | Delete the session ID from the store to immediately invalidate access |
| Auth0 session invalidation | Logout hits `/v2/logout` so Auth0's own session is cleared, preventing silent re-auth |
| Unverified middleware | Middleware checks session cookie presence only (edge-fast); full cryptographic verification happens in API routes and Server Components |

---

## Production considerations

- **Replicas:** the in-memory store does not survive process restarts and is not shared across pods. Replace `lib/session-store.ts` with a Redis adapter before running more than one replica.
- **Session expiry:** the current store has no TTL. Add expiry logic in `getSessionData` or rely on the JWT's own `exp` claim (already enforced by `verifyToken`).
- **HTTPS:** the session cookie is marked `secure` automatically when `NODE_ENV=production`.

---

## License

MIT
