"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TicketSelector } from "@/components/events/TicketSelector";
import { QuantityModal } from "@/components/tickets/QuantityModal";
import { TicketFlowHeader } from "@/components/tickets/TicketFlowHeader";
import { TicketFlowFooter } from "@/components/tickets/TicketFlowFooter";
import { getEventMatchDisplay } from "@/lib/events/match-display";
import { saveCheckoutSession } from "@/lib/checkout/storage";
import type { EventWithRelations } from "@/types/database";

interface CategoryTicketsPageClientProps {
  event: EventWithRelations;
}

export function CategoryTicketsPageClient({ event }: CategoryTicketsPageClientProps) {
  const router = useRouter();
  const [showQtyModal, setShowQtyModal] = useState(true);
  const [ticketCount, setTicketCount] = useState(2);
  const match = getEventMatchDisplay(event);

  const handleCheckout = (quantities: Record<string, number>) => {
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([categoryId, quantity]) => {
        const cat = event.ticket_categories?.find((c) => c.id === categoryId);
        return {
          categoryId,
          categoryName: cat?.name ?? "",
          quantity,
          unitPrice: cat?.price ?? 0,
        };
      });

    saveCheckoutSession({
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: match.headline,
      currency: event.currency,
      items,
    });
    router.push(`/events/${event.slug}/checkout`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TicketFlowHeader event={event} />

      <QuantityModal
        open={showQtyModal}
        value={ticketCount}
        onChange={setTicketCount}
        onContinue={() => setShowQtyModal(false)}
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-sky-600">
              {ticketCount} ticket{ticketCount !== 1 ? "s" : ""} · seated together
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Select tickets</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose your category — quantities shown for your party size
            </p>
            <div className="mt-6">
              <TicketSelector
                event={event}
                partySize={ticketCount}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      <TicketFlowFooter />
    </div>
  );
}
