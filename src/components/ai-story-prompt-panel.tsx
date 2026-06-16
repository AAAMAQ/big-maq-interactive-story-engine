"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Sparkles } from "lucide-react";
import { buildAiStoryPrompt } from "@/lib/learning";

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function AiStoryPromptPanel() {
  const [mode, setMode] = useState<"standard" | "advanced">("standard");
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildAiStoryPrompt(mode), [mode]);

  async function copyPrompt() {
    await navigator.clipboard?.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="ai-story-generator" className="card scroll-mt-24 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Let AI Create Your Story</p>
          <h2 className="mt-2 flex items-center gap-2 text-3xl font-black text-indigo-950"><Sparkles className="text-indigo-600" /> Don&apos;t Know How to Create Stories? Let AI Do It For You</h2>
          <p className="mt-3 max-w-4xl leading-7 text-slate-600">
            Not everyone wants to learn story architecture, branching logic, JSON schemas, variables, or story structure.
            If you already know the story you want, copy this prompt into ChatGPT, Claude, Gemini, DeepSeek, Grok, or a local LLM.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={`button px-3 py-2 text-sm ${mode === "standard" ? "button-primary" : "button-secondary"}`} onClick={() => setMode("standard")}>Standard Prompt</button>
          <button className={`button px-3 py-2 text-sm ${mode === "advanced" ? "button-primary" : "button-secondary"}`} onClick={() => setMode("advanced")}>Advanced Prompt</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">
          <h3 className="font-black">What the prompt teaches the AI</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Story metadata, title, author, description, tags, and chapters</li>
            <li>Pages/scenes, choices, branching paths, and multiple endings</li>
            <li>Variables, hidden paths, bonus text, and validation rules</li>
            <li>Password Protection permissions for read-only, edit, and owner access</li>
          </ul>
        </article>
        <article className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <h3 className="font-black">Troubleshooting AI output</h3>
          <p><strong>Invalid JSON:</strong> ask for JSON-only output.</p>
          <p><strong>Missing branches:</strong> ask AI to validate every branch connection.</p>
          <p><strong>Broken references:</strong> ask AI to ensure all targetSceneId values exist.</p>
          <p><strong>Password errors:</strong> regenerate using the Story Engine schema prompt.</p>
        </article>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="button button-primary" onClick={copyPrompt}><Copy size={17} /> {copied ? "Copied" : "Copy Prompt"}</button>
        <button className="button button-secondary" onClick={() => downloadText(`story-engine-${mode}-ai-prompt.txt`, prompt)}><Download size={17} /> Download Prompt</button>
        <button className="button button-secondary" onClick={() => setExpanded((value) => !value)}>{expanded ? "Collapse Full Prompt" : "Expand Full Prompt"}</button>
      </div>

      {expanded && <pre className="mt-5 max-h-[34rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{prompt}</pre>}

      <section className="mt-5 rounded-2xl border border-slate-200 p-4">
        <h3 className="font-black text-indigo-950">Example user requests</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
          <li>Create a fantasy adventure about a young mage trying to save a kingdom.</li>
          <li>Create a detective mystery with multiple suspects and five endings.</li>
          <li>Create a science fiction survival story on a damaged spaceship.</li>
          <li>Create a romance visual novel with branching relationships.</li>
          <li>Create a password-protected classroom story where students can read, but only the teacher can edit.</li>
        </ul>
      </section>
    </section>
  );
}
