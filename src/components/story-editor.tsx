"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dagre from "@dagrejs/dagre";
import {
  addEdge, Background, Connection, Controls, Edge, Handle, MiniMap, Node, NodeProps,
  Position, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState,
} from "@xyflow/react";
import {
  AlertTriangle, BarChart3, BookOpenText, Download, FileClock, FileImage, FileText, LayoutDashboard,
  Lightbulb, Plus, Redo2, Save, Search, Share2, Trash2, Undo2, Upload,
} from "lucide-react";
import { analyzeStory } from "@/lib/analytics";
import { createStoryShareExport, downloadJson, storyFilename } from "@/lib/download";
import { storyToHtml, storyToSvg } from "@/lib/exports";
import { useOfflineStatus } from "@/lib/offline";
import { getOrCreateStoryPasscode, getStory, listBackups, restoreBackup, saveStory } from "@/lib/storage";
import { applyEffects, evaluateCondition, newId, Scene, StoryDocument, VerificationIssue, verifyStory } from "@/lib/story";

type SceneNode = Node<{ scene: Scene; isStart: boolean; hasWarning: boolean; dimmed: boolean }, "scene">;
type BackupRecord = { id: string; createdAt: string; story: StoryDocument };
type TabName = "inspect" | "analytics" | "playtest" | "learn";

const nodeTypes = { scene: SceneCard };
const palette = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2"];

function SceneCard({ data, selected }: NodeProps<SceneNode>) {
  return (
    <div
      className={`min-w-48 rounded-xl border-2 bg-white p-3 shadow-lg transition ${selected ? "ring-4 ring-indigo-200" : ""} ${data.dimmed ? "opacity-25" : ""}`}
      style={{ borderColor: data.scene.color }}
      aria-label={`${data.scene.title} ${data.isStart ? "start scene" : data.scene.transition.type}`}
    >
      <Handle type="target" position={Position.Left} />
      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: data.scene.color }}>
        {data.isStart ? "Start scene" : data.scene.transition.type}
      </p>
      <p className="mt-1 max-w-48 truncate text-sm font-black text-slate-800">{data.scene.title}</p>
      <p className="mt-1 max-w-48 truncate text-xs text-slate-500">{data.scene.body || "Empty scene"}</p>
      <p className="mt-2 text-[10px] font-bold text-slate-400">{[data.scene.chapter, ...(data.scene.tags || [])].filter(Boolean).join(" • ")}</p>
      {data.hasWarning && <AlertTriangle className="mt-2 text-amber-600" size={15} />}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function toEdges(story: StoryDocument, playPath: string[]): Edge[] {
  return story.scenes.flatMap((scene) => {
    if (scene.transition.type === "ending") return [];
    const links = scene.transition.type === "continue"
      ? [{ id: `${scene.id}-continue`, label: "Continue", targetSceneId: scene.transition.targetSceneId }]
      : scene.transition.choices;
    return links.map((choice) => {
      const active = playPath.includes(scene.id) && playPath.includes(choice.targetSceneId);
      return {
        id: `${scene.id}-${choice.id}`,
        source: scene.id,
        target: choice.targetSceneId,
        label: choice.label,
        animated: active,
        style: { stroke: active ? "#16a34a" : scene.color, strokeWidth: active ? 4 : 2 },
      };
    });
  });
}

function toNodes(story: StoryDocument, issues: VerificationIssue[], query: string): SceneNode[] {
  const q = query.trim().toLowerCase();
  return story.scenes.map((scene) => {
    const matches = !q || [scene.title, scene.body, scene.chapter, ...(scene.tags || [])].join(" ").toLowerCase().includes(q);
    return {
      id: scene.id,
      type: "scene",
      position: scene.position,
      data: {
        scene,
        isStart: scene.id === story.startSceneId,
        hasWarning: issues.some((issue) => issue.sceneId === scene.id),
        dimmed: !matches,
      },
    };
  });
}

function downloadText(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function readDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function EditorInner({ storyId }: { storyId: string }) {
  const router = useRouter();
  const [story, setStory] = useState<StoryDocument>();
  const [selectedId, setSelectedId] = useState("");
  const [saveState, setSaveState] = useState("Loading...");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabName>("inspect");
  const [history, setHistory] = useState<StoryDocument[]>([]);
  const [future, setFuture] = useState<StoryDocument[]>([]);
  const [playSceneId, setPlaySceneId] = useState("");
  const [playVariables, setPlayVariables] = useState<StoryDocument["variables"]>({});
  const [playPath, setPlayPath] = useState<string[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { offline, updateReady } = useOfflineStatus();
  const issues = useMemo(() => story ? verifyStory(story) : [], [story]);
  const analytics = useMemo(() => story ? analyzeStory(story) : undefined, [story]);
  const selected = story?.scenes.find((scene) => scene.id === selectedId) || story?.scenes[0];
  const [nodes, setNodes, onNodesChange] = useNodesState<SceneNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    getStory(storyId).then((loaded) => {
      if (!loaded) return router.push("/library");
      setStory(loaded);
      setSelectedId(loaded.startSceneId);
      setPlaySceneId(loaded.startSceneId);
      setPlayPath([loaded.startSceneId]);
      setNodes(toNodes(loaded, verifyStory(loaded), ""));
      setEdges(toEdges(loaded, []));
      setSaveState("Saved locally");
      listBackups(loaded.id).then(setBackups);
    });
  }, [router, setEdges, setNodes, storyId]);

  const persist = useCallback((next: StoryDocument, captureHistory = true) => {
    setStory((previous) => {
      if (previous && captureHistory) {
        setHistory((items) => [...items.slice(-24), previous]);
        setFuture([]);
      }
      return next;
    });
    setSaveState("Saving...");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const saved = await saveStory(next);
      setStory(saved);
      setSaveState("Saved locally");
      listBackups(saved.id).then(setBackups);
    }, 450);
  }, []);

  useEffect(() => {
    if (!story) return;
    setNodes(toNodes(story, issues, query));
    setEdges(toEdges(story, playPath));
  }, [issues, playPath, query, setEdges, setNodes, story]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function updateStory(patch: Partial<StoryDocument>) {
    if (story) persist({ ...story, ...patch });
  }
  function updateScene(sceneId: string, patch: Partial<Scene>) {
    if (!story) return;
    persist({ ...story, scenes: story.scenes.map((scene) => scene.id === sceneId ? { ...scene, ...patch } : scene) });
  }
  function undo() {
    const previous = history.at(-1);
    if (!story || !previous) return;
    setFuture((items) => [story, ...items].slice(0, 25));
    setHistory((items) => items.slice(0, -1));
    persist(previous, false);
  }
  function redo() {
    const next = future[0];
    if (!story || !next) return;
    setHistory((items) => [...items, story]);
    setFuture((items) => items.slice(1));
    persist(next, false);
  }
  function addScene() {
    if (!story) return;
    const id = newId("scene");
    const scene: Scene = {
      id,
      title: `Scene ${story.scenes.length + 1}`,
      body: "",
      color: palette[story.scenes.length % palette.length],
      position: { x: 240 + story.scenes.length * 30, y: 180 + story.scenes.length * 25 },
      tags: [],
      chapter: selected?.chapter || "",
      transition: { type: "ending" },
    };
    persist({ ...story, scenes: [...story.scenes, scene] });
    setSelectedId(id);
  }
  function removeScene() {
    if (!story || !selected || selected.id === story.startSceneId) return;
    persist({ ...story, scenes: story.scenes.filter((scene) => scene.id !== selected.id) });
    setSelectedId(story.startSceneId);
  }
  function connect(connection: Connection) {
    if (!story || !connection.source || !connection.target) return;
    const source = story.scenes.find((scene) => scene.id === connection.source);
    if (!source) return;
    const choice = { id: newId("choice"), label: "New choice", targetSceneId: connection.target };
    updateScene(source.id, {
      transition: source.transition.type === "choices"
        ? { type: "choices", choices: [...source.transition.choices, choice] }
        : { type: "choices", choices: [choice] },
    });
    setEdges((current) => addEdge(connection, current));
  }
  function autoLayout() {
    if (!story) return;
    const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    graph.setGraph({ rankdir: "LR", ranksep: 110, nodesep: 56 });
    story.scenes.forEach((scene) => graph.setNode(scene.id, { width: 205, height: 95 }));
    toEdges(story, []).forEach((edge) => graph.setEdge(edge.source, edge.target));
    dagre.layout(graph);
    persist({ ...story, scenes: story.scenes.map((scene) => {
      const point = graph.node(scene.id);
      return { ...scene, position: { x: point.x - 100, y: point.y - 50 } };
    }) });
  }
  function syncPositions(nextNodes: SceneNode[]) {
    if (!story) return;
    const positions = new Map(nextNodes.map((node) => [node.id, node.position]));
    persist({ ...story, scenes: story.scenes.map((scene) => ({ ...scene, position: positions.get(scene.id) || scene.position })) });
  }
  async function exportJson() {
    if (!story || issues.some((issue) => issue.severity !== "warning")) return;
    const editable = confirm("Export as editable? Press Cancel to export a view-only story file.");
    const passcode = editable ? await getOrCreateStoryPasscode(story) : undefined;
    const shared = await createStoryShareExport(story, editable ? "editable" : "view-only", passcode);
    downloadJson(storyFilename(story), shared);
    if (editable) {
      alert(`Editable export created. Share this passcode separately with trusted editors: ${passcode}`);
    }
  }
  function exportHtml() {
    if (story) downloadText(`${story.title.replace(/[^a-z0-9]+/gi, "-") || "story"}.html`, storyToHtml(story), "text/html");
  }
  function exportSvg() {
    if (story) downloadText(`${story.title.replace(/[^a-z0-9]+/gi, "-") || "story"}-map.svg`, storyToSvg(story), "image/svg+xml");
  }
  async function shareStory() {
    if (!story) return;
    const text = `Big MAQ story file: ${story.title}`;
    if (navigator.share) await navigator.share({ title: story.title, text, url: window.location.origin });
    else if (navigator.clipboard) await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
  }
  function startPlaytest(sceneId = story?.startSceneId || "") {
    setPlaySceneId(sceneId);
    setPlayVariables(story?.variables || {});
    setPlayPath(sceneId ? [sceneId] : []);
    setActiveTab("playtest");
  }
  function playChoice(target: string, effects?: string) {
    setPlayVariables((vars) => applyEffects(effects, vars));
    setPlaySceneId(target);
    setPlayPath((path) => [...path, target]);
  }
  async function attachMedia(kind: "image" | "audio", file?: File) {
    if (!selected || !file) return;
    const dataUrl = await readDataUrl(file);
    updateScene(selected.id, kind === "image" ? { localImageDataUrl: dataUrl } : { localAudioDataUrl: dataUrl });
  }
  async function restore(backupId: string) {
    const restored = await restoreBackup(backupId);
    if (restored) {
      setStory(restored);
      setSelectedId(restored.startSceneId);
      listBackups(restored.id).then(setBackups);
    }
  }

  if (!story || !selected) return <main className="shell py-10 muted">Opening local story...</main>;
  if (story.access?.mode === "view-only") {
    return (
      <main className="shell py-12">
        <section className="card mx-auto max-w-2xl p-8 text-center">
          <BookOpenText className="mx-auto text-indigo-600" size={42} />
          <h1 className="mt-4 text-3xl font-black text-indigo-950">This story is view-only</h1>
          <p className="mt-3 leading-7 text-slate-600">The shared <code>.story.json</code> file says it can be read but not edited. Open it in Reader, or ask the creator for an editable export and passcode.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button className="button button-primary" onClick={() => router.push(`/reader?storyId=${story.id}`)}>Read story</button>
            <button className="button button-secondary" onClick={() => router.push("/library")}>Back to library</button>
          </div>
        </section>
      </main>
    );
  }
  const playScene = story.scenes.find((scene) => scene.id === playSceneId) || story.scenes.find((scene) => scene.id === story.startSceneId)!;
  const blockingIssues = issues.filter((issue) => issue.severity !== "warning");

  return (
    <main className="grid min-h-[calc(100vh-4rem)] grid-rows-[auto_1fr] bg-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <input className="w-full border-0 bg-transparent text-xl font-black text-indigo-950" value={story.title} onChange={(event) => updateStory({ title: event.target.value })} aria-label="Story title" />
          <p className="text-xs font-semibold text-emerald-700">{saveState}{offline ? " • Offline" : ""}{updateReady ? " • Update ready" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="button button-secondary px-3 py-2 text-sm" disabled={!history.length} onClick={undo}><Undo2 size={15} /> Undo</button>
          <button className="button button-secondary px-3 py-2 text-sm" disabled={!future.length} onClick={redo}><Redo2 size={15} /> Redo</button>
          <button className="button button-secondary px-3 py-2 text-sm" onClick={addScene}><Plus size={15} /> Scene</button>
          <button className="button button-secondary px-3 py-2 text-sm" onClick={autoLayout}><LayoutDashboard size={15} /> Auto-layout</button>
          <button className="button button-secondary px-3 py-2 text-sm" onClick={() => saveStory(story).then((saved) => { setStory(saved); setSaveState("Saved locally"); })}><Save size={15} /> Save</button>
          <button className="button button-primary px-3 py-2 text-sm disabled:opacity-40" disabled={!!blockingIssues.length} onClick={exportJson}><Download size={15} /> JSON</button>
          <button className="button button-secondary px-3 py-2 text-sm" onClick={exportHtml}><FileText size={15} /> HTML</button>
          <button className="button button-secondary px-3 py-2 text-sm" onClick={exportSvg}><FileImage size={15} /> Map</button>
          <button className="button button-secondary px-3 py-2 text-sm" onClick={shareStory}><Share2 size={15} /> Share</button>
        </div>
      </div>
      <div className="grid min-h-0 lg:grid-cols-[1fr_390px]">
        <div className="grid min-h-[70vh] grid-rows-[auto_1fr]">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
            <Search size={16} className="text-slate-500" />
            <input className="input max-w-md py-2" placeholder="Search title, text, tag, or chapter" value={query} onChange={(event) => setQuery(event.target.value)} />
            <button className="button button-secondary px-3 py-2 text-xs" onClick={() => selected && startPlaytest(selected.id)}><BookOpenText size={14} /> Play from selected</button>
          </div>
          <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={(_, node) => setSelectedId(node.id)} onConnect={connect} onNodeDragStop={(_, node) => syncPositions(nodes.map((item) => item.id === node.id ? node as SceneNode : item))} fitView>
            <Background gap={18} size={1} /><Controls /><MiniMap pannable zoomable />
          </ReactFlow>
        </div>
        <aside className="overflow-y-auto border-l border-slate-200 bg-white p-4">
          <div className="grid grid-cols-4 gap-1 text-xs font-black">
            {(["inspect", "analytics", "playtest", "learn"] as TabName[]).map((tab) => <button className={`rounded-lg px-2 py-2 ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </div>
          {activeTab === "inspect" && <Inspector story={story} selected={selected} updateStory={updateStory} updateScene={updateScene} removeScene={removeScene} attachMedia={attachMedia} backups={backups} restore={restore} />}
          {activeTab === "analytics" && analytics && <AnalyticsPanel analytics={analytics} issues={issues} focusScene={setSelectedId} />}
          {activeTab === "playtest" && <PlaytestPanel scene={playScene} story={story} variables={playVariables} path={playPath} start={() => startPlaytest()} move={playChoice} />}
          {activeTab === "learn" && <LearningPanel />}
        </aside>
      </div>
    </main>
  );
}

function Inspector({
  story, selected, updateStory, updateScene, removeScene, attachMedia, backups, restore,
}: {
  story: StoryDocument;
  selected: Scene;
  updateStory: (patch: Partial<StoryDocument>) => void;
  updateScene: (sceneId: string, patch: Partial<Scene>) => void;
  removeScene: () => void;
  attachMedia: (kind: "image" | "audio", file?: File) => void;
  backups: BackupRecord[];
  restore: (backupId: string) => void;
}) {
  return <div className="mt-4 grid gap-3">
    <h2 className="text-lg font-black text-indigo-950">Scene inspector</h2>
    <label className="label">Title<input className="input" value={selected.title} onChange={(event) => updateScene(selected.id, { title: event.target.value })} /></label>
    <label className="label">Story text<textarea className="input min-h-28" value={selected.body} onChange={(event) => updateScene(selected.id, { body: event.target.value })} /></label>
    <label className="label">Tags<input className="input" value={(selected.tags || []).join(", ")} onChange={(event) => updateScene(selected.id, { tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></label>
    <label className="label">Chapter<input className="input" value={selected.chapter || ""} onChange={(event) => updateScene(selected.id, { chapter: event.target.value })} /></label>
    <label className="label">Optional HTTPS image URL<input className="input" value={selected.imageUrl || ""} onChange={(event) => updateScene(selected.id, { imageUrl: event.target.value })} /></label>
    <label className="label">Local image attachment<input className="input" type="file" accept="image/*" onChange={(event) => attachMedia("image", event.target.files?.[0])} /></label>
    <label className="label">Optional HTTPS audio URL<input className="input" value={selected.audioUrl || ""} onChange={(event) => updateScene(selected.id, { audioUrl: event.target.value })} /></label>
    <label className="label">Local audio attachment<input className="input" type="file" accept="audio/*" onChange={(event) => attachMedia("audio", event.target.files?.[0])} /></label>
    <label className="label">Bonus text<textarea className="input min-h-20" value={selected.bonusText || ""} onChange={(event) => updateScene(selected.id, { bonusText: event.target.value })} /></label>
    <label className="label">Node color<input className="h-10 w-full" type="color" value={selected.color} onChange={(event) => updateScene(selected.id, { color: event.target.value })} /></label>
    <label className="label">Story variables<textarea className="input min-h-16" value={JSON.stringify(story.variables || {}, null, 2)} onChange={(event) => {
      try { updateStory({ variables: JSON.parse(event.target.value || "{}") }); } catch {}
    }} /></label>
    <label className="label">Transition<select className="input" value={selected.transition.type} onChange={(event) => {
      const type = event.target.value;
      updateScene(selected.id, { transition: type === "ending" ? { type: "ending" } : type === "continue" ? { type: "continue", targetSceneId: story.startSceneId } : { type: "choices", choices: [] } });
    }}><option value="ending">Ending</option><option value="continue">Continue</option><option value="choices">Choices</option></select></label>
    {selected.transition.type === "continue" && <label className="label">Continue to<select className="input" value={selected.transition.targetSceneId} onChange={(event) => updateScene(selected.id, { transition: { type: "continue", targetSceneId: event.target.value } })}>{story.scenes.map((scene) => <option key={scene.id} value={scene.id}>{scene.title}</option>)}</select></label>}
    {selected.transition.type === "choices" && selected.transition.choices.map((choice, index) => <div className="card grid gap-2 p-3" key={choice.id}>
      <input className="input" value={choice.label} onChange={(event) => updateScene(selected.id, { transition: { type: "choices", choices: selected.transition.type === "choices" ? selected.transition.choices.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) : [] } })} />
      <select className="input" value={choice.targetSceneId} onChange={(event) => updateScene(selected.id, { transition: { type: "choices", choices: selected.transition.type === "choices" ? selected.transition.choices.map((item, itemIndex) => itemIndex === index ? { ...item, targetSceneId: event.target.value } : item) : [] } })}>{story.scenes.map((scene) => <option key={scene.id} value={scene.id}>{scene.title}</option>)}</select>
      <input className="input" placeholder="Condition, e.g. score >= 2" value={choice.condition || ""} onChange={(event) => updateScene(selected.id, { transition: { type: "choices", choices: selected.transition.type === "choices" ? selected.transition.choices.map((item, itemIndex) => itemIndex === index ? { ...item, condition: event.target.value } : item) : [] } })} />
      <input className="input" placeholder="Effects, e.g. score += 1; hasKey = true" value={choice.effects || ""} onChange={(event) => updateScene(selected.id, { transition: { type: "choices", choices: selected.transition.type === "choices" ? selected.transition.choices.map((item, itemIndex) => itemIndex === index ? { ...item, effects: event.target.value } : item) : [] } })} />
      <button className="text-left text-xs font-bold text-red-700" onClick={() => updateScene(selected.id, { transition: { type: "choices", choices: selected.transition.type === "choices" ? selected.transition.choices.filter((_, itemIndex) => itemIndex !== index) : [] } })}>Remove choice</button>
    </div>)}
    {selected.transition.type === "choices" && <button className="button button-secondary text-sm" onClick={() => updateScene(selected.id, { transition: { type: "choices", choices: [...(selected.transition.type === "choices" ? selected.transition.choices : []), { id: newId("choice"), label: "New choice", targetSceneId: story.startSceneId }] } })}><Plus size={15} /> Add choice</button>}
    <button className="button button-secondary text-sm" disabled={selected.id === story.startSceneId} onClick={() => updateStory({ startSceneId: selected.id })}>Make start scene</button>
    <button className="button button-danger text-sm disabled:opacity-40" disabled={selected.id === story.startSceneId} onClick={removeScene}><Trash2 size={15} /> Delete scene</button>
    <section className="border-t border-slate-200 pt-4">
      <h3 className="flex items-center gap-2 font-black text-indigo-950"><FileClock size={17} /> Local backups</h3>
      <div className="mt-2 grid gap-2">{backups.slice(0, 4).map((backup) => <button className="text-left text-xs font-bold text-indigo-700" key={backup.id} onClick={() => restore(backup.id)}>Restore {new Date(backup.createdAt).toLocaleString()}</button>)}</div>
    </section>
  </div>;
}

function AnalyticsPanel({ analytics, issues, focusScene }: { analytics: ReturnType<typeof analyzeStory>; issues: VerificationIssue[]; focusScene: (id: string) => void }) {
  return <div className="mt-4">
    <h2 className="flex items-center gap-2 text-lg font-black text-indigo-950"><BarChart3 size={18} /> Story analytics</h2>
    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">{Object.entries(analytics).map(([key, value]) => <div className="rounded-xl bg-slate-50 p-3" key={key}><p className="text-xs font-black uppercase text-slate-500">{key}</p><p className="text-2xl font-black text-indigo-950">{value}</p></div>)}</div>
    <h3 className="mt-5 font-black text-indigo-950">Verifier</h3>
    {!issues.length ? <p className="mt-2 text-sm font-bold text-emerald-700">No issues found.</p> : <div className="mt-2 grid gap-2">{issues.map((issue, index) => <button className={`rounded-xl p-3 text-left text-xs leading-5 ${issue.severity === "warning" ? "bg-amber-50 text-amber-900" : "bg-red-50 text-red-900"}`} key={`${issue.code}-${index}`} onClick={() => issue.sceneId && focusScene(issue.sceneId)}>{issue.message}</button>)}</div>}
  </div>;
}

function PlaytestPanel({ scene, story, variables, path, start, move }: { scene: Scene; story: StoryDocument; variables: StoryDocument["variables"]; path: string[]; start: () => void; move: (target: string, effects?: string) => void }) {
  const available = scene.transition.type === "choices" ? scene.transition.choices.filter((choice) => evaluateCondition(choice.condition, variables)) : [];
  return <div className="mt-4">
    <h2 className="text-lg font-black text-indigo-950">Playtest preview</h2>
    <p className="mt-2 text-xs font-bold text-slate-500">Path length: {path.length}</p>
    <article className="card mt-3 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{scene.transition.type}</p>
      <h3 className="mt-1 text-xl font-black text-indigo-950">{scene.title}</h3>
      {/* Story-authored images can be local data URLs or remote user URLs, so Next image optimization is intentionally bypassed. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {(scene.localImageDataUrl || scene.imageUrl) && <img className="mt-3 max-h-36 w-full rounded-xl object-cover" src={scene.localImageDataUrl || scene.imageUrl} alt="" />}
      {(scene.localAudioDataUrl || scene.audioUrl) && <audio className="mt-3 w-full" src={scene.localAudioDataUrl || scene.audioUrl} controls />}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{scene.body}</p>
      <div className="mt-4 grid gap-2">
        {scene.transition.type === "choices" && available.map((choice) => <button className="button button-primary justify-between text-sm" key={choice.id} onClick={() => move(choice.targetSceneId, choice.effects)}>{choice.label}<span>→</span></button>)}
        {scene.transition.type === "continue" && <button className="button button-primary text-sm" onClick={() => move(scene.transition.type === "continue" ? scene.transition.targetSceneId : scene.id)}>Continue →</button>}
        {scene.transition.type === "ending" && <p className="rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-800">Ending reached</p>}
      </div>
    </article>
    <pre className="mt-3 max-h-28 overflow-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(variables || story.variables || {}, null, 2)}</pre>
    <button className="button button-secondary mt-3 w-full text-sm" onClick={start}><Upload size={15} /> Restart playtest</button>
  </div>;
}

function LearningPanel() {
  return <div className="mt-4">
    <h2 className="flex items-center gap-2 text-lg font-black text-indigo-950"><Lightbulb size={18} /> Learning mode</h2>
    <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-700">
      <article className="rounded-xl bg-indigo-50 p-3"><strong>1. Build scenes.</strong> Each node is a passage of story text.</article>
      <article className="rounded-xl bg-indigo-50 p-3"><strong>2. Connect choices.</strong> Choices become edges that move readers to another scene.</article>
      <article className="rounded-xl bg-indigo-50 p-3"><strong>3. Merge paths.</strong> Multiple choices can point to one shared scene.</article>
      <article className="rounded-xl bg-indigo-50 p-3"><strong>4. Add variables.</strong> Use conditions like <code>score &gt;= 2</code> and effects like <code>score += 1</code>.</article>
      <article className="rounded-xl bg-indigo-50 p-3"><strong>5. Verify before sharing.</strong> The verifier checks links, endings, empty passages, loops, and unreachable scenes.</article>
    </div>
  </div>;
}

export function StoryEditor({ storyId }: { storyId: string }) {
  return <ReactFlowProvider><EditorInner storyId={storyId} /></ReactFlowProvider>;
}
