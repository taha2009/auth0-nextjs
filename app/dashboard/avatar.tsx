'use client';

export default function Avatar() {
  return (
    <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-100 flex items-center justify-center border border-gray-200">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-10 h-10 text-gray-400"
        aria-hidden="true"
      >
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  );
}
