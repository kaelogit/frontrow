import Link from "next/link";
import { EventImportForm } from "@/components/admin/EventImportForm";
import { hasSupabaseConfig } from "@/lib/supabase/admin";

export const metadata = {
  title: "Import events",
};

export default function AdminEventsImportPage() {
  return (
    <div>
      <Link href="/admin/events" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← All events
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-zinc-900">Bulk import events</h1>
        <p className="mt-1 text-zinc-500">
          Upload a CSV of World Cup matches — preview errors, then import in one go.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          For listing SQL templates see{" "}
          <code className="rounded bg-slate-100 px-1 text-zinc-700">
            docs/ADMIN_SQL_TEMPLATES.md
          </code>
          .
        </p>
      </div>

      <div className="mt-8 max-w-4xl">
        <EventImportForm supabaseReady={hasSupabaseConfig()} />
      </div>
    </div>
  );
}
