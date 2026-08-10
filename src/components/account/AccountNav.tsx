"use client";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Addresses" },
  { id: "wishlist", label: "Wishlist" },
  { id: "preferences", label: "Preferences" },
] as const;

export type AccountTab = (typeof TABS)[number]["id"];

export default function AccountNav({
  active,
  onChange,
  userName,
}: {
  active: AccountTab;
  onChange: (tab: AccountTab) => void;
  userName: string;
}) {
  return (
    <div>
      <p className="font-mono-price text-[11px] uppercase tracking-widest text-muted">
        Welcome back
      </p>
      <p className="font-display mt-1 text-2xl italic text-foreground">
        {userName}
      </p>

      {/* Mobile: horizontal chip scroll. Desktop: vertical list. */}
      <nav className="scrollbar-none mt-8 flex gap-2 overflow-x-auto md:mt-10 md:flex-col md:gap-1 md:overflow-visible">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-pill px-5 py-2.5 text-left font-mono-price text-[11px] uppercase tracking-widest transition-colors md:rounded-sharp md:px-4 md:py-3 ${
              active === tab.id
                ? "bg-accent text-accent-foreground md:border-l-2 md:border-accent md:bg-transparent md:text-accent"
                : "border border-border text-muted hover:text-foreground md:border-0 md:border-l-2 md:border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
