"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createBlankStory } from "@/lib/story";
import { saveStory } from "@/lib/storage";

export function CreateStoryButton() {
  const router = useRouter();
  async function create() {
    const story = await saveStory(createBlankStory());
    router.push(`/editor/${story.id}`);
  }
  return <button className="button button-primary" onClick={create}><Plus size={18} /> Create a story</button>;
}

