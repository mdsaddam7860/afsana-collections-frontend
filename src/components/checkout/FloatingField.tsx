"use client";

export default function FloatingField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="group relative">
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full border-b border-border bg-transparent pb-2 pt-4 text-sm text-foreground placeholder-transparent transition-colors focus:border-accent focus:outline-none"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-4 font-mono-price text-xs uppercase tracking-widest text-muted transition-all peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px]"
      >
        {label}
      </label>
    </div>
  );
}
