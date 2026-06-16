import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("big-maq-suppress-onboarding", "true");
  });
});

test("creates a local story and opens the visual editor", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create a story" }).click();
  await expect(page).toHaveURL(/\/editor\/story-/);
  await expect(page.getByRole("heading", { name: "Scene inspector" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Play from selected" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Search title, text, tag, or chapter" })).toBeVisible();
  await page.getByRole("button", { name: "Scene", exact: true }).click();
  await page.getByRole("button", { name: "Auto-layout" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved locally")).toBeVisible();
  await page.goto("/library");
  await expect(page.getByText("2 scenes")).toBeVisible();
  await expect(page.getByText("Pallet Paths: A Trainer's First Choice")).toBeVisible();
});

test("plays the bundled fan demo through a branching choice", async ({ page }) => {
  await page.goto("/reader?demo=1");
  await expect(page.getByText("Unofficial fan-made educational demonstration.", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  await page.getByRole("button", { name: "Yes Prof. Oak! →" }).click();
  await expect(page.getByRole("heading", { name: "Scene 1" })).toBeVisible();
  await page.getByRole("button", { name: "Stay up late watching battles →" }).click();
  await expect(page.getByRole("heading", { name: "Scene 2" })).toBeVisible();
});

test("serves install metadata and the offline worker", async ({ request }) => {
  await expect((await request.get("/manifest.webmanifest")).ok()).toBeTruthy();
  await expect((await request.get("/sw.js")).ok()).toBeTruthy();
});

test("reader organizes available stories into shelves", async ({ page }) => {
  await page.goto("/reader");
  await expect(page.getByRole("heading", { name: "Reader" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your Stories" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shared Stories" })).toBeVisible();
  await expect(page.getByText("Pallet Paths: A Trainer's First Choice")).toBeVisible();
});

test("share popup offers read-only and read-modify permissions", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByText("Pallet Paths: A Trainer's First Choice")).toBeVisible();
  await page.getByRole("button", { name: "Share" }).first().click();
  await expect(page.getByRole("dialog", { name: /Share/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Option 1: Read Only" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Option 2: Read and Modify" })).toBeVisible();
  await expect(page.getByText("The recipient cannot:")).toBeVisible();
});

test("homepage is focused and credits are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Read story" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create a story" })).toBeVisible();
  await expect(page.getByText("Learn visually")).toHaveCount(0);
  await page.getByRole("link", { name: "Credits" }).click();
  await expect(page.getByRole("heading", { name: "Credits" })).toBeVisible();
});

test("settings exposes learning center and AI story prompt", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tutorials & Learning" })).toBeVisible();
  await expect(page.getByText("Learning progress", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Don't Know How to Create Stories/ })).toBeVisible();
  await page.getByRole("button", { name: "Expand Full Prompt" }).click();
  await expect(page.getByText("Use this exact JSON Schema generated from the current application story schema")).toBeVisible();
});

test("settings persist changes and can relaunch onboarding", async ({ page }) => {
  await page.goto("/settings");
  await page.locator("label").filter({ hasText: /^Theme/ }).locator("select").selectOption("dark");
  await page.getByLabel("Language").fill("Arabic");
  await page.getByRole("button", { name: "Launch Full Onboarding" }).click();
  await expect(page.getByRole("heading", { name: "Welcome to Story Engine" })).toBeVisible();
  await page.getByRole("button", { name: "Close onboarding" }).click();
  await page.reload();
  await expect(page.locator("label").filter({ hasText: /^Theme/ }).locator("select")).toHaveValue("dark");
  await expect(page.getByLabel("Language")).toHaveValue("Arabic");
});
