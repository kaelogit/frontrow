import { Suspense } from "react";
import CheckoutPage from "./CheckoutPage";

export const metadata = {
  title: "Checkout",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-zinc-500">
          Loading checkout…
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}
