"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenText, Copy, Download, Eraser, FileText, KeyRound, Pencil, Trash2 } from "lucide-react";
import { CreateStoryButton } from "@/components/create-story-button";
import { ImportStoryButton } from "@/components/import-story-button";
import { createStoryShareExport, downloadJson, storyFilename } from "@/lib/download";
import { clearStories, deleteStory, getOrCreateStoryPasscode, listStories, listStoryPasscodes, saveStory, seedDemoStory } from "@/lib/storage";
import { cloneStory, StoryDocument } from "@/lib/story";

export function LibraryClient() {
  const [stories, setStories] = useState<StoryDocument[]>([]);
  const [loaded, setLoaded] = useState(false);
  async function refresh() {
    setStories(await listStories());
    setLoaded(true);
  }
  useEffect(() => {
    seedDemoStory().then(listStories).then((next) => {
      setStories(next);
      setLoaded(true);
    });
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this local story?")) return;
    await deleteStory(id);
    await refresh();
  }
  async function duplicate(story: StoryDocument) {
    await saveStory(cloneStory(story));
    await refresh();
  }
  async function clear() {
    if (!confirm("Clear every local story from this browser? Export backups first if needed.")) return;
    await clearStories();
    await refresh();
  }
  async function exportStory(story: StoryDocument, mode: "view-only" | "editable") {
    const passcode = mode === "editable" ? await getOrCreateStoryPasscode(story) : undefined;
    const shared = await createStoryShareExport(story, mode, passcode);
    downloadJson(storyFilename(story), shared);
    if (mode === "editable") {
      alert(`Editable export created. Share this passcode separately with trusted editors: ${passcode}`);
    }
  }
  async function exportPasscodes() {
    const passcodes = await listStoryPasscodes();
    downloadJson("big-maq-story-edit-passcodes.json", {
      exportedAt: new Date().toISOString(),
      note: "Keep this file private. These passcodes unlock editable shared story files.",
      passcodes,
    });
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-3">
        <CreateStoryButton />
        <ImportStoryButton />
        {!!stories.length && <button className="button button-secondary" onClick={() => downloadJson("big-maq-story-library.json", stories)}><Download size={17} /> Export all</button>}
        {!!stories.length && <button className="button button-secondary" onClick={exportPasscodes}><KeyRound size={17} /> Export passcodes</button>}
        {!!stories.length && <button className="button button-danger" onClick={clear}><Eraser size={17} /> Clear local data</button>}
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
              {story.access?.mode === "view-only" && <p className="mt-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">View-only shared file</p>}
              {story.access?.mode === "editable" && <p className="mt-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Editable shared file</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                <Link className="button button-secondary px-3 py-2 text-sm" href={`/reader?storyId=${story.id}`}><BookOpenText size={15} /> Read</Link>
                {story.access?.mode !== "view-only" && <Link className="button button-primary px-3 py-2 text-sm" href={`/editor/${story.id}`}><Pencil size={15} /> Edit</Link>}
                <button className="button button-secondary px-3 py-2 text-sm" onClick={() => exportStory(story, "view-only")}><Download size={15} /> View JSON</button>
                {story.access?.mode !== "view-only" && <button className="button button-secondary px-3 py-2 text-sm" onClick={() => exportStory(story, "editable")}><KeyRound size={15} /> Edit JSON</button>}
                <button className="button button-secondary px-3 py-2 text-sm" onClick={() => duplicate(story)}><Copy size={15} /></button>
                <button className="button button-danger px-3 py-2 text-sm" onClick={() => remove(story.id)}><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
