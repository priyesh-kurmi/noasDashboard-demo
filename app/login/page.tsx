'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui';

const DEMO_EMAIL = 'demo@dashboard.com';
const DEMO_PASSWORD = 'demo1234';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginWith = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-1">Noa&apos;s Café</h1>
          <p className="text-sm text-gray-600">Business Dashboard</p>
        </div>

        {/* Demo banner */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-1">Demo Mode</p>
          <p className="text-sm text-blue-700">
            This is a live demo of the dashboard. Click below to explore with sample data.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={() => loginWith(DEMO_EMAIL, DEMO_PASSWORD)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Entering Demo…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Enter Demo Dashboard
            </>
          )}
        </button>

        <div className="mt-6 text-center text-xs text-gray-400">
          All data shown is sample data for demonstration purposes only.
        </div>
      </div>
    </div>
  );
}
