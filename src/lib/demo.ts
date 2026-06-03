import { StoryDocument } from "@/lib/story";

export const demoStory: StoryDocument = {
  format: "big-maq-story",
  version: 1,
  id: "demo-pallet-paths",
  title: "Pallet Paths: A Trainer's First Choice",
  author: "Big MAQ Studio",
  description:
    "An unofficial fan-made educational demo inspired by the original C++ branching engine.",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  startSceneId: "demo-start",
  scenes: [
    {
      id: "demo-start",
      title: "A New Morning",
      body: "A young trainer wakes in Pallet Town on the morning of a first journey. Professor Oak is waiting at the lab. Do you rush ahead or take a moment to prepare?",
      bonusText: "This scene demonstrates optional bonus text carried over from the C++ engine.",
      color: "#2563eb",
      position: { x: 80, y: 120 },
      transition: {
        type: "choices",
        choices: [
          { id: "demo-choice-rush", label: "Rush to the lab", targetSceneId: "demo-lab" },
          { id: "demo-choice-prepare", label: "Pack carefully first", targetSceneId: "demo-pack" },
        ],
      },
    },
    {
      id: "demo-pack",
      title: "Prepared",
      body: "You pack a notebook, a snack, and a map. It takes a few extra minutes, but you feel ready for whatever the road brings.",
      color: "#7c3aed",
      position: { x: 80, y: 340 },
      transition: { type: "continue", targetSceneId: "demo-lab" },
    },
    {
      id: "demo-lab",
      title: "Professor Oak's Lab",
      body: "At the lab, Professor Oak offers an important lesson: a great trainer chooses a partner with patience and respect. Which path feels right?",
      color: "#ea580c",
      position: { x: 390, y: 210 },
      transition: {
        type: "choices",
        choices: [
          { id: "demo-choice-bold", label: "Choose the bold path", targetSceneId: "demo-road" },
          { id: "demo-choice-think", label: "Ask one more question", targetSceneId: "demo-advice" },
        ],
      },
    },
    {
      id: "demo-advice",
      title: "A Useful Lesson",
      body: "Oak smiles and explains that curiosity is a strength. Good questions help you understand your choices.",
      color: "#0891b2",
      position: { x: 690, y: 360 },
      transition: { type: "continue", targetSceneId: "demo-road" },
    },
    {
      id: "demo-road",
      title: "The Road Ahead",
      body: "With a new partner beside you, the road stretches toward the horizon. Every choice will shape the adventure.",
      color: "#16a34a",
      position: { x: 760, y: 160 },
      transition: { type: "ending" },
    },
  ],
};

export const fanDemoDisclaimer =
  "Unofficial fan-made educational demonstration. Not affiliated with or endorsed by Nintendo, Game Freak, Creatures, or The Pokémon Company. No official artwork is used.";

