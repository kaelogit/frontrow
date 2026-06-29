import { Web3Provider } from "@/components/crypto/Web3Provider";

export default function TicketFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Web3Provider>{children}</Web3Provider>;
}
