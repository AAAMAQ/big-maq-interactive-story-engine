import { describe, expect, it } from "vitest";
import { canEditSharedStory, createStoryShareExport } from "@/lib/download";
import { createBlankStory, parseStory, verifyStory } from "@/lib/story";
import { demoStory } from "@/lib/demo";

describe("story schema", () => {
  it("parses the bundled fan demo", () => {
    expect(parseStory(demoStory).title).toContain("Pallet Paths");
  });

  it("rejects non-HTTPS remote images", () => {
    const story = createBlankStory();
    story.scenes[0].imageUrl = "http://example.com/image.jpg";
    expect(() => parseStory(story)).toThrow();
  });

  it("rejects unsupported versions", () => {
    expect(() => parseStory({ ...demoStory, version: 2 })).toThrow();
  });

  it("marks exported stories as view-only or editable", async () => {
    const story = createBlankStory();
    const viewOnly = await createStoryShareExport(story, "view-only");
    const editable = await createStoryShareExport(story, "editable", "MAQ-CODE");
    expect(parseStory(viewOnly).access?.mode).toBe("view-only");
    expect(parseStory(editable).access?.passcodeProtected).toBe(true);
    expect(await canEditSharedStory(editable, "MAQ-CODE")).toBe(true);
    expect(await canEditSharedStory(editable, "WRONG")).toBe(false);
  });
});

describe("story verification", () => {
  it("accepts a valid branching graph with merging paths", () => {
    expect(verifyStory(demoStory)).toEqual([]);
  });

  it("finds an unreachable scene", () => {
    const story = createBlankStory();
    story.scenes.push({
      id: "lost",
      title: "Lost",
      body: "",
      color: "#000000",
      position: { x: 0, y: 0 },
      transition: { type: "ending" },
    });
    expect(verifyStory(story).some((issue) => issue.code === "unreachable-scene")).toBe(true);
  });

  it("finds invalid targets and paths without endings", () => {
    const story = createBlankStory();
    story.scenes[0].transition = { type: "continue", targetSceneId: "missing" };
    const issues = verifyStory(story);
    expect(issues.some((issue) => issue.code === "invalid-target")).toBe(true);
    expect(issues.some((issue) => issue.code === "no-ending-path")).toBe(true);
  });

  it("finds cycles that cannot reach an ending", () => {
    const story = createBlankStory();
    story.scenes[0].transition = { type: "continue", targetSceneId: story.startSceneId };
    expect(verifyStory(story).some((issue) => issue.code === "no-ending-path")).toBe(true);
  });
});
