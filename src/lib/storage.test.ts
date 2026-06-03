import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { clearStories, deleteStory, getOrCreateStoryPasscode, getStory, listStories, listStoryPasscodes, saveStory } from "@/lib/storage";
import { createBlankStory } from "@/lib/story";

describe("local story storage", () => {
  beforeEach(async () => clearStories());

  it("creates, updates, lists, and deletes local stories", async () => {
    const story = createBlankStory();
    await saveStory(story);
    expect((await getStory(story.id))?.title).toBe("Untitled adventure");
    expect(await listStories()).toHaveLength(1);
    await saveStory({ ...story, title: "Updated title" });
    expect((await getStory(story.id))?.title).toBe("Updated title");
    await deleteStory(story.id);
    expect(await listStories()).toEqual([]);
  });

  it("keeps editable share passcodes locally", async () => {
    const story = await saveStory(createBlankStory());
    const first = await getOrCreateStoryPasscode(story);
    const second = await getOrCreateStoryPasscode(story);
    expect(first).toBe(second);
    expect(await listStoryPasscodes()).toMatchObject([{ storyId: story.id, passcode: first }]);
    await deleteStory(story.id);
    expect(await listStoryPasscodes()).toEqual([]);
  });
});
