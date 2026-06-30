import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-4 w-4 border-[2px]",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
} as const;

interface FrontrowlySpinnerProps {
  size?: keyof typeof SIZES;
  className?: string;
  label?: string;
}

/** Frontrowly loading indicator — sky → indigo ring */
export function FrontrowlySpinner({
  size = "md",
  className,
  label = "Loading",
}: FrontrowlySpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "animate-spin rounded-full border-sky-200 border-t-sky-600 border-r-indigo-600",
        SIZES[size],
        className
      )}
    />
  );
}
