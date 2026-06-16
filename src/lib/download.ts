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

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function derivePasscodeVerifier(passcode: string, saltBase64: string) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passcode.trim()),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromBase64(saltBase64),
      iterations: 150000,
    },
    keyMaterial,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

async function createPasscodeVerifier(passcode: string) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const passcodeSalt = toBase64(salt);
  return {
    passcodeAlgorithm: "PBKDF2-SHA256-150000",
    passcodeSalt,
    passcodeVerifier: await derivePasscodeVerifier(passcode, passcodeSalt),
  };
}

export async function createStoryShareExport(story: StoryDocument, mode: StoryShareMode, passcode?: string) {
  const copy = structuredClone(story);
  const verifier = mode === "editable" && passcode ? await createPasscodeVerifier(passcode) : {};
  copy.access = {
    mode,
    passcodeProtected: mode === "editable",
    ...verifier,
    exportedAt: new Date().toISOString(),
  };
  return copy;
}

export async function canEditSharedStory(story: StoryDocument, passcode: string) {
  if (story.access?.mode !== "editable") return false;
  if (!story.access.passcodeProtected) return true;
  if (story.access.passcodeSalt && story.access.passcodeVerifier) {
    return story.access.passcodeVerifier === await derivePasscodeVerifier(passcode, story.access.passcodeSalt);
  }
  return story.access.passcodeHash === await hashPasscode(passcode);
}

export function storyFilename(story: StoryDocument) {
  const slug = story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug || "story"}.story.json`;
}
