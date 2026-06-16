import { describe, expect, it } from "vitest";
import { canEditSharedStory, createStoryShareExport } from "@/lib/download";
import { applyEffects, createBlankStory, evaluateCondition, parseStory, pickWeighted, randomInt, resolveSceneTransition, verifyStory } from "@/lib/story";
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
    expect(parseStory(editable).access?.passcodeAlgorithm).toBe("PBKDF2-SHA256-150000");
    expect(parseStory(editable).access?.passcodeSalt).toBeTruthy();
    expect(parseStory(editable).access?.passcodeVerifier).toBeTruthy();
    expect(await canEditSharedStory(editable, "MAQ-CODE")).toBe(true);
    expect(await canEditSharedStory(editable, "WRONG")).toBe(false);
  });

  it("evaluates effects and bonus-style conditions", () => {
    const variables = applyEffects("friendship += 1", { friendship: 0 });
    expect(evaluateCondition("friendship >= 1", variables)).toBe(true);
    expect(evaluateCondition("friendship >= 2", variables)).toBe(false);
  });

  it("supports RPG dice, inventory, skill checks, XP, and loot effects", () => {
    const story = createBlankStory();
    const variables = applyEffects('roll = random(1,1); addItem("Iron Sword"); gainXP(250); rollLoot("starter")', story.variables, {
      ...story,
      lootTables: { starter: [{ weight: 1, item: "Potion" }] },
    });
    expect(variables.roll).toBe(1);
    expect(evaluateCondition('hasItem("Iron Sword")', variables)).toBe(true);
    expect(evaluateCondition("strength >= 6", variables)).toBe(true);
    expect(variables.level).toBe(2);
    expect(variables.inventory).toEqual(expect.arrayContaining(["Iron Sword", "Potion"]));
  });

  it("selects deterministic random and weighted outcomes", () => {
    expect(randomInt(1, 6, () => 0)).toBe(1);
    expect(randomInt(1, 6, () => 0.999)).toBe(6);
    expect(pickWeighted([{ weight: 50, name: "a" }, { weight: 50, name: "b" }], () => 0.75)?.name).toBe("b");
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

  it("verifies random and encounter table targets", () => {
    const story = createBlankStory();
    story.scenes.push({
      id: "ending",
      title: "Ending",
      body: "Done.",
      color: "#16a34a",
      position: { x: 400, y: 0 },
      transition: { type: "ending" },
    });
    story.scenes[0].transition = {
      type: "random",
      options: [{ weight: 100, targetSceneId: "ending", effects: 'gainXP(10); addItem("Potion")' }],
    };
    expect(verifyStory(story)).toEqual([]);
    expect(resolveSceneTransition(story.scenes[0], () => 0)?.targetSceneId).toBe("ending");
    story.scenes[0].transition = { type: "encounter", table: [{ weight: 1, targetSceneId: "missing" }] };
    expect(verifyStory(story).some((issue) => issue.code === "invalid-target")).toBe(true);
  });
});
