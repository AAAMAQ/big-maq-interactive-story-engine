import { expect, test } from "@playwright/test";

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
  await expect(page.getByRole("heading", { name: "A New Morning" })).toBeVisible();
  await page.getByRole("button", { name: "Pack carefully first →" }).click();
  await expect(page.getByRole("heading", { name: "Prepared" })).toBeVisible();
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByRole("heading", { name: "Professor Oak's Lab" })).toBeVisible();
});

test("serves install metadata and the offline worker", async ({ request }) => {
  await expect((await request.get("/manifest.webmanifest")).ok()).toBeTruthy();
  await expect((await request.get("/sw.js")).ok()).toBeTruthy();
});

test("homepage is focused and credits are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Read story" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create a story" })).toBeVisible();
  await expect(page.getByText("Learn visually")).toHaveCount(0);
  await page.getByRole("link", { name: "Credits" }).click();
  await expect(page.getByRole("heading", { name: "Credits" })).toBeVisible();
});
