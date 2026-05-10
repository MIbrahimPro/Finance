'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  Verification: 'The magic link has expired or already been used.',
  AccessDenied: 'Access denied.',
  default: 'Something went wrong.',
};

function LoginForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const urlError = searchParams.get('error');

  useEffect(() => {
    if (session) router.push(callbackUrl);
  }, [session, router, callbackUrl]);

  useEffect(() => {
    if (urlError) setError(ERROR_MESSAGES[urlError] || ERROR_MESSAGES.default);
  }, [urlError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('resend', { email, redirect: false, callbackUrl });
      if (res?.error) {
        setError(ERROR_MESSAGES[res.error] || ERROR_MESSAGES.default);
      } else {
        setSent(true);
      }
    } catch {
      setError('Failed to send magic link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div
        className="rounded-xl p-8 w-full max-w-sm mx-4 border"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-card-border)' }}
      >
        <h1 className="font-display text-2xl text-center mb-1" style={{ color: 'var(--color-text)' }}>
          Finance
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Personal Ledger
        </p>

        {sent ? (
          <div className="text-center">
            <p style={{ color: 'var(--color-text)' }}>Magic link sent!</p>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Check your inbox at <strong style={{ color: 'var(--color-text)' }}>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors"
                style={{
                  background: 'var(--color-input-bg)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-input-border)',
                }}
              />
            </div>

            {error && (
              <p className="text-xs p-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--color-danger)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-medium rounded-lg py-2.5 text-sm transition-opacity disabled:opacity-50"
              style={{ background: 'var(--color-accent)', color: 'white' }}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              A one-time link will be sent to your email.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
