import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FrontrowlySpinner } from "@/components/ui/FrontrowlySpinner";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingLabel,
  children,
  disabled,
  className,
  type = "button",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(loading && "cursor-wait", className)}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <FrontrowlySpinner size="sm" />
          <span>{loadingLabel ?? children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
