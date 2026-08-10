"use client";

import FloatingField from "./FloatingField";

export interface ContactInfo {
  email: string;
  firstName: string;
  lastName: string;
}

export default function InformationStep({
  value,
  onChange,
  onNext,
}: {
  value: ContactInfo;
  onChange: (v: ContactInfo) => void;
  onNext: () => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FloatingField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={value.email}
        onChange={(v) => onChange({ ...value, email: v })}
      />
      <div className="grid grid-cols-2 gap-5">
        <FloatingField
          id="firstName"
          label="First name"
          autoComplete="given-name"
          value={value.firstName}
          onChange={(v) => onChange({ ...value, firstName: v })}
        />
        <FloatingField
          id="lastName"
          label="Last name"
          autoComplete="family-name"
          value={value.lastName}
          onChange={(v) => onChange({ ...value, lastName: v })}
        />
      </div>

      <button
        type="submit"
        className="btn-fill mt-4 w-full rounded-sharp border border-accent py-4 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground"
      >
        Continue to shipping
      </button>
    </form>
  );
}
