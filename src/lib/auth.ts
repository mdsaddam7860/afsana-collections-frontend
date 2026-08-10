import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { loginWithCredentials } from "@/lib/api";

// Role AND the backend's own accessToken live on the NextAuth token/session.
// next-auth still owns the browser-facing session cookie (so we keep its
// CSRF handling, /api/auth routes, middleware.ts integration, etc.) but the
// actual auth decision — and the JWT used to call the Express API — comes
// from the backend's POST /auth/login, not from NextAuth itself.
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const result = await loginWithCredentials(
          credentials.email,
          credentials.password
        );
        if (!result) return null;
        // Shape returned here becomes the `user` param in the jwt()
        // callback below — smuggle the backend tokens through it since
        // NextAuth's User type doesn't have a dedicated slot for them.
        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        } as never;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const u = user as unknown as {
          role?: string;
          id?: string;
          accessToken?: string;
          refreshToken?: string;
        };
        token.role = (u.role ?? "customer").toLowerCase();
        token.id = u.id;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        // NOTE: this does not yet refresh an expired accessToken using
        // POST /auth/refresh — for a short-lived JWT (e.g. 15 min), add
        // an expiry check here and call refreshToken before it lapses,
        // or admin/account pages will start getting 401s from the API
        // mid-session.
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      // Exposed so Server Components/Route Handlers can read
      // session.accessToken and pass it into apiFetch(path, { accessToken }).
      (session as unknown as { accessToken?: string }).accessToken =
        token.accessToken as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/account/login",
  },
};
