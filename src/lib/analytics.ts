import { sceneTargets, StoryDocument } from "@/lib/story";

export type StoryAnalytics = {
  scenes: number;
  choices: number;
  endings: number;
  bonusScenes: number;
  taggedScenes: number;
  chapters: number;
  shortestPath: number;
  longestPath: number;
  mergeScenes: number;
};

export function analyzeStory(story: StoryDocument): StoryAnalytics {
  const incoming = new Map<string, number>();
  for (const scene of story.scenes) {
    for (const target of sceneTargets(scene)) incoming.set(target, (incoming.get(target) || 0) + 1);
  }
  const sceneById = new Map(story.scenes.map((scene) => [scene.id, scene]));
  const pathMemo = new Map<string, { shortest: number; longest: number }>();

  function measure(sceneId: string, visiting = new Set<string>()): { shortest: number; longest: number } {
    if (pathMemo.has(sceneId)) return pathMemo.get(sceneId)!;
    const scene = sceneById.get(sceneId);
    if (!scene) return { shortest: 0, longest: 0 };
    if (visiting.has(sceneId)) return { shortest: 0, longest: 0 };
    if (scene.transition.type === "ending") {
      const ending = { shortest: 1, longest: 1 };
      pathMemo.set(sceneId, ending);
      return ending;
    }
    const nextVisiting = new Set(visiting).add(sceneId);
    const branches = sceneTargets(scene)
      .map((target) => measure(target, nextVisiting))
      .filter((result) => result.shortest > 0 || result.longest > 0);
    if (!branches.length) {
      const deadEnd = { shortest: 1, longest: 1 };
      pathMemo.set(sceneId, deadEnd);
      return deadEnd;
    }
    const measured = {
      shortest: 1 + Math.min(...branches.map((branch) => branch.shortest)),
      longest: 1 + Math.max(...branches.map((branch) => branch.longest)),
    };
    pathMemo.set(sceneId, measured);
    return measured;
  }

  const { shortest, longest } = measure(story.startSceneId);
  return {
    scenes: story.scenes.length,
    choices: story.scenes.reduce((sum, scene) => sum + sceneTargets(scene).length, 0),
    endings: story.scenes.filter((scene) => scene.transition.type === "ending").length,
    bonusScenes: story.scenes.filter((scene) => scene.bonusText?.trim()).length,
    taggedScenes: story.scenes.filter((scene) => scene.tags?.length).length,
    chapters: new Set(story.scenes.map((scene) => scene.chapter).filter(Boolean)).size,
    shortestPath: shortest,
    longestPath: longest,
    mergeScenes: [...incoming.values()].filter((count) => count > 1).length,
  };
}
