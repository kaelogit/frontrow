import Link from "next/link";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: "h-4 w-4", box: "h-8 w-8 rounded-lg", text: "text-base" },
  md: { icon: "h-5 w-5", box: "h-10 w-10 rounded-xl", text: "text-xl" },
  lg: { icon: "h-6 w-6", box: "h-12 w-12 rounded-xl", text: "text-2xl" },
};

export function Logo({ className, size = "md" }: LogoProps) {
  const s = sizes[size];

  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <div
        className={cn(
          s.box,
          "flex items-center justify-center bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md shadow-sky-500/25 transition group-hover:shadow-lg group-hover:shadow-sky-500/30"
        )}
      >
        <Ticket className={cn(s.icon, "text-white")} strokeWidth={2.25} />
      </div>
      <span className={cn(s.text, "font-bold tracking-tight")}>
        <span className="text-slate-800">Front</span>
        <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
          rowly
        </span>
      </span>
    </Link>
  );
}
