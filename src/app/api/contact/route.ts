import { z } from "zod";
import { NextResponse } from "next/server";
import { sendContactEmails } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  orderReference: z.string().trim().max(32).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your name, email, and message." },
        { status: 400 }
      );
    }

    await sendContactEmails(parsed.data);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Contact]", err);
    return NextResponse.json(
      { error: "Could not send your message. Please email support@frontrowly.com directly." },
      { status: 500 }
    );
  }
}
