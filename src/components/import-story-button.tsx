"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { canEditSharedStory, readStoryFile } from "@/lib/download";
import { saveStory } from "@/lib/storage";

export function ImportStoryButton({ className = "" }: { className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [error, setError] = useState("");

  async function importFile(file?: File) {
    if (!file) return;
    try {
      const story = await readStoryFile(file);
      if (story.access?.mode === "editable" && story.access.passcodeProtected) {
        const passcode = prompt("This editable story is protected. Enter the edit passcode:");
        if (!passcode || !(await canEditSharedStory(story, passcode))) {
          setError("That passcode does not unlock editing for this story.");
          return;
        }
      }
      await saveStory(story);
      router.push(story.access?.mode === "view-only" ? `/reader?storyId=${story.id}` : `/editor/${story.id}`);
    } catch {
      setError("That file is not a valid Big MAQ story.");
    }
  }

  return (
    <>
      <button className={`button button-secondary ${className}`} onClick={() => input.current?.click()}>
        <Upload size={17} /> Import story
      </button>
      <input ref={input} hidden type="file" accept=".json,.story.json,application/json" onChange={(event) => importFile(event.target.files?.[0])} />
      {error && <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
    </>
  );
}
