"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpenText, FileText, ImageOff, RotateCcw, ShieldAlert, Upload } from "lucide-react";
import { demoStory, fanDemoDisclaimer } from "@/lib/demo";
import { readStoryFile } from "@/lib/download";
import { getStory, isSharedStory, listVisibleStories, saveStory, seedDemoStory } from "@/lib/storage";
import { applyEffects, evaluateCondition, resolveSceneTransition, Scene, StoryDocument } from "@/lib/story";

export function StoryReader() {
  const params = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const [story, setStory] = useState<StoryDocument | undefined>(() => params.get("demo") ? demoStory : undefined);
  const [sceneId, setSceneId] = useState(() => params.get("demo") ? demoStory.startSceneId : "");
  const [imagesAllowed, setImagesAllowed] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [variables, setVariables] = useState<StoryDocument["variables"]>(() => params.get("demo") ? demoStory.variables || {} : {});
  const [path, setPath] = useState<string[]>(() => params.get("demo") ? [demoStory.startSceneId] : []);
  const [error, setError] = useState("");
  const [stories, setStories] = useState<StoryDocument[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function refreshStories() {
    const next = await listVisibleStories();
    setStories(next);
    setLoaded(true);
    return next;
  }

  function openStory(next: StoryDocument) {
    setStory(next);
    setSceneId(next.startSceneId);
    setVariables(next.variables || {});
    setPath([next.startSceneId]);
    setImagesAllowed(false);
    setBonusOpen(false);
    setError("");
  }

  useEffect(() => {
    seedDemoStory().then(refreshStories);
  }, []);

  useEffect(() => {
    const storyId = params.get("storyId");
    if (!storyId) return;
    getStory(storyId).then((saved) => {
      if (!saved) return;
      openStory(saved);
    });
  }, [params]);

  async function importFile(file?: File) {
    if (!file) return;
    try {
      const imported = await readStoryFile(file);
      const saved = await saveStory(imported);
      await refreshStories();
      openStory(saved);
    } catch {
      setError("That file is not a valid Big MAQ story.");
    }
  }
  function move(targetSceneId: string, effects?: string) {
    setVariables((current) => applyEffects(effects, current, story));
    setSceneId(targetSceneId);
    setPath((current) => [...current, targetSceneId]);
    setBonusOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() {
    if (!story) return;
    setVariables(story.variables || {});
    setPath([story.startSceneId]);
    setSceneId(story.startSceneId);
    setBonusOpen(false);
  }

  const ownStories = stories.filter((item) => !isSharedStory(item));
  const sharedStories = stories.filter((item) => isSharedStory(item));

  if (!story) return (
    <main className="shell py-12">
      <section className="rounded-[2rem] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8 text-center ring-1 ring-indigo-100">
        <BookOpenText className="mx-auto text-indigo-600" size={52} />
        <h1 className="mt-4 text-4xl font-black text-indigo-950">Reader</h1>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">The Reader is the central place for viewing every story available on this device: your own stories and stories shared with you by others.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="button button-primary" onClick={() => input.current?.click()}><Upload size={17} /> Import story</button>
          <button className="button button-secondary" onClick={() => openStory(demoStory)}>Play fan demo</button>
        </div>
        <input hidden ref={input} type="file" accept=".json,.story.json,application/json" onChange={(event) => importFile(event.target.files?.[0])} />
        {error && <p className="mt-4 text-sm font-bold text-red-700">{error}</p>}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Readable stories</p>
            <h2 className="mt-2 text-3xl font-black text-indigo-950">Choose a story to read</h2>
          </div>
          {!loaded && <p className="muted">Opening local reader shelf...</p>}
        </div>
        <ReaderShelf title="Your Stories" description="Stories created in this browser or bundled as local examples." stories={ownStories} openStory={openStory} />
        <ReaderShelf title="Shared Stories" description="Stories imported from someone else. Read Only files stay here; Read and Modify files also appear in Library." stories={sharedStories} openStory={openStory} />
      </section>
    </main>
  );

  const scene = story.scenes.find((item) => item.id === sceneId) as Scene | undefined;
  if (!scene) return <main className="shell py-12"><p className="text-red-700">This story links to a missing scene.</p></main>;
  const isDemo = story.id === demoStory.id;
  const imageSource = scene.localImageDataUrl || scene.imageUrl;
  const audioSource = scene.localAudioDataUrl || scene.audioUrl;
  const availableChoices = scene.transition.type === "choices" ? scene.transition.choices.filter((choice) => evaluateCondition(choice.condition, variables)) : [];
  const bonusAvailable = !!scene.bonusText && evaluateCondition(scene.bonusCondition, variables);
  const randomLabel = scene.transition.type === "random" ? "Roll random result" : scene.transition.type === "encounter" ? "Roll encounter" : "";
  function resolveRandomScene() {
    if (!scene) return;
    const result = resolveSceneTransition(scene);
    if (result) move(result.targetSceneId, result.effects);
  }

  return (
    <main className="shell py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div><p className="eyebrow">Interactive reader</p><h1 className="text-2xl font-black text-indigo-950">{story.title}</h1></div>
          <button className="button button-secondary px-3 py-2 text-sm" onClick={reset}><RotateCcw size={15} /> Restart</button>
        </div>
        {isDemo && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">{fanDemoDisclaimer}</p>}
        <article className="card overflow-hidden">
          {scene.imageUrl && !scene.localImageDataUrl && !imagesAllowed && <div className="flex items-center justify-between gap-3 bg-slate-100 p-4 text-sm text-slate-700"><span className="flex items-center gap-2"><ShieldAlert size={18} /> This scene has a remote image. Loading it contacts a third-party host.</span><button className="button button-secondary px-3 py-2 text-xs" onClick={() => setImagesAllowed(true)}>Load remote images</button></div>}
          {/* Remote story images deliberately bypass Next image optimization and only load after consent. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {imageSource && (scene.localImageDataUrl || imagesAllowed) ? <img className="max-h-80 w-full object-cover" src={imageSource} alt="" /> : imageSource ? <div className="grid h-36 place-items-center bg-slate-100 text-slate-500"><ImageOff /></div> : null}
          <div className="p-7 sm:p-9">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{scene.transition.type === "ending" ? "Ending" : "Scene"}</p>
            <h2 className="mt-2 text-3xl font-black text-indigo-950">{scene.title}</h2>
            <p className="mt-2 text-xs font-bold text-slate-400">Path length: {path.length}</p>
            {audioSource && <audio className="mt-4 w-full" src={audioSource} controls />}
            <p className="mt-5 whitespace-pre-wrap text-lg leading-8 text-slate-700">{scene.body}</p>
            {bonusAvailable && <div className="mt-6"><button className="button button-secondary text-sm" onClick={() => setBonusOpen(!bonusOpen)}>{bonusOpen ? "Hide" : "Reveal"} bonus text</button>{bonusOpen && <p className="mt-3 rounded-xl bg-violet-50 p-4 text-sm leading-6 text-violet-900">{scene.bonusText}</p>}</div>}
            <div className="mt-8 grid gap-3">
              {scene.transition.type === "choices" && availableChoices.map((choice) => <button className="button button-primary justify-between" key={choice.id} onClick={() => move(choice.targetSceneId, choice.effects)}>{choice.label}<span>→</span></button>)}
              {scene.transition.type === "choices" && !availableChoices.length && <p className="rounded-xl bg-amber-50 p-4 text-center font-bold text-amber-800">No choices are currently available for these variables.</p>}
              {scene.transition.type === "continue" && <button className="button button-primary" onClick={() => move(scene.transition.type === "continue" ? scene.transition.targetSceneId : scene.id)}>Continue <span>→</span></button>}
              {(scene.transition.type === "random" || scene.transition.type === "encounter") && <button className="button button-primary justify-between" onClick={resolveRandomScene}>{randomLabel}<span>→</span></button>}
              {scene.transition.type === "ending" && <p className="rounded-xl bg-emerald-50 p-4 text-center font-bold text-emerald-800">You reached an ending.</p>}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

function ReaderShelf({ title, description, stories, openStory }: { title: string; description: string; stories: StoryDocument[]; openStory: (story: StoryDocument) => void }) {
  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-2xl font-black text-indigo-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        {!stories.length ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
            <FileText className="mb-2 text-slate-400" size={24} />
            No stories in this category yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {stories.map((item) => (
              <article className="rounded-2xl border border-slate-200 p-4" key={item.id}>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{item.scenes.length} scenes</p>
                <h4 className="mt-2 text-lg font-black text-indigo-950">{item.title}</h4>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.description || "A branching story."}</p>
                {item.access?.mode === "view-only" && <p className="mt-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">Read Only</p>}
                {item.access?.mode === "editable" && <p className="mt-3 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Read and Modify</p>}
                <button className="button button-primary mt-4 w-full px-3 py-2 text-sm" onClick={() => openStory(item)}><BookOpenText size={15} /> Read</button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
