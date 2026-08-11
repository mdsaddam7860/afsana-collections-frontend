import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { loginWithCredentials } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

// Helper function to call your Express backend's refresh endpoint
// async function refreshAccessToken(token: any) {
//   try {
//     // Replace with your actual backend API URL
//     const baseUrl = API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

//     const response = await fetch(`${baseUrl}/auth/refresh`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ refreshToken: token.refreshToken }),
//     });

//     const refreshedTokens = await response.json();

//     if (!response.ok) {
//       throw refreshedTokens;
//     }

//     return {
//       ...token,
//       accessToken: refreshedTokens.accessToken,
//       accessTokenExpires: Date.now() + 15 * 60 * 1000, // Reset to 15 minutes from now
//       // Fall back to old refresh token if the backend doesn't return a new one
//       refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
//     };
//   } catch (error) {
//     console.error("Error refreshing access token", error);
//     return {
//       ...token,
//       error: "RefreshAccessTokenError", // We will use this in the frontend to force a logout
//     };
//   }
// }
async function refreshAccessToken(token: any) {
  try {
    console.log("Attempting to refresh token...");

    // Double check that API_BASE_URL includes '/api' if your backend requires it
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    // Safely parse the response to prevent 502 crashes
    const textResponse = await response.text();
    let refreshedTokens;

    try {
      refreshedTokens = JSON.parse(textResponse);
    } catch (parseError) {
      console.error("❌ Backend did not return JSON. Raw response:", textResponse);
      throw new Error("Invalid response from refresh endpoint");
    }

    if (!response.ok) {
      console.error("❌ Backend rejected refresh token:", refreshedTokens);
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error("❌ Refresh logic failed:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
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
      // 1. Initial sign in
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

        // Add expiration time (15 minutes from now)
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;

        return token;
      }

      // 2. Subsequent use: Return the token if it has NOT expired yet.
      // We subtract 1 minute (60000ms) as a buffer so we refresh just before it dies.
      if (Date.now() < (token.accessTokenExpires as number) - 60000) {
        return token;
      }

      // 3. Token has expired, try to refresh it
      return await refreshAccessToken(token);
    },

    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }

      // Pass tokens to the frontend/server components
      (session as unknown as { accessToken?: string }).accessToken = token.accessToken as string | undefined;

      // Pass the error to the client so it knows if the refresh failed (e.g., refresh token expired)
      (session as unknown as { error?: string }).error = token.error as string | undefined;

      return session;
    },
  },
  pages: {
    signIn: "/account/login",
  },
};