'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  nickname?: string;
}

/**
 * Profile page — Client Component pattern.
 *
 * Fetches user data from /api/auth/me rather than reading the cookie directly
 * (which is not possible from Client Components since the cookie is HTTP-only).
 * The API route does the JWT verification server-side and returns the profile.
 */
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/');
          return null;
        }
        return res.json();
      })
      .then((data: UserProfile | null) => {
        if (data) setProfile(data);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Auth0 + Next.js</span>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
        <p className="text-gray-500 text-sm mb-8">
          Fetched client-side from{' '}
          <code className="bg-gray-100 px-1 rounded">/api/auth/me</code> — the route
          verifies the JWT and proxies Auth0&apos;s <code className="bg-gray-100 px-1 rounded">/userinfo</code>.
        </p>

        {loading ? (
          <div className="text-gray-400 text-sm">Loading…</div>
        ) : profile ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm">
            {profile.picture && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.picture}
                alt="Avatar"
                className="w-16 h-16 rounded-full mb-4 border border-gray-200"
              />
            )}
            <h2 className="font-semibold text-gray-900 text-lg">{profile.name}</h2>
            {profile.nickname && profile.nickname !== profile.name && (
              <p className="text-gray-500 text-sm">@{profile.nickname}</p>
            )}
            <p className="text-gray-600 text-sm mt-1">{profile.email}</p>
            <p className="text-gray-300 text-xs font-mono mt-4 break-all">{profile.sub}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
