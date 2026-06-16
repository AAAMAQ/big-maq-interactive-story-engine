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

export const weightedTargetSchema = z.object({
  id: z.string().min(1).optional(),
  weight: z.number().positive("Weight must be greater than zero."),
  targetSceneId: z.string().min(1),
  effects: z.string().optional(),
});

export const lootEntrySchema = z.object({
  weight: z.number().positive("Weight must be greater than zero."),
  item: z.string().min(1),
  quantity: z.number().int().positive().optional(),
});

const variableValueSchema = z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]);

export const sceneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Scene title is required."),
  body: z.string(),
  imageUrl: httpsUrl.optional().or(z.literal("")),
  localImageDataUrl: z.string().startsWith("data:image/").optional(),
  audioUrl: httpsUrl.optional().or(z.literal("")),
  localAudioDataUrl: z.string().startsWith("data:audio/").optional(),
  bonusText: z.string().optional(),
  bonusCondition: z.string().optional(),
  tags: z.array(z.string()).optional(),
  chapter: z.string().optional(),
  color: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
  transition: z.discriminatedUnion("type", [
    z.object({ type: z.literal("choices"), choices: z.array(choiceSchema) }),
    z.object({ type: z.literal("continue"), targetSceneId: z.string().min(1) }),
    z.object({ type: z.literal("random"), options: z.array(weightedTargetSchema).min(1) }),
    z.object({ type: z.literal("encounter"), table: z.array(weightedTargetSchema).min(1) }),
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
  variables: z.record(z.string(), variableValueSchema).optional(),
  lootTables: z.record(z.string(), z.array(lootEntrySchema).min(1)).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  startSceneId: z.string().min(1),
  scenes: z.array(sceneSchema).min(1),
  access: z
    .object({
      mode: z.enum(["view-only", "editable"]),
      passcodeProtected: z.boolean(),
      passcodeHash: z.string().optional(),
      passcodeAlgorithm: z.string().optional(),
      passcodeSalt: z.string().optional(),
      passcodeVerifier: z.string().optional(),
      exportedAt: z.string().datetime().optional(),
    })
    .optional(),
});

export type Choice = z.infer<typeof choiceSchema>;
export type WeightedTarget = z.infer<typeof weightedTargetSchema>;
export type LootEntry = z.infer<typeof lootEntrySchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type StoryDocument = z.infer<typeof storySchema>;
export type StoryVariables = NonNullable<StoryDocument["variables"]>;

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
    variables: createDefaultRpgVariables(),
    lootTables: {
      starter: [
        { weight: 50, item: "Potion" },
        { weight: 30, item: "Gold", quantity: 10 },
        { weight: 15, item: "Iron Sword" },
        { weight: 5, item: "Ancient Artifact" },
      ],
    },
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
  if (scene.transition.type === "random") return scene.transition.options.map((option) => option.targetSceneId);
  if (scene.transition.type === "encounter") return scene.transition.table.map((option) => option.targetSceneId);
  return scene.transition.choices.map((choice) => choice.targetSceneId);
}

export function createDefaultRpgVariables(): StoryVariables {
  return {
    level: 1,
    xp: 0,
    strength: 5,
    defense: 5,
    agility: 5,
    wisdom: 5,
    charisma: 5,
    luck: 5,
    inventory: [],
  };
}

export function randomInt(min: number, max: number, rng: () => number = Math.random) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return Math.floor(rng() * (high - low + 1)) + low;
}

export function pickWeighted<T extends { weight: number }>(items: T[], rng: () => number = Math.random) {
  const valid = items.filter((item) => item.weight > 0);
  const total = valid.reduce((sum, item) => sum + item.weight, 0);
  if (!valid.length || total <= 0) return undefined;
  let roll = rng() * total;
  for (const item of valid) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return valid.at(-1);
}

export function resolveSceneTransition(scene: Scene, rng: () => number = Math.random) {
  if (scene.transition.type === "random") return pickWeighted(scene.transition.options, rng);
  if (scene.transition.type === "encounter") return pickWeighted(scene.transition.table, rng);
  return undefined;
}

function parseValue(raw: string, variables: StoryDocument["variables"] = {}) {
  const trimmed = raw.trim();
  const randomCall = trimmed.match(/^random\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/);
  if (randomCall) return randomInt(Number(randomCall[1]), Number(randomCall[2]));
  const cleaned = trimmed.replace(/^["']|["']$/g, "");
  if (cleaned === "true") return true;
  if (cleaned === "false") return false;
  if (variables && cleaned in variables) return variables[cleaned];
  return Number.isNaN(Number(cleaned)) ? cleaned : Number(cleaned);
}

function inventoryOf(variables: StoryDocument["variables"] = {}) {
  const value = variables.inventory;
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function hasItem(item: string, variables: StoryDocument["variables"] = {}) {
  return inventoryOf(variables).includes(item);
}

function addItem(variables: StoryVariables, item: string, quantity = 1) {
  const inventory = [...inventoryOf(variables)];
  for (let index = 0; index < quantity; index += 1) inventory.push(item);
  variables.inventory = inventory;
}

function removeItem(variables: StoryVariables, item: string) {
  const inventory = inventoryOf(variables);
  const index = inventory.indexOf(item);
  if (index >= 0) inventory.splice(index, 1);
  variables.inventory = inventory;
}

function gainXP(variables: StoryVariables, amount: number) {
  variables.level = Number(variables.level || 1);
  variables.xp = Number(variables.xp || 0) + amount;
  while (Number(variables.xp) >= Number(variables.level) * 100) {
    variables.xp = Number(variables.xp) - Number(variables.level) * 100;
    variables.level = Number(variables.level) + 1;
    for (const stat of ["strength", "defense", "agility", "wisdom", "charisma", "luck"] as const) {
      variables[stat] = Number(variables[stat] || 0) + 1;
    }
  }
}

export function evaluateCondition(condition: string | undefined, variables: StoryDocument["variables"]) {
  if (!condition?.trim()) return true;
  const hasItemMatch = condition.trim().match(/^hasItem\(\s*["'](.+)["']\s*\)$/);
  if (hasItemMatch) return hasItem(hasItemMatch[1], variables);
  const match = condition.trim().match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!match) return false;
  const [, rawLeft, op, rawRight] = match;
  const leftKey = rawLeft.trim();
  const left = /^random\(/.test(leftKey) ? parseValue(leftKey, variables) : variables?.[leftKey];
  const right = parseValue(rawRight, variables);
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

export function applyEffects(effects: string | undefined, variables: StoryDocument["variables"] = {}, story?: StoryDocument) {
  const next: StoryVariables = { ...variables };
  for (const part of (effects || "").split(";").map((item) => item.trim()).filter(Boolean)) {
    const addItemMatch = part.match(/^addItem\(\s*["'](.+)["']\s*(?:,\s*(\d+)\s*)?\)$/);
    if (addItemMatch) {
      addItem(next, addItemMatch[1], addItemMatch[2] ? Number(addItemMatch[2]) : 1);
      continue;
    }
    const removeItemMatch = part.match(/^removeItem\(\s*["'](.+)["']\s*\)$/);
    if (removeItemMatch) {
      removeItem(next, removeItemMatch[1]);
      continue;
    }
    const gainXpMatch = part.match(/^gainXP\(\s*(-?\d+(?:\.\d+)?)\s*\)$/);
    if (gainXpMatch) {
      gainXP(next, Number(gainXpMatch[1]));
      continue;
    }
    const lootMatch = part.match(/^rollLoot\(\s*["'](.+)["']\s*\)$/);
    if (lootMatch && story?.lootTables?.[lootMatch[1]]) {
      const loot = pickWeighted(story.lootTables[lootMatch[1]]);
      if (loot) addItem(next, loot.item, loot.quantity || 1);
      continue;
    }
    const increment = part.match(/^([a-zA-Z_][\w-]*)\s*([+-])=\s*(.+)$/);
    if (increment) {
      const [, key, op, amount] = increment;
      const value = parseValue(amount, next);
      next[key] = Number(next[key] || 0) + (op === "+" ? Number(value) : -Number(value));
      continue;
    }
    const assign = part.match(/^([a-zA-Z_][\w-]*)\s*=\s*(.+)$/);
    if (assign) {
      const [, key, raw] = assign;
      next[key] = parseValue(raw, next);
    }
  }
  return next;
}

function expressionLooksSafe(expression?: string) {
  if (!expression?.trim()) return true;
  return /^[\w\s"'=.!<>+\-;(),]+$/.test(expression);
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
    if ((scene.transition.type === "choices" || scene.transition.type === "random" || scene.transition.type === "encounter") && links.length === 0) {
      issues.push({
        code: "empty-choices",
        sceneId: scene.id,
        message: `"${scene.title}" has ${scene.transition.type} mode enabled but no destinations.`,
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
    if (scene.transition.type === "random" || scene.transition.type === "encounter") {
      const entries = scene.transition.type === "random" ? scene.transition.options : scene.transition.table;
      for (const entry of entries) {
        if (!expressionLooksSafe(entry.effects)) {
          issues.push({
            code: "unsafe-expression",
            sceneId: scene.id,
            message: `"${scene.title}" has a random/encounter effect with unsupported characters.`,
            severity: "warning",
          });
        }
      }
    }
    if (!expressionLooksSafe(scene.bonusCondition)) {
      issues.push({
        code: "unsafe-expression",
        sceneId: scene.id,
        message: `"${scene.title}" has a bonus condition with unsupported characters.`,
        severity: "warning",
      });
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
