import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';

async function syncUserToSupabase(user: { id: string; email: string | null }) {
  if (!user.email) return;
  const { error } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
  });
  if (error) console.error('Error syncing user to Supabase:', error);
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        await syncUserToSupabase({ id: user.id, email: user.email });

        // ✅ Make sure types match NextAuth User
        return {
          ...user,
          is_admin: user.is_admin ?? undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email ?? null;
        token.name = user.name ?? null;
        token.avatar = user.avatar ?? null;
        token.is_admin = user.is_admin;
      }
      return token;
    },
    async session({ session, token }) {
  if (session.user) {
    // Narrow token to your custom JWT type
    const t = token as {
      sub?: string;
      email?: string | null;
      name?: string | null;
      avatar?: string | null;
      is_admin?: boolean;
    };

    session.user.id = t.sub ?? "";
    session.user.email = t.email ?? null;
    session.user.name = t.name ?? null;
    session.user.avatar = t.avatar ?? null;
    session.user.is_admin = t.is_admin; // now TypeScript knows it's boolean | undefined
  }
  return session;
    },
  },
};
