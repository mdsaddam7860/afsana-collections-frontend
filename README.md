# Larkspur & Silk — Storefront + Admin

Next.js (App Router) + TypeScript + Tailwind CSS e-commerce site for a
hair accessories brand. Visual direction: **"Nocturne"** — dark,
editorial, boutique-at-night. See `DESIGN_RATIONALE.md` for the reasoning
behind the palette, type, and motion choices.

Covers the full original scope: storefront (home/shop/PDP/cart),
auth, Stripe checkout, an account dashboard, and an admin/inventory
panel — each isolated for independent scaling (see below).

## Setup

This zip is a complete project — `package.json`, `tsconfig.json`,
`next.config.js`, `tailwind.config.ts`, and `postcss.config.js` are all
included, wired to the `src/` layout and to `theme.config.ts`. No
scaffolding step needed:

```bash
cd storefront
npm install
cp .env.example .env.local   # then fill in real values, see below
npm run dev
```

Fonts (Fraunces, Archivo, JetBrains Mono) load via `next/font/google` in
`app/layout.tsx` — no separate install needed.

Add product images referenced in components (`/public/images/...`) —
these are placeholder paths; swap in real product photography.

Environment variables are listed in `.env.example` — `NEXTAUTH_SECRET`
(generate with `openssl rand -base64 32`), Google OAuth credentials, and
your Stripe test keys. Sign-up/checkout won't work until these are set,
but the site otherwise runs and renders without them.

To test the admin panel, set a user's role to `"admin"` in
`verifyUserCredentials` (`lib/api.ts`) or your real user table, then sign
in and visit `/admin`.

## Connecting a backend

By default the site runs entirely on mock data — no backend required.
When yours is ready:

1. Set `NEXT_PUBLIC_API_BASE_URL` (and `API_BASE_URL`, if your
   server-side host differs — e.g. an internal Docker address) in
   `.env.local`.
2. Set `NEXT_PUBLIC_USE_MOCK_API=false`.
3. Every function in `src/lib/api.ts` and `src/lib/admin-api.ts` will
   now call your backend through the shared `apiFetch` wrapper in
   `src/lib/http.ts`, hitting the paths listed in each function (e.g.
   `GET /products`, `PATCH /admin/orders/:id`) — adjust those paths to
   match your actual API, or add a thin adapter if the response shape
   differs from the `Product`/`Order`/`User` types in `src/types/index.ts`.

The mock/live switch is a single boolean check per function rather than
a silent try/catch fallback, so a misconfigured or down backend fails
loudly instead of quietly serving fake data.

## Rebranding for a new client

`src/lib/constants.ts` is the single file to edit when reusing this
codebase for a different hair-accessories (or similar) brand:

- Brand name, tagline, domain, support email
- SEO title/description
- Hero headline, body copy, and CTA labels
- Category list (drives Navbar links, Footer links, and CategoryGrid —
  edit it once, it updates everywhere)
- Footer newsletter copy and closing line
- Login/signup side-panel headline and body copy
- Checkout's flat shipping rate and tax rate (placeholders — replace
  with real rate lookups before launch)
- Social links

Beyond that file, a full rebrand also needs:

- Product photography in `/public/images/...` (paths are referenced in
  `lib/api.ts`'s mock data and in `HeroSection`/`CategoryGrid`)
- Palette and fonts in `globals.css` (`:root` CSS variables) and
  `theme.config.ts` — see `DESIGN_RATIONALE.md` for what each token
  controls

Component code shouldn't need to change for a standard rebrand — if you
find yourself editing a `.tsx` file just to change copy or a color,
that's a sign it should have been pulled into `constants.ts` or
`globals.css` instead.

## Folder structure

```
README.md
DESIGN_RATIONALE.md          Why these choices, for a hair-accessories brand

src/
    middleware.ts               Gates /admin at the edge by session role,
                                 before any admin code reaches the client

  app/
      layout.tsx                  Minimal root: fonts, atmosphere, AuthProvider
                                   only — no storefront or admin chrome
      globals.css                 CSS variable system, fluid type, keyframes

    (storefront)/                Route group — URLs unaffected (/shop is
                                  still /shop). Its layout renders Navbar,
                                  Footer, CartDrawer for every route inside.
      layout.tsx
      page.tsx                    Homepage (SSG, revalidate 1hr)
      shop/page.tsx                 Catalog with chip filters
      product/[slug]/page.tsx         Product detail
      checkout/page.tsx               3-step Stripe checkout
      account/
        login/page.tsx, signup/page.tsx
        page.tsx                      Dashboard (orders + wishlist tabs)

    (admin)/                     Separate route group — its own layout,
                                  its own sidebar, no storefront chrome.
                                  Every route here is blocked for non-admins
                                  by middleware.ts before render.
      layout.tsx                   AdminSidebar shell
      admin/
        page.tsx                    Overview — stat cards
        products/page.tsx             Inventory table, editable stock
        orders/page.tsx                Order fulfillment, status dropdown

    api/
      auth/[...nextauth]/, auth/register/    Auth
      checkout/                               Stripe PaymentIntent
      admin/inventory/, admin/orders/         Admin writes — re-check
                                               role server-side (belt and
                                               suspenders on top of
                                               middleware.ts)

  theme.config.ts              Tailwind theme extension mapped to CSS vars

  components/
    layout/     Navbar, Footer, AuthProvider — storefront chrome only
    home/       HeroSection, CategoryGrid, FeaturedProducts
    product/    ProductCard, ProductFilters, ProductGallery, VariantSelector
    cart/       CartDrawer
    checkout/   StepIndicator, OrderSummary, step forms, PaymentStep
    account/    AccountNav, OrderCard, WishlistCard
    admin/      AdminSidebar, InventoryTable, OrderRow — admin only

  store/
    cart-store.ts        Zustand cart state, persisted
    wishlist-store.ts    Zustand wishlist state, persisted

  lib/
    constants.ts     Brand/client copy — name, tagline, hero copy, nav
                      categories, footer copy, auth-page copy, checkout
                      shipping/tax defaults. THE file to edit for a rebrand.
    config.ts        Backend base URL — the ONE place it's read from
    http.ts          Shared fetch wrapper — all backend calls go through
                      this, not raw fetch() scattered across files
    api.ts           Customer-facing data layer — reads scoped to one user
    admin-api.ts      Admin data layer — cross-user reads + writes, kept as
                       a SEPARATE module on purpose (see comments in file)
                       so it's easy to later point at a different backend
                       host with elevated permissions
    auth.ts           NextAuth config, role-based JWT session
    stripe.ts, stripe-server.ts

  types/
    index.ts    Product, Variant, CartLine, User, Order
```

## Design system (Nocturne)

- Base: near-black warm plum `hsl(315 18% 7%)` · Surface `hsl(315 14% 12%)`
- Accent (sparing — CTAs, active states, cart badge only): molten copper `#E0793C`
- Display type: Fraunces, italic for emotional emphasis
- Body type: Archivo · Prices/labels/SKUs: JetBrains Mono
- All color/spacing/radius tokens live in `globals.css` `:root` and are
  mapped to Tailwind via `theme.config.ts` — change the palette in one
  place.

## Why this split (scaling notes)

- **Two route groups, two layouts.** `(storefront)` and `(admin)` each
  own their chrome. Next.js code-splits by route, so an admin visitor
  never downloads Navbar/Footer/CartDrawer, and a customer never
  downloads AdminSidebar or the inventory table — the separation is
  enforced by the framework, not just by convention.
- **Two data-layer modules.** `lib/api.ts` (customer reads, scoped to
  one user) and `lib/admin-api.ts` (cross-user reads + all writes) are
  separate files even though they currently both read the same mock
  array. When you connect a real backend, `admin-api.ts` is the one
  file that should point at elevated-permission credentials — nothing
  in `api.ts` should ever need them.
- **Role check in two places.** `middleware.ts` blocks page navigation
  at the edge (fast, no wasted render). The admin API routes
  (`/api/admin/*`) re-check the session server-side, since API routes
  are a separate attack surface from page navigation.
- **Cart vs. wishlist as separate stores.** Each is its own Zustand
  store/localStorage key — clearing or extending one never touches
  the other.

## Auth

`/account/login` and `/account/signup` are split-screen pages wired to
NextAuth (credentials + Google). Signup posts to
`app/api/auth/register/route.ts`, which calls the mocked `createUser` in
`lib/api.ts` — wire it to real password hashing and a DB insert. The
whole app is wrapped in `components/layout/AuthProvider.tsx`
(`SessionProvider`) from the root `app/layout.tsx`.

## Checkout

`/checkout` is a 3-step flow (Information → Shipping → Payment) over a
single Stripe `PaymentIntent`, created only once the user reaches step 3
(so incomplete checkouts don't leave abandoned intents). Stripe's
`PaymentElement` is themed via the `appearance` option in
`app/(storefront)/checkout/page.tsx` to match Nocturne. `OrderSummary` is
styled like a receipt — dashed rules, itemized lines, monospace totals.

## Account dashboard

`/account` is session-gated and shows two tabs — Orders and Wishlist —
using cards, never a table. Wishlist state lives in
`store/wishlist-store.ts`; the heart toggle is on every `ProductCard`
sitewide.

## Admin panel

`/admin` (Overview), `/admin/products` (inventory, editable stock per
variant, low-stock flagged in copper), `/admin/orders` (fulfillment,
status dropdown per order). Gated end-to-end: `middleware.ts` blocks
navigation, the two `/api/admin/*` routes re-check the session
server-side. All admin data currently comes from mocks in
`lib/admin-api.ts` — the inventory `PATCH` and order-status `PATCH`
routes are wired but need a real DB write behind `updateVariantStock`
and `updateOrderStatus`.

Business logic (cart/wishlist stores, data layers, auth config, types)
uses mock data throughout — this is a complete front-end scaffold ready
to connect to a real backend, not a production-ready backend itself.
