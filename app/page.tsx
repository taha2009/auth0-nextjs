import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LandingPage({ searchParams }: Props) {
  // Authenticated users skip the landing page
  const session = await getSession();
  if (session) redirect('/dashboard');

  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Auth0 + Next.js</span>
          <a
            href="/api/auth/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-8 text-sm text-left">
              <strong>Authentication error:</strong> {decodeURIComponent(error)}
            </div>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Auth0 + Next.js
          </h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            A reference implementation of Auth0 OAuth 2.0 Authorization Code
            flow in Next.js 15 — custom implementation, no SDK required.
          </p>
          <a
            href="/api/auth/login"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-base"
          >
            Sign in with Auth0
          </a>

          <div className="mt-12 grid grid-cols-3 gap-4 text-left">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-blue-600 font-mono text-xs mb-2">GET /api/auth/login</div>
              <p className="text-gray-600 text-xs">Redirects to Auth0 with CSRF state</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-blue-600 font-mono text-xs mb-2">GET /api/auth/callback</div>
              <p className="text-gray-600 text-xs">Exchanges code for token, sets HTTP-only cookie</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-blue-600 font-mono text-xs mb-2">GET /api/protected</div>
              <p className="text-gray-600 text-xs">Verifies JWT via Auth0 JWKS before serving data</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
