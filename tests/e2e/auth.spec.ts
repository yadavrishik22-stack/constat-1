import { test, expect, Page } from "@playwright/test";
import { login } from "./helpers";
async function signup(page: Page, suffix = "") {
  await page.goto("/signup");
  for (const [label, value] of Object.entries({
    "Full Name": `Test Employee${suffix}`,
    "Email Address": `testemployee${suffix}@constat.in`,
    Username: `testemployee${suffix}`,
    Password: "Test@1234",
    "Confirm Password": "Test@1234",
  }))
    await page.getByLabel(label, { exact: false }).first().fill(value);
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/account-status$/);
  await expect(
    page.getByRole("heading", { name: "Account awaiting approval" }),
  ).toBeVisible();
}
async function employeeRow(page: Page) {
  return page
    .locator("tbody tr")
    .filter({ hasText: "testemployee@constat.in" });
}
async function editAccess(page: Page, grant: boolean) {
  await page.goto("/users");
  await page.getByRole("tab", { name: "Site Access", exact: true }).click();
  await (
    await employeeRow(page)
  )
    .getByRole("button", { name: "Manage Site Access" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("checkbox")
    .first()
    .setChecked(grant);
  await page.getByRole("button", { name: "Save Access", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
test("landing navigation, mobile branding, reduced motion and login/logout", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Construction tracking",
  );
  await page
    .getByRole("navigation", { name: "Public navigation" })
    .getByRole("link", { name: "Features" })
    .click();
  await expect(page).toHaveURL(/#features$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Public navigation" })
    .getByRole("link", { name: "Login", exact: true })
    .click();
  await page.getByLabel("Email or Username").fill("admin@constat.in");
  await page.getByLabel("Password").fill("Admin@123");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/dashboard$/);
  await expect(page.locator(".mobile-brand-tagline")).toBeVisible();
  await expect(page.getByLabel("Testing role")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Site overview",
  );
  await page.getByRole("button", { name: "Open account menu" }).click();
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page).toHaveURL(/login$/);
  await page.goto("/diesel");
  await expect(page).toHaveURL(/login$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator(".public-brand-copy")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
});

test("light hero and deliberate two-click pricing flow record a purchase request", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Construction tracking/ }),
  ).toBeVisible();
  await expect(page.locator(".simple-hero-graphic").first()).toBeVisible();
  await expect(page.locator(".light-hero img")).toHaveCount(0);
  await expect(page.getByText("₹25,999")).toHaveCount(0);
  await page
    .getByRole("link", { name: "Buy ConStat", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/buy$/);
  await expect(page.getByText("₹25,999")).toHaveCount(0);
  await expect(
    page.getByText("Manage multiple construction sites"),
  ).toBeVisible();
  await page.getByRole("link", { name: "View Pricing" }).click();
  await expect(page).toHaveURL(/buy\/pricing$/);
  await expect(page.getByText("₹25,999")).toBeVisible();
  await page.getByRole("link", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/buy\/request$/);
  await page.getByLabel("Company Name").fill("Build Right Constructions");
  await page.getByLabel("Full Name").fill("Ravi Kumar");
  await page.getByLabel("Email", { exact: false }).fill("ravi@example.com");
  await page.getByLabel("Phone", { exact: false }).fill("+91 98765 43210");
  await page.getByLabel("Number of Construction Sites").fill("3");
  await page.getByLabel("Optional Message").fill("Three active sites");
  await page.getByRole("button", { name: "Request ConStat Setup" }).click();
  await expect(page.getByRole("heading", { name: "Thank you." })).toBeVisible();
  await page.reload();
  await login(page);
  await page.goto("/purchase-requests");
  const row = page
    .locator("tbody tr")
    .filter({ hasText: "Build Right Constructions" });
  await expect(row).toContainText("Ravi Kumar");
  await row
    .getByLabel("Status for Build Right Constructions")
    .selectOption("contacted");
  await page.reload();
  await expect(
    row.getByLabel("Status for Build Right Constructions"),
  ).toHaveValue("contacted");
});
test("signup, pending guard, approval, request, grant, revoke and reactivate", async ({
  page,
}) => {
  await signup(page);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/account-status$/);
  await login(page);
  await page.goto("/users");
  await (
    await employeeRow(page)
  )
    .getByRole("button", { name: "Approve", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Approve Employee", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await login(page, "testemployee", "Test@1234");
  await expect(
    page.getByRole("heading", { name: "No construction sites assigned yet" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "User Management", exact: true }),
  ).toHaveCount(0);
  for (const path of ["/users", "/projects", "/data"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/dashboard$/);
  }
  await page.getByRole("link", { name: "View Available Sites" }).click();
  await page
    .getByRole("button", { name: "Request Access", exact: true })
    .click();
  await page
    .getByLabel("Message (optional)")
    .fill("Please assign me to the tower.");
  await page.getByRole("button", { name: "Send Request" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Request Access", exact: true }),
  ).toHaveCount(0);
  await login(page);
  await page.goto("/users");
  await page
    .getByRole("tab", { name: "Site Access Requests", exact: true })
    .click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await login(page, "testemployee", "Test@1234");
  await expect(page.getByLabel("Current project", { exact: true })).toHaveValue(
    "project-demo",
  );
  await page.goto("/diesel");
  await expect(page.locator("tbody tr").first()).toBeVisible();
  await login(page);
  await editAccess(page, false);
  await login(page, "testemployee", "Test@1234");
  await expect(
    page.getByRole("heading", { name: "No construction sites assigned yet" }),
  ).toBeVisible();
  await login(page);
  await editAccess(page, true);
  await login(page, "testemployee", "Test@1234");
  await expect(page.getByLabel("Current project", { exact: true })).toHaveValue(
    "project-demo",
  );
  await login(page);
  await page.goto("/users");
  await page.getByRole("tab", { name: "Employees", exact: true }).click();
  await (
    await employeeRow(page)
  )
    .getByRole("button", { name: "Deactivate", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await login(page, "testemployee", "Test@1234", "/account-status");
  await expect(
    page.getByRole("heading", { name: "Account inactive" }),
  ).toBeVisible();
});
test("rejection blocks entry and signup validates duplicate identity and confirmation", async ({
  page,
}) => {
  await page.goto("/signup");
  await page.getByLabel("Full Name").fill("Test Employee");
  await page.getByLabel("Email Address").fill("testemployee@constat.in");
  await page.getByLabel("Username").fill("testemployee");
  await page.getByLabel("Password", { exact: false }).first().fill("Test@1234");
  await page.getByLabel("Confirm Password").fill("Different1");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText("Passwords do not match.")).toBeVisible();
  await page.getByLabel("Confirm Password").fill("Test@1234");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/account-status$/);
  await login(page);
  await page.goto("/users");
  await (
    await employeeRow(page)
  )
    .getByRole("button", { name: "Reject", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await login(page, "testemployee", "Test@1234", "/account-status");
  await expect(
    page.getByRole("heading", { name: "Account not approved" }),
  ).toBeVisible();
  await page.goto("/signup");
  await page.getByLabel("Full Name").fill("Another Person");
  await page.getByLabel("Email Address").fill("TESTEMPLOYEE@CONSTAT.IN");
  await page.getByLabel("Username").fill("newemployee");
  await page.getByLabel("Password", { exact: false }).first().fill("Test@1234");
  await page.getByLabel("Confirm Password").fill("Test@1234");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(
    page.getByText("This email is already registered."),
  ).toBeVisible();
  await page.getByLabel("Email Address").fill("different@constat.in");
  await page.getByLabel("Username").fill("TESTEMPLOYEE");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText("This username is already taken.")).toBeVisible();
});
test("public and protected layouts fit phone, tablet and desktop", async ({
  page,
}) => {
  for (const width of [375, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/login",
      "/signup",
      "/buy",
      "/buy/pricing",
      "/buy/request",
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}`,
      ).toBe(true);
    }
  }
  await login(page);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/dashboard",
      "/my-sites",
      "/users",
      "/purchase-requests",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}`,
      ).toBe(true);
    }
  }
});
