'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  initials: string;
}

export default function Avatar({ src, name, initials }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={name ?? 'Avatar'}
        onError={() => setFailed(true)}
        className="w-20 h-20 rounded-full mx-auto mb-4 border border-gray-200 object-cover"
      />
    );
  }

  return (
    <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-500">
      {initials}
    </div>
  );
}
