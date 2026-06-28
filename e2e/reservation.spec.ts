import { expect, test } from "@playwright/test";

/** BC Place anchor event — mock listings in dev when Supabase is not configured. */
const TEST_EVENT_SLUG = "new-zealand-vs-belgium";

test.describe("Reservation checkout", () => {
  test("browse → qty → listing → reserve → confirmation", async ({ page }) => {
    await page.goto(`/events/${TEST_EVENT_SLUG}?tickets=1`);

    await expect(page.getByRole("heading", { name: "How many tickets?" })).toBeVisible();
    await page.getByRole("button", { name: "View tickets" }).click();

    await expect(page.getByRole("dialog", { name: "Ticket search" })).toBeVisible();
    await page.getByRole("button", { name: "View ticket" }).first().click();

    await expect(page).toHaveURL(new RegExp(`/events/${TEST_EVENT_SLUG}/tickets/review`));
    await page.locator("aside").getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(new RegExp(`/events/${TEST_EVENT_SLUG}/checkout`));
    await expect(page.getByRole("heading", { name: "Enter email" })).toBeVisible();

    const customerEmail = `e2e-${Date.now()}@frontrowly.test`;
    await page.getByLabel("Email").fill(customerEmail);
    await page.locator("#checkout-email-form button[type='submit']").click();

    await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();
    await page.getByPlaceholder("John Smith").fill("E2E Tester");
    await page.locator("#checkout-details-form button[type='submit']").click();

    await expect(page.getByRole("heading", { name: "Payment method" })).toBeVisible();
    await expect(page.getByText("Reservation request")).toBeVisible();
    await page.locator("#checkout-payment-form button[type='submit']").click();

    await expect(page).toHaveURL(/\/order\/FRL-/);
    await expect(page.getByRole("heading", { name: "Reservation received" })).toBeVisible();
    await expect(page.getByText(customerEmail)).toBeVisible();
    await expect(page.getByText("What happens next")).toBeVisible();
  });
});
