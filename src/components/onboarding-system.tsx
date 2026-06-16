"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";
import { AppSettings, getSettings, saveSettings } from "@/lib/storage";

const steps = [
  {
    title: "Welcome to Story Engine",
    body: "This interactive tutorial teaches reading stories, creating stories, editing, branching narratives, importing, exporting, sharing, and Password Protection. Estimated time: 5-10 minutes.",
    action: "Start Tutorial",
  },
  {
    title: "Navigation Overview",
    body: "The top navigation opens Reader, Library, Help, Settings, and Credits. Settings also contains the Learning Center.",
    action: "I understand navigation",
  },
  {
    title: "Reader Walkthrough",
    body: "Reader is the central place for reading Your Stories and Shared Stories. Open Reader to choose a story and follow choices.",
    href: "/reader",
    action: "Open Reader",
  },
  {
    title: "Library Walkthrough",
    body: "Library contains stories you own or can edit. It shows Read, Edit, Duplicate, Password, and Share actions.",
    href: "/library",
    action: "Open Library",
  },
  {
    title: "Create First Story",
    body: "Create a story, enter a title and description, then save. The full guided practice lives in Settings > Tutorials & Learning.",
    href: "/library",
    action: "Practice in Library",
  },
  {
    title: "Branching Narrative Tutorial",
    body: "A branch is a decision point. Create one choice, two branches, and endings for both paths. Use the editor Playtest tab to validate flow.",
    action: "I understand branching",
  },
  {
    title: "Story Sharing Tutorial",
    body: "Share offers Read Only and Read and Modify. Read and Modify uses Password Protection so collaborators need the correct password to edit.",
    action: "I understand sharing",
  },
  {
    title: "Import and Export Tutorial",
    body: "Import .story.json files. Export JSON, HTML, and maps. If an editable shared story is password protected, enter the correct password during import.",
    action: "I understand import/export",
  },
  {
    title: "Password Protection Tutorial",
    body: "Password Protection controls edit access for shared stories. Share the story file and password separately with trusted collaborators.",
    action: "I understand passwords",
  },
  {
    title: "Let AI Build Your Story",
    body: "If you do not want to learn JSON or story architecture first, use Settings or Help to copy a dynamic AI prompt generated from the real app schema.",
    href: "/settings",
    action: "Open Learning Center",
  },
  {
    title: "Congratulations",
    body: "You learned the major workflows: reading, creation, editing, branching, sharing, importing, exporting, Password Protection, and AI-assisted story creation.",
    action: "Start Building",
  },
];

export function OnboardingSystem() {
  const [settings, setSettings] = useState<AppSettings>();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function syncFromSettings() {
      if (localStorage.getItem("big-maq-suppress-onboarding") === "true") return;
      getSettings().then((loaded) => {
        setSettings(loaded);
        setVisible(loaded.onboardingStatus === "new" || loaded.onboardingStatus === "started");
      });
    }
    syncFromSettings();
    window.addEventListener("big-maq-onboarding-refresh", syncFromSettings);
    return () => window.removeEventListener("big-maq-onboarding-refresh", syncFromSettings);
  }, []);

  if (!settings || !visible) return null;
  const current = steps[step];

  async function updateStatus(status: AppSettings["onboardingStatus"]) {
    if (!settings) return;
    const next = { ...settings, onboardingStatus: status };
    setSettings(next);
    await saveSettings(next);
    if (status !== "started") setVisible(false);
  }

  async function next() {
    if (step >= steps.length - 1) {
      await updateStatus("complete");
      return;
    }
    if (settings?.onboardingStatus === "new") await updateStatus("started");
    setStep((value) => value + 1);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-16 max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Interactive onboarding</p>
            <h2 className="mt-2 flex items-center gap-2 text-3xl font-black text-indigo-950"><Sparkles className="text-indigo-600" /> {current.title}</h2>
          </div>
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => setVisible(false)} aria-label="Close onboarding"><X /></button>
        </div>
        <p className="mt-4 text-lg leading-8 text-slate-700">{current.body}</p>
        <div className="mt-5 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-indigo-600 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <p className="mt-2 text-sm font-bold text-slate-500">Step {step + 1} of {steps.length}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {current.href ? <Link className="button button-primary" href={current.href} onClick={next}>{current.action} <ArrowRight size={17} /></Link> : <button className="button button-primary" onClick={next}>{current.action} <ArrowRight size={17} /></button>}
          <button className="button button-secondary" onClick={() => updateStatus("skipped")}>Skip</button>
          <button className="button button-secondary" onClick={() => updateStatus("never")}>Never Show Again</button>
          {step === steps.length - 1 && <Link className="button button-secondary" href="/settings#ai-story-generator" onClick={() => updateStatus("complete")}><CheckCircle2 size={17} /> Open Tutorials</Link>}
        </div>
      </div>
    </div>
  );
}
