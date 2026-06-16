"use client";

import { openDB } from "idb";
import { demoStory } from "@/lib/demo";
import { StoryDocument } from "@/lib/story";

const DATABASE = "big-maq-story-engine";
const STORE = "stories";
const BACKUPS = "backups";
const SETTINGS = "settings";
const PASSCODES = "passcodes";

export type AppSettings = {
  theme: "light" | "dark" | "system";
  language: string;
  interfaceScale: "compact" | "comfortable" | "large";
  fontSize: number;
  startupPage: "home" | "reader" | "library" | "settings";
  autoSave: boolean;
  uiDensity: "compact" | "comfortable";
  sidebarWidth: number;
  animations: boolean;
  reducedMotion: boolean;
  colorAccessibility: "default" | "high-contrast" | "color-blind-friendly";
  readingFont: string;
  readingFontSize: number;
  readingWidth: "narrow" | "medium" | "wide";
  readingTheme: "paper" | "bright" | "night";
  readingProgressTracking: boolean;
  continueReading: "restart" | "resume";
  pageTransitions: boolean;
  autoSaveInterval: number;
  editorFont: string;
  editorFontSize: number;
  spellCheck: boolean;
  grammarCheck: boolean;
  wordCount: boolean;
  characterCount: boolean;
  branchVisualization: "simple" | "detailed";
  writingFocusMode: boolean;
  beginnerMode: boolean;
  advancedMode: boolean;
  onboardingStatus: "new" | "started" | "skipped" | "never" | "complete";
  currentTutorial?: string;
  completedTutorials: string[];
  hiddenStoryIds: string[];
  notifications: {
    storyUpdates: boolean;
    collaborationUpdates: boolean;
    importCompletion: boolean;
    exportCompletion: boolean;
    tutorialReminders: boolean;
  };
  passwordProtection: {
    enabled: boolean;
    strengthIndicator: boolean;
    visibilityToggle: boolean;
    accessAttemptFeedback: boolean;
  };
  backups: {
    automatic: boolean;
  };
  advanced: {
    developerMode: boolean;
    debugMode: boolean;
    experimentalFeatures: boolean;
    performanceMode: "balanced" | "fast" | "quality";
  };
};

export const defaultSettings: AppSettings = {
  theme: "system",
  language: "English",
  interfaceScale: "comfortable",
  fontSize: 16,
  startupPage: "home",
  autoSave: true,
  uiDensity: "comfortable",
  sidebarWidth: 390,
  animations: true,
  reducedMotion: false,
  colorAccessibility: "default",
  readingFont: "System",
  readingFontSize: 18,
  readingWidth: "medium",
  readingTheme: "paper",
  readingProgressTracking: true,
  continueReading: "restart",
  pageTransitions: true,
  autoSaveInterval: 450,
  editorFont: "System",
  editorFontSize: 16,
  spellCheck: true,
  grammarCheck: false,
  wordCount: true,
  characterCount: true,
  branchVisualization: "detailed",
  writingFocusMode: false,
  beginnerMode: true,
  advancedMode: false,
  onboardingStatus: "new",
  completedTutorials: [],
  hiddenStoryIds: [],
  notifications: {
    storyUpdates: true,
    collaborationUpdates: true,
    importCompletion: true,
    exportCompletion: true,
    tutorialReminders: true,
  },
  passwordProtection: {
    enabled: true,
    strengthIndicator: true,
    visibilityToggle: true,
    accessAttemptFeedback: true,
  },
  backups: {
    automatic: true,
  },
  advanced: {
    developerMode: false,
    debugMode: false,
    experimentalFeatures: false,
    performanceMode: "balanced",
  },
};

function mergeSettings(saved?: Partial<AppSettings>): AppSettings {
  return {
    ...defaultSettings,
    ...(saved || {}),
    notifications: {
      ...defaultSettings.notifications,
      ...(saved?.notifications || {}),
    },
    passwordProtection: {
      ...defaultSettings.passwordProtection,
      ...(saved?.passwordProtection || {}),
    },
    backups: {
      ...defaultSettings.backups,
      ...(saved?.backups || {}),
    },
    advanced: {
      ...defaultSettings.advanced,
      ...(saved?.advanced || {}),
    },
    completedTutorials: saved?.completedTutorials || defaultSettings.completedTutorials,
    hiddenStoryIds: saved?.hiddenStoryIds || defaultSettings.hiddenStoryIds,
  };
}

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

export async function listVisibleStories() {
  const [stories, settings] = await Promise.all([listStories(), getSettings()]);
  const hidden = new Set(settings.hiddenStoryIds);
  return stories.filter((story) => !hidden.has(story.id));
}

export function isEditableStory(story: StoryDocument) {
  return story.access?.mode !== "view-only";
}

export function isSharedStory(story: StoryDocument) {
  return !!story.access;
}

export async function listLibraryStories() {
  return (await listVisibleStories()).filter(isEditableStory);
}

export async function listHiddenStories() {
  const [stories, settings] = await Promise.all([listStories(), getSettings()]);
  const hidden = new Set(settings.hiddenStoryIds);
  return stories.filter((story) => hidden.has(story.id));
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
  const settings = await getSettings();
  if (settings.hiddenStoryIds.includes(id)) {
    await saveSettings({
      ...settings,
      hiddenStoryIds: settings.hiddenStoryIds.filter((storyId) => storyId !== id),
    });
  }
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

export async function getSettings() {
  const saved = await (await db()).get(SETTINGS, "app-settings") as { id: string; value: Partial<AppSettings> } | undefined;
  return mergeSettings(saved?.value);
}

export async function saveSettings(settings: AppSettings) {
  const merged = mergeSettings(settings);
  await (await db()).put(SETTINGS, { id: "app-settings", value: merged });
  return merged;
}

export async function updateSettings(patch: Partial<AppSettings>) {
  const current = await getSettings();
  return saveSettings(mergeSettings({ ...current, ...patch }));
}

export async function markTutorialComplete(tutorialId: string) {
  const current = await getSettings();
  const completedTutorials = Array.from(new Set([...current.completedTutorials, tutorialId]));
  return saveSettings({ ...current, completedTutorials, currentTutorial: undefined });
}

export async function hideStory(storyId: string) {
  const current = await getSettings();
  if (current.hiddenStoryIds.includes(storyId)) return current;
  return saveSettings({ ...current, hiddenStoryIds: [...current.hiddenStoryIds, storyId] });
}

export async function unhideStory(storyId: string) {
  const current = await getSettings();
  return saveSettings({
    ...current,
    hiddenStoryIds: current.hiddenStoryIds.filter((id) => id !== storyId),
  });
}
