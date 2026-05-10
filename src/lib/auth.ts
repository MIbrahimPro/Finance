import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { getDb } from './server/db';
import { accounts, sessions, users, verificationTokens, authenticators } from './server/schema';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

function createAdapter() {
  try {
    if (!process.env.DATABASE_URL) return undefined;
    return DrizzleAdapter(getDb(), {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
      authenticatorsTable: authenticators,
    });
  } catch {
    return undefined;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: createAdapter(),
  providers: [
    Resend({
      from: process.env.AUTH_EMAIL_FROM || 'Finance <noreply@yourdomain.com>',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 90 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) return true;
      return !!auth;
    },
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
