import { PurchaseToastShell } from "@/components/marketing/PurchaseToastShell";

export default async function TicketFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PurchaseToastShell />
    </>
  );
}
