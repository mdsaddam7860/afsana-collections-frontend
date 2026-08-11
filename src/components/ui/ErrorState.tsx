import RetryButton from "./RetryButton";

// Branded stand-in for raw API/network failures — never surface a raw
// error.message from the backend (stack traces, Prisma/Zod internals,
// "fetch failed", etc.) to the user; pass a short, user-friendly
// `description` instead and let onRetry re-trigger whatever failed.
export default function ErrorState({
  title = "Something went wrong",
  description = "That didn't load right. Give it another try.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void | Promise<void>;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-display text-lg italic text-foreground">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      {onRetry && (
        <div className="mt-6">
          <RetryButton onRetry={onRetry} />
        </div>
      )}
    </div>
  );
}
