import { parseStory, StoryDocument } from "@/lib/story";

export type StoryShareMode = "view-only" | "editable";

export function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function readStoryFile(file: File): Promise<StoryDocument> {
  return parseStory(JSON.parse(await file.text()));
}

export async function hashPasscode(passcode: string) {
  const bytes = new TextEncoder().encode(passcode.trim());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createStoryShareExport(story: StoryDocument, mode: StoryShareMode, passcode?: string) {
  const copy = structuredClone(story);
  copy.access = {
    mode,
    passcodeProtected: mode === "editable",
    passcodeHash: mode === "editable" && passcode ? await hashPasscode(passcode) : undefined,
    exportedAt: new Date().toISOString(),
  };
  return copy;
}

export async function canEditSharedStory(story: StoryDocument, passcode: string) {
  if (story.access?.mode !== "editable") return false;
  if (!story.access.passcodeProtected) return true;
  return story.access.passcodeHash === await hashPasscode(passcode);
}

export function storyFilename(story: StoryDocument) {
  const slug = story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug || "story"}.story.json`;
}
