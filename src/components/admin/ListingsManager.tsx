"use client";

import { useState, useTransition } from "react";
import type { TicketListing } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import {
  LISTING_BADGES,
  LISTING_PERKS,
  LISTING_TYPES,
} from "@/lib/listings/constants";
import {
  bulkAdjustPricesAction,
  createListingAction,
  deleteListingAction,
  duplicateListingAction,
  updateListingAction,
} from "@/app/admin/(dashboard)/events/[id]/listings/actions";
import { AdminStadiumMap } from "@/components/admin/AdminStadiumMap";
import { listingZone } from "@/lib/listings/admin-listings";

interface ListingsManagerProps {
  eventId: string;
  currency: string;
  listings: TicketListing[];
  sectionNumbers: string[];
  zones: { value: string; label: string }[];
  stadiumMapSlug?: string | null;
  rowLabelsBySection?: Record<string, string[]>;
  supabaseReady: boolean;
}

function listingTitle(listing: TicketListing) {
  if (listing.product_name) return listing.product_name;
  if (listing.section_number) return `Section ${listing.section_number}`;
  return "Listing";
}

export function ListingsManager({
  eventId,
  currency,
  listings,
  sectionNumbers,
  zones,
  stadiumMapSlug,
  rowLabelsBySection = {},
  supabaseReady,
}: ListingsManagerProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<TicketListing | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [mapSelectedSection, setMapSelectedSection] = useState<string | null>(null);
  const [draftSection, setDraftSection] = useState("");

  const run = (fn: () => Promise<{ error?: string; success?: boolean; updated?: number }>) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.updated) {
        setMessage(`Updated ${result.updated} listing(s).`);
      } else {
        setMessage("Saved.");
        setEditing(null);
        setMapSelectedSection(null);
        setDraftSection("");
      }
    });
  };

  if (!supabaseReady) {
    return (
      <div className="space-y-6">
        <div className="admin-callout-warning p-4 text-sm">
          Connect Supabase to add and edit listings. Showing sample data below.
        </div>
        <ListingsTable listings={listings} currency={currency} readOnly />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {listings.length} listing{listings.length !== 1 ? "s" : ""}
        </p>
        {zones.length > 0 && (
          <button
            type="button"
            onClick={() => setShowBulk(!showBulk)}
            className="text-sm text-accent hover:underline"
          >
            {showBulk ? "Hide bulk adjust" : "Bulk adjust by zone"}
          </button>
        )}
      </div>

      {showBulk && zones.length > 0 && (
        <form
          action={(fd) => run(() => bulkAdjustPricesAction(eventId, fd))}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-card-border bg-card p-4"
        >
          <div>
            <label className="block text-xs text-zinc-500">Zone</label>
            <select
              name="zone"
              required
              className="mt-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            >
              {zones.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Adjust by</label>
            <select
              name="adjust_type"
              className="mt-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            >
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat amount ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Value</label>
            <input
              name="adjust_value"
              type="number"
              step="any"
              required
              placeholder="10 or -5"
              className="mt-1 w-28 rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-card-border px-4 py-2 text-sm disabled:opacity-60"
          >
            Apply to zone
          </button>
        </form>
      )}

      {stadiumMapSlug && supabaseReady && !editing && (
        <AdminStadiumMap
          mapSlug={stadiumMapSlug}
          sectionNumbers={sectionNumbers}
          listings={listings}
          selectedSection={mapSelectedSection}
          onSectionSelect={(section) => {
            setMapSelectedSection(section);
            setDraftSection(section);
            setEditing(null);
            document.getElementById("listing-editor")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        />
      )}

      <ListingEditor
        key={editing?.id ?? `new-${mapSelectedSection ?? ""}`}
        id="listing-editor"
        eventId={eventId}
        currency={currency}
        sectionNumbers={sectionNumbers}
        initial={editing}
        draftSection={editing ? null : draftSection || mapSelectedSection}
        rowLabels={
          rowLabelsBySection[draftSection || mapSelectedSection || ""] ?? []
        }
        pending={pending}
        onCancel={() => {
          setEditing(null);
          setMapSelectedSection(null);
          setDraftSection("");
        }}
        onSectionChange={(section) => {
          setDraftSection(section);
          setMapSelectedSection(section || null);
        }}
        onSubmit={(fd) =>
          run(() =>
            editing
              ? updateListingAction(eventId, editing.id, fd)
              : createListingAction(eventId, fd)
          )
        }
      />

      <ListingsTable
        listings={listings}
        currency={currency}
        onEdit={setEditing}
        onDuplicate={(id) => run(() => duplicateListingAction(eventId, id))}
        onDelete={(id) => {
          if (!confirm("Delete this listing?")) return;
          run(() => deleteListingAction(eventId, id));
        }}
        pending={pending}
      />
    </div>
  );
}

function ListingEditor({
  id,
  eventId: _eventId,
  currency,
  sectionNumbers,
  initial,
  draftSection,
  rowLabels = [],
  pending,
  onCancel,
  onSectionChange,
  onSubmit,
}: {
  id?: string;
  eventId: string;
  currency: string;
  sectionNumbers: string[];
  initial: TicketListing | null;
  draftSection?: string | null;
  rowLabels?: string[];
  pending: boolean;
  onCancel: () => void;
  onSectionChange?: (section: string) => void;
  onSubmit: (formData: FormData) => void;
}) {
  const isEdit = Boolean(initial);
  const sectionValue = initial?.section_number ?? draftSection ?? "";

  return (
    <form
      id={id}
      action={onSubmit}
      className="space-y-4 rounded-xl border border-card-border bg-card p-5"
    >
      <h2 className="font-semibold">{isEdit ? "Edit listing" : "Add listing"}</h2>
      {!isEdit && draftSection && (
        <p className="text-sm text-sky-700">
          Section <strong>{draftSection}</strong> selected from map — enter row, qty, and price.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-xs text-zinc-500">Type</label>
          <select
            name="listing_type"
            defaultValue={initial?.listing_type ?? "seat"}
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
          >
            {LISTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-500">Section</label>
          {isEdit ? (
            <input
              name="section_number"
              list="section-options"
              defaultValue={initial?.section_number ?? ""}
              placeholder="227"
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          ) : sectionNumbers.length > 0 ? (
            <input
              name="section_number"
              list="section-options"
              value={sectionValue}
              onChange={(e) => onSectionChange?.(e.target.value)}
              placeholder="227"
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          ) : (
            <input
              name="section_number"
              value={sectionValue}
              onChange={(e) => onSectionChange?.(e.target.value)}
              placeholder="227"
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          )}
          {sectionNumbers.length > 0 && (
            <datalist id="section-options">
              {sectionNumbers.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </div>

        <div>
          <label className="block text-xs text-zinc-500">Row</label>
          <input
            name="row_label"
            list={rowLabels.length > 0 ? "row-options" : undefined}
            defaultValue={initial?.row_label ?? ""}
            placeholder="A, M, SS…"
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
          />
          {rowLabels.length > 0 && (
            <datalist id="row-options">
              {rowLabels.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs text-zinc-500">
            Product name (zone / hospitality)
          </label>
          <input
            name="product_name"
            defaultValue={initial?.product_name ?? ""}
            placeholder="Category 3, Trophy Lounge…"
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500">Quantity</label>
          <input
            name="quantity"
            type="number"
            min={1}
            max={20}
            required
            defaultValue={initial?.quantity ?? 2}
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500">Available</label>
          <input
            name="quantity_available"
            type="number"
            min={0}
            max={20}
            defaultValue={initial?.quantity_available ?? initial?.quantity ?? 2}
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500">Price ({currency})</label>
          <input
            name="price"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={initial?.price ?? ""}
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <input type="hidden" name="currency" value={currency} />

        <div>
          <label className="block text-xs text-zinc-500">View score (0–10)</label>
          <input
            name="view_score"
            type="number"
            min={0}
            max={10}
            step={0.1}
            defaultValue={initial?.view_score ?? ""}
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500">View label</label>
          <input
            name="view_label"
            defaultValue={initial?.view_label ?? ""}
            placeholder="Great, Amazing…"
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500">Status</label>
          <select
            name="status"
            defaultValue={initial?.status ?? "available"}
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="text-xs text-zinc-500">Perks</legend>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {LISTING_PERKS.map((perk) => (
              <label key={perk} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="perks"
                  value={perk}
                  defaultChecked={initial?.perks.includes(perk)}
                />
                {perk}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs text-zinc-500">Badges</legend>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {LISTING_BADGES.map((badge) => (
              <label key={badge} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="badges"
                  value={badge}
                  defaultChecked={initial?.badges.includes(badge)}
                />
                {badge}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="admin-btn-primary disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Update listing" : "Add listing"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            Cancel edit
          </button>
        )}
      </div>
    </form>
  );
}

function ListingsTable({
  listings,
  currency,
  readOnly,
  onEdit,
  onDuplicate,
  onDelete,
  pending,
}: {
  listings: TicketListing[];
  currency: string;
  readOnly?: boolean;
  onEdit?: (listing: TicketListing) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  pending?: boolean;
}) {
  if (listings.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No listings yet. Add your first above.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-card-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-card-border bg-card text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Listing</th>
            <th className="px-4 py-3 font-medium">Qty</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">View</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {!readOnly && <th className="px-4 py-3 font-medium"></th>}
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => {
            const zone = listingZone(listing.section_number);

            return (
              <tr key={listing.id} className="border-b border-card-border/50">
                <td className="px-4 py-3">
                  <p className="font-medium">{listingTitle(listing)}</p>
                  <p className="text-xs text-zinc-500">
                    {[
                      listing.row_label && `Row ${listing.row_label}`,
                      zone,
                      listing.badges.join(", ") || null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {listing.quantity_available}/{listing.quantity}
                </td>
                <td className="px-4 py-3">{formatPrice(listing.price, currency)}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {listing.view_score != null
                    ? `${listing.view_score} ${listing.view_label ?? ""}`.trim()
                    : "—"}
                </td>
                <td className="px-4 py-3 capitalize text-zinc-400">{listing.status}</td>
                {!readOnly && (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onEdit?.(listing)}
                        className="text-accent hover:underline disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onDuplicate?.(listing.id)}
                        className="text-zinc-400 hover:text-white disabled:opacity-60"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onDelete?.(listing.id)}
                        className="text-red-400 hover:underline disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
