const STEPS = ["Information", "Shipping", "Payment"] as const;
export type CheckoutStep = 0 | 1 | 2;

export default function StepIndicator({ current }: { current: CheckoutStep }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono-price text-[11px] transition-all duration-500 ${
                  done
                    ? "border-accent bg-accent text-accent-foreground"
                    : active
                    ? "border-accent text-accent"
                    : "border-border text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`font-mono-price text-[10px] uppercase tracking-widest transition-colors duration-500 ${
                  active || done ? "text-foreground" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-3 h-px flex-1 bg-border">
                <div
                  className="h-px bg-accent transition-all duration-700 ease-out"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
