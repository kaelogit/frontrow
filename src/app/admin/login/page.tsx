import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Admin sign in",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginForm error={params.error} nextPath={params.next ?? "/admin"} />
    </div>
  );
}
