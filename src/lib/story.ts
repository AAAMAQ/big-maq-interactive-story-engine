import { z } from "zod";

const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), "Image URLs must use HTTPS.");

export const choiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Choice text is required."),
  targetSceneId: z.string().min(1),
  condition: z.string().optional(),
  effects: z.string().optional(),
});

export const sceneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Scene title is required."),
  body: z.string(),
  imageUrl: httpsUrl.optional().or(z.literal("")),
  localImageDataUrl: z.string().startsWith("data:image/").optional(),
  audioUrl: httpsUrl.optional().or(z.literal("")),
  localAudioDataUrl: z.string().startsWith("data:audio/").optional(),
  bonusText: z.string().optional(),
  tags: z.array(z.string()).optional(),
  chapter: z.string().optional(),
  color: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
  transition: z.discriminatedUnion("type", [
    z.object({ type: z.literal("choices"), choices: z.array(choiceSchema) }),
    z.object({ type: z.literal("continue"), targetSceneId: z.string().min(1) }),
    z.object({ type: z.literal("ending") }),
  ]),
});

export const storySchema = z.object({
  format: z.literal("big-maq-story"),
  version: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1, "Story title is required."),
  author: z.string().min(1, "Author is required."),
  description: z.string().optional(),
  variables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  startSceneId: z.string().min(1),
  scenes: z.array(sceneSchema).min(1),
  access: z
    .object({
      mode: z.enum(["view-only", "editable"]),
      passcodeProtected: z.boolean(),
      passcodeHash: z.string().optional(),
      exportedAt: z.string().datetime().optional(),
    })
    .optional(),
});

export type Choice = z.infer<typeof choiceSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type StoryDocument = z.infer<typeof storySchema>;

export type VerificationIssue = {
  code:
    | "duplicate-scene"
    | "missing-start"
    | "invalid-target"
    | "empty-choices"
    | "unreachable-scene"
    | "no-ending-path"
    | "loop-without-ending"
    | "empty-scene"
    | "duplicate-choice-label"
    | "long-scene"
    | "unsafe-expression";
  message: string;
  sceneId?: string;
  severity?: "error" | "warning";
};

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createBlankStory(): StoryDocument {
  const now = new Date().toISOString();
  const sceneId = newId("scene");
  return {
    format: "big-maq-story",
    version: 1,
    id: newId("story"),
    title: "Untitled adventure",
    author: "Story creator",
    description: "A new branching story built with Big MAQ Studio.",
    createdAt: now,
    updatedAt: now,
    startSceneId: sceneId,
    scenes: [
      {
        id: sceneId,
        title: "Start",
        body: "Your adventure begins here.",
        color: "#2563eb",
        position: { x: 80, y: 160 },
        transition: { type: "ending" },
      },
    ],
  };
}

export function sceneTargets(scene: Scene) {
  if (scene.transition.type === "ending") return [];
  if (scene.transition.type === "continue") return [scene.transition.targetSceneId];
  return scene.transition.choices.map((choice) => choice.targetSceneId);
}

export function evaluateCondition(condition: string | undefined, variables: StoryDocument["variables"]) {
  if (!condition?.trim()) return true;
  const match = condition.trim().match(/^([a-zA-Z_][\w-]*)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!match) return false;
  const [, key, op, raw] = match;
  const left = variables?.[key];
  const cleaned = raw.replace(/^["']|["']$/g, "");
  const right = cleaned === "true" ? true : cleaned === "false" ? false : Number.isNaN(Number(cleaned)) ? cleaned : Number(cleaned);
  switch (op) {
    case "==": return left == right;
    case "!=": return left != right;
    case ">": return Number(left) > Number(right);
    case "<": return Number(left) < Number(right);
    case ">=": return Number(left) >= Number(right);
    case "<=": return Number(left) <= Number(right);
    default: return false;
  }
}

export function applyEffects(effects: string | undefined, variables: StoryDocument["variables"] = {}) {
  const next = { ...variables };
  for (const part of (effects || "").split(";").map((item) => item.trim()).filter(Boolean)) {
    const increment = part.match(/^([a-zA-Z_][\w-]*)\s*([+-])=\s*(-?\d+(?:\.\d+)?)$/);
    if (increment) {
      const [, key, op, amount] = increment;
      next[key] = Number(next[key] || 0) + (op === "+" ? Number(amount) : -Number(amount));
      continue;
    }
    const assign = part.match(/^([a-zA-Z_][\w-]*)\s*=\s*(.+)$/);
    if (assign) {
      const [, key, raw] = assign;
      const cleaned = raw.trim().replace(/^["']|["']$/g, "");
      next[key] = cleaned === "true" ? true : cleaned === "false" ? false : Number.isNaN(Number(cleaned)) ? cleaned : Number(cleaned);
    }
  }
  return next;
}

function expressionLooksSafe(expression?: string) {
  if (!expression?.trim()) return true;
  return /^[\w\s"'=.!<>+\-;]+$/.test(expression);
}

export function verifyStory(story: StoryDocument): VerificationIssue[] {
  const issues: VerificationIssue[] = [];
  const ids = new Set<string>();
  for (const scene of story.scenes) {
    if (ids.has(scene.id)) {
      issues.push({
        code: "duplicate-scene",
        sceneId: scene.id,
        message: `Scene ID "${scene.id}" is used more than once.`,
      });
    }
    ids.add(scene.id);
  }

  if (!ids.has(story.startSceneId)) {
    issues.push({ code: "missing-start", message: "Choose an existing start scene." });
    return issues;
  }

  for (const scene of story.scenes) {
    const links = sceneTargets(scene);
    if (!scene.body.trim()) {
      issues.push({
        code: "empty-scene",
        sceneId: scene.id,
        message: `"${scene.title}" has no story text.`,
        severity: "warning",
      });
    }
    if (scene.body.length > 4000) {
      issues.push({
        code: "long-scene",
        sceneId: scene.id,
        message: `"${scene.title}" is long; consider splitting it into smaller scenes.`,
        severity: "warning",
      });
    }
    if (scene.transition.type === "choices" && links.length === 0) {
      issues.push({
        code: "empty-choices",
        sceneId: scene.id,
        message: `"${scene.title}" has choice mode enabled but no choices.`,
      });
    }
    if (scene.transition.type === "choices") {
      const labels = new Set<string>();
      for (const choice of scene.transition.choices) {
        const key = choice.label.trim().toLowerCase();
        if (labels.has(key)) {
          issues.push({
            code: "duplicate-choice-label",
            sceneId: scene.id,
            message: `"${scene.title}" has duplicate choice text.`,
            severity: "warning",
          });
        }
        labels.add(key);
        if (!expressionLooksSafe(choice.condition) || !expressionLooksSafe(choice.effects)) {
          issues.push({
            code: "unsafe-expression",
            sceneId: scene.id,
            message: `"${scene.title}" has a condition or effect with unsupported characters.`,
            severity: "warning",
          });
        }
      }
    }
    for (const target of links) {
      if (!ids.has(target)) {
        issues.push({
          code: "invalid-target",
          sceneId: scene.id,
          message: `"${scene.title}" links to a scene that does not exist.`,
        });
      }
    }
  }

  const reachable = new Set<string>();
  const walk = (sceneId: string) => {
    if (reachable.has(sceneId)) return;
    reachable.add(sceneId);
    const scene = story.scenes.find((item) => item.id === sceneId);
    if (scene) sceneTargets(scene).forEach((target) => ids.has(target) && walk(target));
  };
  walk(story.startSceneId);

  for (const scene of story.scenes) {
    if (!reachable.has(scene.id)) {
      issues.push({
        code: "unreachable-scene",
        sceneId: scene.id,
        message: `"${scene.title}" cannot be reached from the start scene.`,
      });
    }
  }

  const memo = new Map<string, boolean>();
  const canReachEnding = (sceneId: string, visiting = new Set<string>()): boolean => {
    if (memo.has(sceneId)) return memo.get(sceneId)!;
    if (visiting.has(sceneId)) return false;
    const scene = story.scenes.find((item) => item.id === sceneId);
    if (!scene) return false;
    if (scene.transition.type === "ending") return true;
    const nextVisiting = new Set(visiting).add(sceneId);
    const result = sceneTargets(scene).some((target) => canReachEnding(target, nextVisiting));
    memo.set(sceneId, result);
    return result;
  };

  for (const scene of story.scenes.filter((item) => reachable.has(item.id))) {
    if (!canReachEnding(scene.id)) {
      issues.push({
        code: "no-ending-path",
        sceneId: scene.id,
        message: `"${scene.title}" cannot reach an ending.`,
        severity: "error",
      });
    }
  }
  for (const scene of story.scenes.filter((item) => reachable.has(item.id) && item.transition.type !== "ending")) {
    if (sceneTargets(scene).includes(scene.id) && !canReachEnding(scene.id)) {
      issues.push({
        code: "loop-without-ending",
        sceneId: scene.id,
        message: `"${scene.title}" loops back to itself without a reachable ending.`,
        severity: "error",
      });
    }
  }
  return issues;
}

export function parseStory(value: unknown): StoryDocument {
  return storySchema.parse(value);
}

export function cloneStory(story: StoryDocument): StoryDocument {
  const now = new Date().toISOString();
  return {
    ...structuredClone(story),
    id: newId("story"),
    title: `${story.title} copy`,
    createdAt: now,
    updatedAt: now,
  };
}
