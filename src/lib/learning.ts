import { z } from "zod";
import { storySchema } from "@/lib/story";

export type TutorialLevel = "Beginner" | "Intermediate" | "Advanced" | "AI-Assisted";

export type TutorialModule = {
  id: string;
  title: string;
  level: TutorialLevel;
  minutes: string;
  description: string;
  steps: string[];
};

export const tutorialModules: TutorialModule[] = [
  {
    id: "navigation-basics",
    title: "Navigation Basics",
    level: "Beginner",
    minutes: "3 min",
    description: "Learn what Reader, Library, Editor, Help, and Settings do.",
    steps: ["Open the top navigation.", "Visit Reader.", "Visit Library.", "Return to Settings and mark the module complete."],
  },
  {
    id: "reader-basics",
    title: "Reader Basics",
    level: "Beginner",
    minutes: "4 min",
    description: "Learn how to choose a story, follow choices, restart, and read shared stories.",
    steps: ["Open Reader.", "Choose a story.", "Click one choice.", "Restart the story."],
  },
  {
    id: "library-basics",
    title: "Library Basics",
    level: "Beginner",
    minutes: "4 min",
    description: "Learn which stories appear in Library and what Read, Edit, Duplicate, Password, and Share do.",
    steps: ["Open Library.", "Find an editable story.", "Review each available action.", "Open Settings again."],
  },
  {
    id: "first-story",
    title: "Creating Your First Story",
    level: "Beginner",
    minutes: "8 min",
    description: "Create a title, description, first scene, and save your project.",
    steps: ["Click Create story.", "Enter a title.", "Enter scene content.", "Press Save."],
  },
  {
    id: "editing-stories",
    title: "Editing Stories",
    level: "Beginner",
    minutes: "6 min",
    description: "Practice editing text, changing colors, and using undo/redo.",
    steps: ["Open an editable story.", "Select a scene.", "Edit the body text.", "Use Undo and Redo."],
  },
  {
    id: "chapters",
    title: "Chapters",
    level: "Intermediate",
    minutes: "5 min",
    description: "Organize scenes into chapters for longer projects.",
    steps: ["Select a scene.", "Add a chapter name.", "Repeat for related scenes.", "Search by chapter."],
  },
  {
    id: "pages",
    title: "Pages and Scenes",
    level: "Intermediate",
    minutes: "5 min",
    description: "Understand how pages are represented as scenes on the visual canvas.",
    steps: ["Add a scene.", "Write page content.", "Connect it with Continue or Choices.", "Save."],
  },
  {
    id: "story-structure",
    title: "Story Structure",
    level: "Intermediate",
    minutes: "7 min",
    description: "Plan starts, middles, endings, and merged paths.",
    steps: ["Identify the start.", "Create two middle scenes.", "Create at least one ending.", "Run verification."],
  },
  {
    id: "sharing-stories",
    title: "Sharing Stories",
    level: "Intermediate",
    minutes: "6 min",
    description: "Share stories as Read Only or Read and Modify.",
    steps: ["Open Share.", "Compare the two permission options.", "Export a Read Only file.", "Review Password Protection for editable sharing."],
  },
  {
    id: "importing",
    title: "Importing",
    level: "Intermediate",
    minutes: "4 min",
    description: "Import story JSON files and understand validation feedback.",
    steps: ["Click Import story.", "Select a .story.json file.", "Enter a password if required.", "Open the imported story."],
  },
  {
    id: "exporting",
    title: "Exporting",
    level: "Intermediate",
    minutes: "5 min",
    description: "Export JSON, HTML, and story maps.",
    steps: ["Open Editor.", "Check verification.", "Export JSON.", "Export HTML or Map."],
  },
  {
    id: "branching-narratives",
    title: "Branching Narratives",
    level: "Advanced",
    minutes: "10 min",
    description: "Build one choice with two branches, endings, and a clean story flow.",
    steps: ["Set a scene to Choices.", "Create Branch A.", "Create Branch B.", "Connect both to endings."],
  },
  {
    id: "multiple-endings",
    title: "Multiple Endings",
    level: "Advanced",
    minutes: "8 min",
    description: "Design good, bad, secret, and neutral endings.",
    steps: ["Create three ending scenes.", "Route choices to each ending.", "Playtest each path.", "Run verification."],
  },
  {
    id: "narrative-design",
    title: "Narrative Design",
    level: "Advanced",
    minutes: "8 min",
    description: "Make choices meaningful and readable.",
    steps: ["Write a decision point.", "Give each option a consequence.", "Avoid fake choices.", "Review path balance."],
  },
  {
    id: "collaboration-workflows",
    title: "Collaboration Workflows",
    level: "Advanced",
    minutes: "6 min",
    description: "Use Read and Modify sharing with Password Protection.",
    steps: ["Export a Read and Modify story.", "Share the file.", "Share the password separately.", "Import and unlock editing."],
  },
  {
    id: "large-story-management",
    title: "Large Story Management",
    level: "Advanced",
    minutes: "9 min",
    description: "Use chapters, tags, search, analytics, and layout to manage large stories.",
    steps: ["Tag scenes.", "Use chapters.", "Search for a branch.", "Run Analytics and Auto-layout."],
  },
  {
    id: "ai-basics",
    title: "AI Basics",
    level: "AI-Assisted",
    minutes: "5 min",
    description: "Use any AI assistant to draft a Story Engine-compatible JSON file.",
    steps: ["Open Let AI Build Your Story.", "Copy the generated prompt.", "Paste it into an AI assistant.", "Ask for JSON only."],
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering",
    level: "AI-Assisted",
    minutes: "6 min",
    description: "Describe genre, tone, branches, endings, and constraints clearly.",
    steps: ["Choose a genre.", "Describe the protagonist.", "Request choices and endings.", "Ask the AI to validate references."],
  },
  {
    id: "ai-branching-stories",
    title: "Generating Branching Stories",
    level: "AI-Assisted",
    minutes: "7 min",
    description: "Ask AI to create connected branches, hidden routes, and multiple endings.",
    steps: ["Use the Advanced Prompt.", "Request at least two branches.", "Request endings for every path.", "Import the JSON."],
  },
  {
    id: "ai-password-stories",
    title: "Generating Password-Protected Stories",
    level: "AI-Assisted",
    minutes: "7 min",
    description: "Ask AI for story access metadata that follows Password Protection rules.",
    steps: ["Choose Read Only, Edit Password, or Owner Password.", "Ask AI to include access metadata.", "Import and test the password flow.", "Regenerate if validation fails."],
  },
  {
    id: "ai-importing",
    title: "Importing AI Stories",
    level: "AI-Assisted",
    minutes: "5 min",
    description: "Take AI JSON output and import it safely.",
    steps: ["Save the AI output as .story.json.", "Open Import story.", "Select the file.", "Fix errors by asking AI for JSON-only valid output."],
  },
  {
    id: "ai-troubleshooting",
    title: "Troubleshooting AI Stories",
    level: "AI-Assisted",
    minutes: "7 min",
    description: "Fix invalid JSON, missing endings, broken references, and password metadata errors.",
    steps: ["Read the import error.", "Ask AI to validate all IDs.", "Ask AI to ensure every path reaches an ending.", "Re-import the corrected JSON."],
  },
];

export function storySchemaJson() {
  return z.toJSONSchema(storySchema);
}

export function buildAiStoryPrompt(mode: "standard" | "advanced" = "standard") {
  const schema = JSON.stringify(storySchemaJson(), null, 2);
  const advanced = mode === "advanced";
  return `You are generating an interactive story for Big MAQ Story Engine.

Return VALID JSON ONLY. Do not wrap the JSON in Markdown. Do not include explanations outside the JSON.

Use this exact JSON Schema generated from the current application story schema:
${schema}

Required story rules:
1. format must be "big-maq-story".
2. version must be 1.
3. Every scene id must be unique.
4. startSceneId must match an existing scene id.
5. Every choice targetSceneId and continue targetSceneId must match an existing scene id.
6. Every reachable path must eventually reach an ending.
7. Avoid placeholder text. Write complete, readable story content.
8. Include meaningful choices with clear consequences.
9. Use chapter and tags where useful.
10. Use variables only when they improve the story.
11. If password protection is requested, include access metadata that explains the intended permission model.

Password Protection model:
- Read Only Password: the reader can read but cannot edit.
- Edit Password: the reader can read and modify when the password is accepted by the app.
- Owner Password: full access for the story owner.
- For app-generated encrypted verifiers, the Story Engine creates PBKDF2 password metadata during sharing. If you cannot generate valid encrypted verifier fields, leave password verifier fields absent and clearly set the access mode requested by the user.

User can ask for examples like:
- Create a fantasy adventure about a young mage trying to save a kingdom.
- Create a detective mystery with multiple suspects and five endings.
- Create a science fiction survival story on a damaged spaceship.
- Create a romance visual novel with branching relationships.

${advanced ? `Advanced requirements:
- Create complex branching with hidden routes.
- Include multiple endings.
- Use variables for inventory, character relationships, trust, score, or flags.
- Include replayability and optional bonus text.
- Include long-form worldbuilding.
- Include at least one merged branch and one secret/conditional path.
- Validate all references before returning JSON.
- Include password-protection intent if requested by the user.
` : `Standard requirements:
- Keep the story manageable for a first import.
- Use clear scenes, choices, and endings.
- Validate all references before returning JSON.
`}

Now ask me for the story idea if I have not provided one. If I have provided one, generate the complete Story Engine JSON.`;
}
