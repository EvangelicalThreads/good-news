import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      is_admin?: boolean;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    is_admin?: boolean;
    avatar?: string | null;
  }

  interface JWT {
    sub?: string;
    is_admin?: boolean;
    avatar?: string | null;
    name?: string | null;
    email?: string | null;
  }
}
