import { requireSession } from '@/lib/session';

export default async function DashboardPage() {
  // requireSession() redirects to / if there is no valid JWT — no client-side
  // redirect needed. This is the Server Component pattern for auth-gating.
  const { payload } = await requireSession();

  const expiry = payload.exp
    ? new Date(payload.exp * 1000).toLocaleString()
    : 'unknown';

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Auth0 + Next.js</span>
          <div className="flex items-center gap-4">
            <a href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
              Profile
            </a>
            <a
              href="/api/auth/logout"
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sign Out
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm mb-8">
          You are authenticated. The JWT was verified server-side via Auth0 JWKS.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* JWT payload — shown directly from the verified token */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Token Payload</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-gray-400 w-16 shrink-0">sub</dt>
                <dd className="text-gray-700 font-mono break-all">{String(payload.sub)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-400 w-16 shrink-0">iss</dt>
                <dd className="text-gray-700 font-mono break-all">{String(payload.iss)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-400 w-16 shrink-0">exp</dt>
                <dd className="text-gray-700">{expiry}</dd>
              </div>
            </dl>
          </div>

          {/* Protected API demo */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Protected API Route</h2>
            <p className="text-sm text-gray-500 mb-4">
              <code className="bg-gray-100 px-1 rounded">GET /api/protected</code> verifies
              the JWT and returns protected data. Open it in a new tab:
            </p>
            <a
              href="/api/protected"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Open /api/protected →
            </a>
          </div>

          {/* User profile link */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-2">User Profile</h2>
            <p className="text-sm text-gray-500 mb-4">
              The <a href="/profile" className="underline">Profile page</a> is a Client
              Component that fetches from <code className="bg-gray-100 px-1 rounded">/api/auth/me</code>,
              demonstrating the client-side auth pattern.
            </p>
            <a
              href="/profile"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Profile →
            </a>
          </div>

          {/* Auth flow overview */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Auth Flow</h2>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>
                <code className="bg-gray-100 px-1 rounded text-xs">/api/auth/login</code>{' '}
                redirects to Auth0 with CSRF state
              </li>
              <li>User logs in on Auth0</li>
              <li>
                <code className="bg-gray-100 px-1 rounded text-xs">/api/auth/callback</code>{' '}
                exchanges code → JWT
              </li>
              <li>JWT stored in HTTP-only cookie</li>
              <li>
                Middleware &amp; server components verify JWT via JWKS
              </li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
