import { expect, test } from "@playwright/test";

/** Lumen Field R32 — mock listings in dev when Supabase is not configured. */
const TEST_EVENT_SLUG = "world-cup-match-82";

test.describe("Reservation checkout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("browse → select qty → pick listing → reserve → confirmation", async ({ page }) => {
    await page.goto(`/events/${TEST_EVENT_SLUG}?tickets=1`);

    await expect(page.getByRole("heading", { name: "How many tickets?" })).toBeVisible();
    await page.getByRole("button", { name: "View tickets" }).click();

    const ticketDialog = page.getByRole("dialog", { name: "Ticket search" });
    await expect(ticketDialog).toBeVisible();

    const firstListing = ticketDialog
      .locator("div.flex.w-full.gap-3.rounded-xl")
      .first();
    await expect(firstListing.getByText(/Section \d+/)).toBeVisible();

    const sectionLabel = (await firstListing.getByText(/Section \d+/).first().textContent())!;

    await firstListing.getByRole("button", { name: "View ticket" }).click();
    await page.waitForURL(new RegExp(`/events/${TEST_EVENT_SLUG}/tickets/review\\?listing=`));

    await expect(page.getByRole("heading", { name: sectionLabel })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(new RegExp(`/events/${TEST_EVENT_SLUG}/checkout`));

    await expect(page.getByRole("heading", { name: "Enter email" })).toBeVisible();

    const customerEmail = `e2e-${Date.now()}@example.com`;
    await page.getByPlaceholder("you@email.com").fill(customerEmail);
    await page.locator("#checkout-email-form").evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
    });

    await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();
    await page.getByLabel("Full name").fill("E2E Tester");
    await page.getByLabel(/Mobile phone/i).fill("+15555550100");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Payment method" })).toBeVisible();
    await expect(page.getByText("Request reservation")).toBeVisible();

    const checkoutResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/checkout") &&
        response.request().method() === "POST" &&
        Boolean(response.request().postData())
    );

    await page.getByRole("button", { name: "Submit reservation" }).click();

    const response = await checkoutResponse;
    expect(response.ok(), await response.text()).toBeTruthy();

    const payload = (await response.json()) as { reference: string };
    await page.waitForURL(new RegExp(`/order/${payload.reference}/confirmation`));

    await expect(page.getByRole("heading", { name: "Reservation received" })).toBeVisible();
    await expect(page.getByText(customerEmail)).toBeVisible();
    await expect(page.getByText("What happens next")).toBeVisible();
  });
});
