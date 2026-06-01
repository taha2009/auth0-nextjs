import { requireSession } from '@/lib/session';
import Avatar from './avatar';

export default async function DashboardPage() {
  const { user } = await requireSession();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-sm">Auth0 + Next.js</span>
          <a
            href="/api/auth/logout"
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Sign out
          </a>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm text-center shadow-sm">
          <Avatar />

          <h1 className="text-xl font-semibold text-gray-900">
            {user.name ?? 'Welcome'}
          </h1>
          {user.nickname && user.nickname !== user.name && (
            <p className="text-gray-400 text-sm mt-0.5">@{user.nickname}</p>
          )}
          {user.email && (
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          )}

          <p className="text-gray-400 text-xs mt-6 mb-6">
            Signed in via Auth0
          </p>

          <a
            href="/api/auth/logout"
            className="block w-full py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
          >
            Sign out
          </a>
        </div>
      </div>
    </main>
  );
}
