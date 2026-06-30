import { PaymentCredentialsManager } from "@/components/admin/PaymentCredentialsManager";

export default function AdminPaymentMethodsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Payment accounts</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Wire, Cash App, Apple Pay, and other manual payment destinations.
      </p>
      <div className="mt-8">
        <PaymentCredentialsManager />
      </div>
    </div>
  );
}
