"use client";

import { openDB } from "idb";
import { demoStory } from "@/lib/demo";
import { StoryDocument } from "@/lib/story";

const DATABASE = "big-maq-story-engine";
const STORE = "stories";
const BACKUPS = "backups";
const SETTINGS = "settings";
const PASSCODES = "passcodes";

function db() {
  return openDB(DATABASE, 3, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(BACKUPS)) {
        database.createObjectStore(BACKUPS, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(SETTINGS)) {
        database.createObjectStore(SETTINGS, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(PASSCODES)) {
        database.createObjectStore(PASSCODES, { keyPath: "storyId" });
      }
    },
  });
}

export async function listStories() {
  return (await (await db()).getAll(STORE) as StoryDocument[]).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export async function getStory(id: string) {
  return (await (await db()).get(STORE, id)) as StoryDocument | undefined;
}

export async function saveStory(story: StoryDocument) {
  const next = { ...story, updatedAt: new Date().toISOString() };
  const database = await db();
  const existing = await database.get(STORE, next.id);
  if (existing) {
    await database.put(BACKUPS, {
      id: `${next.id}-${Date.now()}`,
      storyId: next.id,
      createdAt: new Date().toISOString(),
      story: existing,
    });
  }
  await database.put(STORE, next);
  return next;
}

export async function deleteStory(id: string) {
  const database = await db();
  await database.delete(STORE, id);
  await database.delete(PASSCODES, id);
}

export async function clearStories() {
  const database = await db();
  await database.clear(STORE);
  await database.clear(PASSCODES);
}

export async function listBackups(storyId: string) {
  const all = await (await db()).getAll(BACKUPS) as Array<{ id: string; storyId: string; createdAt: string; story: StoryDocument }>;
  return all.filter((backup) => backup.storyId === storyId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
}

export async function restoreBackup(backupId: string) {
  const backup = await (await db()).get(BACKUPS, backupId) as { story: StoryDocument } | undefined;
  if (!backup) return undefined;
  return saveStory(backup.story);
}

export async function seedDemoStory() {
  const database = await db();
  const seeded = await database.get(SETTINGS, "demo-seeded");
  const existing = await database.get(STORE, demoStory.id);
  if (!seeded || !existing) {
    await database.put(STORE, demoStory);
    await database.put(SETTINGS, { id: "demo-seeded", value: true });
  }
}

function makePasscode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("").slice(0, 10).toUpperCase();
}

export async function getOrCreateStoryPasscode(story: StoryDocument) {
  const database = await db();
  const existing = await database.get(PASSCODES, story.id) as { storyId: string; title: string; passcode: string; updatedAt: string } | undefined;
  if (existing) return existing.passcode;
  const record = {
    storyId: story.id,
    title: story.title,
    passcode: makePasscode(),
    updatedAt: new Date().toISOString(),
  };
  await database.put(PASSCODES, record);
  return record.passcode;
}

export async function listStoryPasscodes() {
  return (await (await db()).getAll(PASSCODES) as Array<{ storyId: string; title: string; passcode: string; updatedAt: string }>).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}
