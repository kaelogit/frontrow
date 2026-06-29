"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { EventWithRelations, TicketListing } from "@/types/database";
import type { SectionZone } from "@/lib/stadium/bc-place-sections";
import { deriveZonesFromListings, filterListingsByDerivedZone } from "@/lib/stadium/derive-zones";
import { getMapDisplayMode } from "@/lib/stadium/registry";
import { StadiumMap } from "@/components/stadium/StadiumMap";
import { ReferenceStadiumMap, getReferenceMapImage } from "@/components/stadium/StadiumMapCanvas";
import { SectionViewPreview } from "@/components/stadium/SectionViewPreview";
import { ZoneOverviewMap } from "@/components/stadium/ZoneOverviewMap";
import { ListingCard } from "@/components/tickets/ListingCard";
import { QuantityModal } from "@/components/tickets/QuantityModal";
import { TicketFlowHeader } from "@/components/tickets/TicketFlowHeader";
import { ScarcityBanner } from "@/components/tickets/ScarcityBanner";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import { TicketFilterBar } from "@/components/tickets/TicketFilterBar";
import { CategoryChips } from "@/components/tickets/CategoryChips";
import {
  discountPercent,
  filterListings,
  listingMinMax,
  minPriceBySection,
  priceHistogram,
  scarcityPercent,
  sectionsWithStock,
  sortListings,
  type QuickFind,
  type SortOption,
} from "@/lib/tickets/filters";
import type { FeatureFilter, ViagogoZoneFilter } from "@/lib/tickets/zone-filters";

const PAGE_SIZE = 10;

interface TicketBrowserModalProps {
  event: EventWithRelations;
  listings: TicketListing[];
  open: boolean;
  onClose: () => void;
}

export function TicketBrowserModal({
  event,
  listings,
  open,
  onClose,
}: TicketBrowserModalProps) {
  const router = useRouter();
  const [showQtyModal, setShowQtyModal] = useState(true);
  const [ticketCount, setTicketCount] = useState(2);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [zoom, setZoom] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const [sort, setSort] = useState<SortOption>("recommended");
  const [quickFind, setQuickFind] = useState<QuickFind>(null);
  const [viagogoZones, setViagogoZones] = useState<ViagogoZoneFilter[]>([]);
  const [features, setFeatures] = useState<FeatureFilter[]>([]);
  const [perks, setPerks] = useState<string[]>([]);
  const [categoryZone, setCategoryZone] = useState<SectionZone | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [referenceMapFailed, setReferenceMapFailed] = useState(false);

  const mapSlug = event.venue?.stadium_map_slug ?? "bc-place";
  const venueSlug = event.venue?.slug ?? null;
  const baseMapDisplayMode = getMapDisplayMode(
    event.venue?.stadium_map_slug,
    event.seat_map_enabled,
    venueSlug
  );
  const mapDisplayMode =
    referenceMapFailed && baseMapDisplayMode === "reference"
      ? "zone"
      : baseMapDisplayMode;
  const showMapPanel = mapDisplayMode !== "none";
  const showZoomControls = mapDisplayMode === "section" || mapDisplayMode === "reference";
  const referenceMapImage =
    getReferenceMapImage(mapSlug) ?? getReferenceMapImage(venueSlug);

  useEffect(() => {
    if (!open) return;
    setShowQtyModal(true);
    setHeaderCollapsed(false);
    setReferenceMapFailed(false);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const derivedZones = useMemo(
    () => (mapDisplayMode === "zone" ? deriveZonesFromListings(listings) : []),
    [listings, mapDisplayMode]
  );

  const selectedDerivedZone = useMemo(
    () => derivedZones.find((z) => z.id === selectedZoneId) ?? null,
    [derivedZones, selectedZoneId]
  );

  const listingsScope = useMemo(
    () => filterListingsByDerivedZone(listings, selectedDerivedZone),
    [listings, selectedDerivedZone]
  );

  const globalRange = useMemo(() => listingMinMax(listingsScope), [listingsScope]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const effectiveMin = priceMin ?? globalRange?.min ?? 0;
  const effectiveMax = priceMax ?? globalRange?.max ?? 99999;

  const activeViagogoZones = useMemo(() => {
    if (categoryZone) {
      const merged = new Set([...viagogoZones, categoryZone as ViagogoZoneFilter]);
      return [...merged];
    }
    return viagogoZones;
  }, [viagogoZones, categoryZone]);

  const filtered = useMemo(() => {
    const base = filterListings(listingsScope, {
      ticketCount,
      sectionNumber: selectedSection,
      minPrice: effectiveMin,
      maxPrice: effectiveMax,
      viagogoZones: activeViagogoZones.length ? activeViagogoZones : undefined,
      features: features.length ? features : undefined,
      perks: perks.length ? perks : undefined,
      quickFind,
    });
    return sortListings(base, sort);
  }, [
    listingsScope,
    ticketCount,
    selectedSection,
    effectiveMin,
    effectiveMax,
    activeViagogoZones,
    features,
    perks,
    quickFind,
    sort,
  ]);

  const bestDealId = useMemo(() => {
    if (!filtered.length) return null;
    const sorted = [...filtered].sort((a, b) => discountPercent(b) - discountPercent(a));
    return sorted[0]?.id ?? null;
  }, [filtered]);

  const visible = filtered.slice(0, visibleCount);
  const histogramSource = useMemo(
    () =>
      filterListings(listingsScope, {
        ticketCount,
        sectionNumber: selectedSection,
        viagogoZones: activeViagogoZones.length ? activeViagogoZones : undefined,
      }),
    [listingsScope, ticketCount, selectedSection, activeViagogoZones]
  );
  const histRange = listingMinMax(histogramSource) ?? globalRange;
  const histogram = priceHistogram(
    histogramSource,
    histRange?.min ?? 0,
    histRange?.max ?? 1000
  );

  const stockSections = useMemo(() => sectionsWithStock(listings), [listings]);
  const priceBySection = useMemo(() => minPriceBySection(listings), [listings]);
  const scarcity = event.scarcity_override ?? scarcityPercent(listings);

  const venueAbbrev = (() => {
    if (mapSlug === "metlife") return "MetLife";
    if (mapSlug === "sofi") return "SoFi";
    if (mapSlug === "levis") return "Levi's";
    if (mapSlug === "bc-place" && mapDisplayMode === "section") return "BC Place";
    const name = event.venue?.name ?? "Stadium";
    if (name.includes("Akron")) return "Akron";
    if (name.includes("NRG")) return "NRG";
    return name.split(",")[0]?.trim().slice(0, 14) ?? "Stadium";
  })();

  const activeFilterCount =
    viagogoZones.length +
    features.length +
    perks.length +
    (selectedZoneId ? 1 : 0) +
    (priceMin != null || priceMax != null ? 1 : 0) +
    (sort !== "recommended" ? 1 : 0) +
    (quickFind ? 1 : 0);

  const handleListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setHeaderCollapsed(el.scrollTop > 36);
  }, []);

  const handleTicketCountChange = (n: number) => {
    setTicketCount(n);
    setVisibleCount(PAGE_SIZE);
  };

  const resetFilters = () => {
    setSort("recommended");
    setQuickFind(null);
    setViagogoZones([]);
    setFeatures([]);
    setPerks([]);
    setCategoryZone(null);
    setSelectedZoneId(null);
    setPriceMin(null);
    setPriceMax(null);
    setSelectedSection(null);
    setVisibleCount(PAGE_SIZE);
  };

  const handleViewListing = (listing: TicketListing) => {
    router.push(
      `/events/${event.slug}/tickets/review?listing=${listing.id}&qty=${ticketCount}`
    );
  };

  const handleCategoryZone = (zone: SectionZone | null) => {
    setCategoryZone(zone);
    setVisibleCount(PAGE_SIZE);
  };

  const filterPanelProps = {
    ticketCount,
    onTicketCountChange: handleTicketCountChange,
    minPrice: globalRange?.min ?? 0,
    maxPrice: globalRange?.max ?? 2000,
    priceMin: effectiveMin,
    priceMax: effectiveMax,
    onPriceRangeChange: (min: number, max: number) => {
      setPriceMin(min);
      setPriceMax(max);
      setVisibleCount(PAGE_SIZE);
    },
    histogram,
    sort,
    onSortChange: setSort,
    viagogoZones,
    onViagogoZonesChange: (z: ViagogoZoneFilter[]) => {
      setViagogoZones(z);
      setCategoryZone(null);
      setVisibleCount(PAGE_SIZE);
    },
    features,
    onFeaturesChange: (f: FeatureFilter[]) => {
      setFeatures(f);
      setVisibleCount(PAGE_SIZE);
    },
    perks,
    onPerksChange: (p: string[]) => {
      setPerks(p);
      setVisibleCount(PAGE_SIZE);
    },
    allListings: listings,
    resultCount: filtered.length,
    currency: event.currency,
    onReset: resetFilters,
    quickFind,
    onQuickFindChange: (v: QuickFind) => {
      setQuickFind(v);
      setVisibleCount(PAGE_SIZE);
    },
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-slate-100"
      role="dialog"
      aria-modal="true"
      aria-label="Ticket search"
    >
      <div className="shrink-0">
        <TicketFlowHeader
          event={event}
          onBack={onClose}
          backLabel="Close ticket search"
          compact
          collapsed={headerCollapsed}
        />

        <ScarcityBanner percent={scarcity} />

        <TicketFilterBar
          ticketCount={ticketCount}
          onTicketCountChange={handleTicketCountChange}
          minPrice={globalRange?.min ?? 0}
          maxPrice={globalRange?.max ?? 99999}
          priceMin={effectiveMin}
          priceMax={effectiveMax}
          onPriceRangeChange={(min, max) => {
            setPriceMin(min);
            setPriceMax(max);
            setVisibleCount(PAGE_SIZE);
          }}
          currency={event.currency}
          sort={sort}
          onSortChange={setSort}
          resultCount={filtered.length}
          activeFilterCount={activeFilterCount}
          onOpenFilters={() => setShowMobileFilters(true)}
        />
      </div>

      <QuantityModal
        open={showQtyModal}
        value={ticketCount}
        onChange={handleTicketCountChange}
        onContinue={() => setShowQtyModal(false)}
      />

      <div className="mx-auto flex w-full max-w-[1800px] min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {showMapPanel && (
          <div className="relative hidden min-h-0 flex-col overflow-hidden border-b border-slate-200 bg-white lg:flex lg:w-[min(48%,720px)] lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white shadow-md">
              {showZoomControls && (
                <>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
                    className="flex h-9 w-9 items-center justify-center hover:bg-slate-50"
                    aria-label="Zoom in"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                    className="flex h-9 w-9 items-center justify-center border-t border-slate-100 hover:bg-slate-50"
                    aria-label="Zoom out"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {selectedSection && mapDisplayMode === "section" && (
              <button
                type="button"
                onClick={() => setSelectedSection(null)}
                className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md"
              >
                Clear section {selectedSection}
              </button>
            )}

            {highlightedSection && (
              <div className="absolute left-4 top-4 z-10 hidden w-[min(100%,220px)] rounded-xl border border-slate-200 bg-white p-2 shadow-lg sm:block">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  View from seat
                </p>
                <SectionViewPreview
                  mapSlug={mapSlug}
                  sectionNumber={highlightedSection}
                  variant="panel"
                  className="min-h-[140px]"
                />
              </div>
            )}

            {mapDisplayMode === "section" && !highlightedSection && (
              <p className="absolute left-4 bottom-4 z-10 hidden rounded-full bg-white/90 px-3 py-1 text-xs text-slate-600 shadow-sm sm:block">
                Hover a section for pricing · click to filter
              </p>
            )}

            <div className="min-h-0 flex-1 overflow-hidden p-4">
              {mapDisplayMode === "section" ? (
                <StadiumMap
                  mapSlug={mapSlug}
                  availableSections={stockSections}
                  priceBySection={priceBySection}
                  selectedSection={selectedSection}
                  highlightedSection={highlightedSection}
                  onSectionClick={(s) =>
                    setSelectedSection((prev) => (prev === s ? null : s))
                  }
                  onSectionHover={setHighlightedSection}
                  zoom={zoom}
                />
              ) : mapDisplayMode === "reference" && referenceMapImage ? (
                <ReferenceStadiumMap
                  imageSrc={referenceMapImage}
                  venueName={event.venue?.name ?? "Stadium"}
                  zoom={zoom}
                  onImageError={() => setReferenceMapFailed(true)}
                />
              ) : (
                <ZoneOverviewMap
                  zones={derivedZones}
                  selectedZoneId={selectedZoneId}
                  onZoneSelect={(id) => {
                    setSelectedZoneId(id);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  venueName={event.venue?.name}
                />
              )}
            </div>

            {mapDisplayMode === "section" && (
              <CategoryChips selected={categoryZone} onSelect={handleCategoryZone} />
            )}
          </div>
        )}

        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50 ${
            showMapPanel ? "lg:border-r lg:border-slate-200" : ""
          }`}
        >
          <div
            ref={listRef}
            onScroll={handleListScroll}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-4"
          >
            {visible.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                currency={event.currency}
                ticketCount={ticketCount}
                venueAbbrev={venueAbbrev}
                mapSlug={mapSlug}
                isBestDeal={listing.id === bestDealId && discountPercent(listing) > 0}
                onView={handleViewListing}
                onHover={setHighlightedSection}
              />
            ))}

            {visibleCount < filtered.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-sky-600 hover:bg-sky-50"
              >
                Show more · Showing {visible.length} of {filtered.length}
              </button>
            )}

            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-500">
                No tickets match your filters. Try resetting or changing quantity.
              </p>
            )}
          </div>
        </div>

        <TicketFilters className="hidden min-h-0 lg:flex" {...filterPanelProps} />
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
            aria-label="Close filters"
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,340px)] flex-col bg-white shadow-xl">
            <TicketFilters {...filterPanelProps} className="flex-1 border-l-0" />
            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="border-t border-slate-200 py-3 text-sm font-semibold text-sky-600"
            >
              View {filtered.length} tickets
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/** @deprecated Use TicketBrowserModal on the event page. Kept for legacy imports. */
export const TicketsPageClient = TicketBrowserModal;

export function useTicketBrowserOpen(eventSlug: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const open = searchParams.get("tickets") === "1";

  const openBrowser = useCallback(() => {
    router.push(`/events/${eventSlug}?tickets=1`, { scroll: false });
  }, [eventSlug, router]);

  const closeBrowser = useCallback(() => {
    router.push(`/events/${eventSlug}`, { scroll: false });
  }, [eventSlug, router]);

  return { open, openBrowser, closeBrowser };
}
