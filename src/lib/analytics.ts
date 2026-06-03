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
  const pathLengths: number[] = [];
  function walk(sceneId: string, depth: number, seen = new Set<string>()) {
    const scene = sceneById.get(sceneId);
    if (!scene || seen.has(sceneId)) {
      pathLengths.push(depth);
      return;
    }
    if (scene.transition.type === "ending") {
      pathLengths.push(depth + 1);
      return;
    }
    const nextSeen = new Set(seen).add(sceneId);
    sceneTargets(scene).forEach((target) => walk(target, depth + 1, nextSeen));
  }
  walk(story.startSceneId, 0);
  return {
    scenes: story.scenes.length,
    choices: story.scenes.reduce((sum, scene) => sum + (scene.transition.type === "choices" ? scene.transition.choices.length : scene.transition.type === "continue" ? 1 : 0), 0),
    endings: story.scenes.filter((scene) => scene.transition.type === "ending").length,
    bonusScenes: story.scenes.filter((scene) => scene.bonusText?.trim()).length,
    taggedScenes: story.scenes.filter((scene) => scene.tags?.length).length,
    chapters: new Set(story.scenes.map((scene) => scene.chapter).filter(Boolean)).size,
    shortestPath: Math.min(...pathLengths),
    longestPath: Math.max(...pathLengths),
    mergeScenes: [...incoming.values()].filter((count) => count > 1).length,
  };
}

