'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) router.push('/');
  }, [session, router]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await signIn('resend', { email, redirect: false });
      if (res?.error) {
        setError(res.error);
      } else {
        setSent(true);
      }
    } catch {
      setError('Failed to send magic link. Check your email configuration.');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-charcoal">
      <div className="bg-dark-grey rounded-xl p-8 w-full max-w-sm border border-dark-grey-hover">
        <h1 className="font-display text-cream text-2xl text-center mb-2">Finance</h1>
        <p className="text-cream-muted text-sm text-center mb-6">Personal Ledger</p>

        {sent ? (
          <div className="text-center">
            <p className="text-cream text-sm">Magic link sent!</p>
            <p className="text-cream-muted text-xs mt-2">
              Check your inbox at <strong className="text-cream">{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-cream-muted text-xs mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-charcoal text-cream border border-dark-grey-hover rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cream transition-colors placeholder:text-cream-muted/50"
              />
            </div>

            {error && (
              <p className="text-danger text-xs">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-cream text-charcoal font-medium rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              Send Magic Link
            </button>

            <p className="text-cream-muted text-xs text-center">
              A one-time login link will be sent to your email. No password needed.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
