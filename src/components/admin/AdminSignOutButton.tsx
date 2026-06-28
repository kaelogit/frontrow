"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/admin";

interface AdminSignOutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminSignOutButton({ children, className }: AdminSignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    if (hasSupabaseConfig()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button type="button" onClick={handleSignOut} className={className}>
      {children}
    </button>
  );
}
