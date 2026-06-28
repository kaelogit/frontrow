import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">This page or event doesn&apos;t exist.</p>
      <Link
        href="/events"
        className="mt-6 rounded-full bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
      >
        Browse events
      </Link>
    </div>
  );
}
