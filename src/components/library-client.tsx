"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenText, Copy, FileText, KeyRound, Pencil, Share2 } from "lucide-react";
import { CreateStoryButton } from "@/components/create-story-button";
import { ImportStoryButton } from "@/components/import-story-button";
import { ShareStoryDialog } from "@/components/share-story-dialog";
import { downloadJson } from "@/lib/download";
import { getOrCreateStoryPasscode, listLibraryStories, saveStory, seedDemoStory } from "@/lib/storage";
import { cloneStory, StoryDocument } from "@/lib/story";

export function LibraryClient() {
  const [stories, setStories] = useState<StoryDocument[]>([]);
  const [sharingStory, setSharingStory] = useState<StoryDocument>();
  const [loaded, setLoaded] = useState(false);
  async function refresh() {
    setStories(await listLibraryStories());
    setLoaded(true);
  }
  useEffect(() => {
    seedDemoStory().then(listLibraryStories).then((next) => {
      setStories(next);
      setLoaded(true);
    });
  }, []);

  async function duplicate(story: StoryDocument) {
    await saveStory(cloneStory(story));
    await refresh();
  }
  async function exportPassword(story: StoryDocument) {
    const passcode = await getOrCreateStoryPasscode(story);
    downloadJson(`${story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "story"}-password.json`, {
      exportedAt: new Date().toISOString(),
      storyId: story.id,
      title: story.title,
      password: passcode,
      note: "Keep this private. This password unlocks Read and Modify shared story files for this story.",
    });
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-3">
        <CreateStoryButton />
        <ImportStoryButton />
      </div>
      {!loaded ? <p className="mt-8 muted">Opening your local library...</p> : !stories.length ? (
        <div className="card mt-8 p-10 text-center">
          <FileText className="mx-auto text-indigo-500" size={42} />
          <h2 className="mt-4 text-xl font-black text-indigo-950">Your library is empty</h2>
          <p className="mt-2 muted">Create your first branching adventure or import a story file.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => (
            <article className="card p-5" key={story.id}>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{story.scenes.length} scenes</p>
              <h2 className="mt-2 text-xl font-black text-indigo-950">{story.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{story.description || "A branching story."}</p>
              <p className="mt-3 text-xs text-slate-500">Updated {new Date(story.updatedAt).toLocaleString()}</p>
              {story.access?.mode === "editable" && <p className="mt-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Editable shared file</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                <Link className="button button-secondary px-3 py-2 text-sm" href={`/reader?storyId=${story.id}`}><BookOpenText size={15} /> Read</Link>
                <Link className="button button-primary px-3 py-2 text-sm" href={`/editor/${story.id}`}><Pencil size={15} /> Edit</Link>
                <button className="button button-secondary px-3 py-2 text-sm" onClick={() => duplicate(story)}><Copy size={15} /> Duplicate</button>
                <button className="button button-secondary px-3 py-2 text-sm" onClick={() => exportPassword(story)}><KeyRound size={15} /> Password</button>
                <button className="button button-secondary px-3 py-2 text-sm" onClick={() => setSharingStory(story)}><Share2 size={15} /> Share</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {sharingStory && <ShareStoryDialog story={sharingStory} onClose={() => setSharingStory(undefined)} />}
    </section>
  );
}
