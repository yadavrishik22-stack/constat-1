import { Page, expect } from "@playwright/test";
export async function login(
  page: Page,
  identifier = "superadmin",
  password = "Admin@123",
  target = "/dashboard",
) {
  await page.goto("/login");
  await page.getByLabel("Email or Username").fill(identifier);
  await page.getByLabel("Password", { exact: false }).fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${target}$`));
  await expect(page.locator(".loading")).toHaveCount(0);
}
