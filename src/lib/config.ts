// Central place for the backend base URL so it's never hardcoded or
// duplicated across fetch calls. Two variants because client and server
// code sometimes need different hosts (e.g. an internal Docker network
// address server-side vs. a public URL for the browser):
//
//   NEXT_PUBLIC_API_BASE_URL — used in Client Components, browser fetch.
//                              Must be NEXT_PUBLIC_ to be exposed to the
//                              browser bundle.
//   API_BASE_URL             — used in Server Components and Route
//                              Handlers. Falls back to the public URL if
//                              you only have one backend host.
//
// Both default to localhost:4000 for local dev against a typical
// Express/Nest/Django-style API. Override in .env.local.

export const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

export const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
