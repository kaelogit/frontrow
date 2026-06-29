import { expect, test } from "@playwright/test";

/** BC Place anchor event — mock listings in dev when Supabase is not configured. */
const TEST_EVENT_SLUG = "new-zealand-vs-belgium";

test.describe("Reservation checkout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("browse → select qty → pick listing → reserve → confirmation", async ({ page }) => {
    await page.goto(`/events/${TEST_EVENT_SLUG}?tickets=1`);

    await expect(page.getByRole("heading", { name: "How many tickets?" })).toBeVisible();
    await page.getByRole("button", { name: "View tickets" }).click();

    const ticketDialog = page.getByRole("dialog", { name: "Ticket search" });
    await expect(ticketDialog).toBeVisible();

    const listingCard = ticketDialog
      .locator("div.flex.w-full.gap-3.rounded-xl")
      .filter({ has: page.getByText("Section 342", { exact: true }) });

    await Promise.all([
      page.waitForURL(new RegExp(`/events/${TEST_EVENT_SLUG}/tickets/review\\?listing=`)),
      listingCard.getByRole("button", { name: "View ticket" }).click(),
    ]);

    await Promise.all([
      page.waitForURL(new RegExp(`/events/${TEST_EVENT_SLUG}/checkout`)),
      page.getByRole("button", { name: "Continue" }).first().click(),
    ]);

    await expect(page.getByRole("heading", { name: "Enter email" })).toBeVisible();

    const customerEmail = `e2e-${Date.now()}@example.com`;
    await page.locator('#checkout-email-form input[type="email"]').fill(customerEmail);
    await page.locator("#checkout-email-form").evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
    });

    await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();
    await page.getByPlaceholder("John Smith").fill("E2E Tester");
    await page.locator("#checkout-details-form").evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
    });

    await expect(page.getByRole("heading", { name: "Payment method" })).toBeVisible();
    await expect(page.getByText("Request reservation")).toBeVisible();

    const checkoutResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/checkout") &&
        response.request().method() === "POST" &&
        Boolean(response.request().postData())
    );

    await page.locator("#checkout-payment-form").evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
    });

    const response = await checkoutResponse;
    expect(response.ok(), await response.text()).toBeTruthy();

    const payload = (await response.json()) as { reference: string };
    await page.waitForURL(new RegExp(`/order/${payload.reference}/confirmation`));

    await expect(page.getByRole("heading", { name: "Reservation received" })).toBeVisible();
    await expect(page.getByText(customerEmail)).toBeVisible();
    await expect(page.getByText("What happens next")).toBeVisible();
  });
});
