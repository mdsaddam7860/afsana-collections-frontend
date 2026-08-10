import { API_BASE_URL } from "@/lib/config";

// Every call to the real backend should go through this, rather than
// each function in lib/api.ts / lib/admin-api.ts calling fetch()
// directly — one place to add auth headers, retries, or error
// formatting later without touching every call site.
//
// The Express API issues its own bearer JWTs (accessToken/refreshToken
// from POST /auth/login), not cookie sessions — so callers that need an
// authenticated request must pass the token explicitly. next-auth still
// owns the browser session; it just stores this backend token inside
// the NextAuth JWT (see lib/auth.ts) rather than managing auth itself.
export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { accessToken?: string }
): Promise<T> {
  const { accessToken, ...rest } = init ?? {};

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...rest.headers,
    },
    // Server-side calls (Server Components, Route Handlers) shouldn't be
    // cached by default — product/inventory data changes frequently.
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${body}`);
  }

  // 204 No Content (e.g. DELETE endpoints) has no body to parse.
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
