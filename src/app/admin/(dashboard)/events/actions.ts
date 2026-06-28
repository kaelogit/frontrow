"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import {
  eventFormToRecord,
  parseEventForm,
} from "@/lib/events/event-form";
import { isSlugTaken } from "@/lib/events/admin-events";

export async function createEventAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  if (!hasSupabaseConfig()) {
    return { error: "Connect Supabase to create events. See README." };
  }

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid form data" };
  }

  const values = parsed.data;

  if (await isSlugTaken(values.slug)) {
    return { error: "Slug already in use. Choose a different one." };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .insert(eventFormToRecord(values))
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return { error: "Failed to create event" };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect(`/admin/events/${data.id}/edit?created=1`);
}

export async function updateEventAction(eventId: string, formData: FormData) {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  if (!hasSupabaseConfig()) {
    return { error: "Connect Supabase to edit events." };
  }

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid form data" };
  }

  const values = parsed.data;

  if (await isSlugTaken(values.slug, eventId)) {
    return { error: "Slug already in use. Choose a different one." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("events")
    .update(eventFormToRecord(values))
    .eq("id", eventId);

  if (error) {
    console.error(error);
    return { error: "Failed to update event" };
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}/edit`);
  revalidatePath("/events");
  revalidatePath(`/events/${values.slug}`);
  revalidatePath(`/events/${values.slug}/tickets`);

  return { success: true };
}
