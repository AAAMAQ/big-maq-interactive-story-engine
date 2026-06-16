"use client";

import { useState } from "react";
import { BookOpenText, KeyRound, Share2, X } from "lucide-react";
import { createStoryShareExport, downloadJson, storyFilename } from "@/lib/download";
import { getOrCreateStoryPasscode } from "@/lib/storage";
import { StoryDocument } from "@/lib/story";

type Props = {
  story: StoryDocument;
  onClose: () => void;
};

export function ShareStoryDialog({ story, onClose }: Props) {
  const [message, setMessage] = useState("");

  async function exportStory(mode: "view-only" | "editable") {
    const passcode = mode === "editable" ? await getOrCreateStoryPasscode(story) : undefined;
    const shared = await createStoryShareExport(story, mode, passcode);
    downloadJson(storyFilename(story), shared);
    setMessage(
      mode === "editable"
        ? `Read and Modify file downloaded. Share this password separately with trusted collaborators: ${passcode}`
        : "Read Only file downloaded. The recipient can read it in Reader but cannot edit it in this app.",
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <section className="card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Sharing permissions</p>
            <h2 id="share-title" className="mt-1 text-2xl font-black text-indigo-950">Share {story.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Choose exactly what the recipient can do with the exported story file.</p>
          </div>
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} aria-label="Close sharing popup"><X size={20} /></button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button className="rounded-2xl border-2 border-indigo-100 p-5 text-left transition hover:border-indigo-500 hover:bg-indigo-50" onClick={() => exportStory("view-only")}>
            <BookOpenText className="text-indigo-600" size={28} />
            <h3 className="mt-3 text-xl font-black text-indigo-950">Option 1: Read Only</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Best for finished stories, classroom reading, playtesting without editing, or sending a story to someone who should only experience it.</p>
            <h4 className="mt-4 text-sm font-black text-emerald-700">The recipient can:</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Read the story</li>
              <li>Navigate chapters/pages</li>
              <li>Use reader features</li>
            </ul>
            <h4 className="mt-4 text-sm font-black text-red-700">The recipient cannot:</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Edit</li>
              <li>Modify</li>
              <li>Delete</li>
              <li>Reshare with modification permissions</li>
            </ul>
          </button>

          <button className="rounded-2xl border-2 border-indigo-100 p-5 text-left transition hover:border-indigo-500 hover:bg-indigo-50" onClick={() => exportStory("editable")}>
            <KeyRound className="text-indigo-600" size={28} />
            <h3 className="mt-3 text-xl font-black text-indigo-950">Option 2: Read and Modify</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Best for trusted collaborators, co-writers, teachers reviewing student work, or continuing a story on another device.</p>
            <h4 className="mt-4 text-sm font-black text-emerald-700">The recipient can:</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Read the story</li>
              <li>Edit the story</li>
              <li>Modify content</li>
              <li>Continue writing</li>
              <li>Save changes</li>
            </ul>
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">A password is required to unlock editing. Share the story file and password separately.</p>
          </button>
        </div>

        {message && <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-900"><Share2 className="mr-2 inline" size={16} />{message}</p>}
      </section>
    </div>
  );
}
