"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenText, Download, GraduationCap, KeyRound, RotateCcw, Search, Settings, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { AiStoryPromptPanel } from "@/components/ai-story-prompt-panel";
import { downloadJson } from "@/lib/download";
import { tutorialModules } from "@/lib/learning";
import { AppSettings, clearStories, defaultSettings, getSettings, listStories, listStoryPasscodes, markTutorialComplete, saveSettings } from "@/lib/storage";

const sections = [
  "General",
  "Appearance",
  "Reader Settings",
  "Editor Settings",
  "Tutorials & Learning",
  "Notifications",
  "Privacy & Permissions",
  "Password Protection",
  "Backup & Recovery",
  "Advanced Settings",
  "AI-Assisted Story Creation",
];

export function SettingsClient() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const completed = settings.completedTutorials.length;
  const progress = Math.round((completed / tutorialModules.length) * 100);
  const suggested = tutorialModules.find((item) => !settings.completedTutorials.includes(item.id)) || tutorialModules[0];

  useEffect(() => {
    getSettings().then((loaded) => {
      setSettings(loaded);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.scale = settings.interfaceScale;
    document.documentElement.dataset.density = settings.uiDensity;
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
    document.documentElement.style.setProperty("--reader-font-size", `${settings.readingFontSize}px`);
    document.documentElement.style.setProperty("--editor-font-size", `${settings.editorFontSize}px`);
    document.documentElement.style.setProperty("--sidebar-width", `${settings.sidebarWidth}px`);
    document.documentElement.style.setProperty("--motion-factor", settings.reducedMotion ? "0" : "1");
  }, [settings]);

  async function update(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch };
    const saved = await saveSettings(next);
    setSettings(saved);
  }

  async function complete(id: string) {
    const next = await markTutorialComplete(id);
    setSettings(next);
  }

  const visibleSections = useMemo(() => {
    if (!query.trim()) return sections;
    return sections.filter((section) => section.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  async function relaunchOnboarding(mode: "launch" | "restart" | "resume") {
    localStorage.removeItem("big-maq-suppress-onboarding");
    const patch: Partial<AppSettings> = mode === "resume"
      ? { onboardingStatus: "started", currentTutorial: suggested.id }
      : { onboardingStatus: "started", currentTutorial: mode === "launch" ? "full-onboarding" : undefined };
    await update(patch);
    window.dispatchEvent(new Event("big-maq-onboarding-refresh"));
  }

  async function exportAllLocalData() {
    const [stories, passcodes, latest] = await Promise.all([listStories(), listStoryPasscodes(), getSettings()]);
    downloadJson("big-maq-story-engine-backup.json", {
      exportedAt: new Date().toISOString(),
      settings: latest,
      stories,
      passcodes,
    });
  }

  async function clearLocalData() {
    await clearStories();
    await update(defaultSettings);
    window.dispatchEvent(new Event("big-maq-onboarding-refresh"));
  }

  if (!ready) return <p className="mt-8 muted">Opening settings...</p>;

  return (
    <section className="mt-8 grid gap-6">
      <div className="card p-4">
        <label className="flex items-center gap-3">
          <Search className="text-slate-500" size={19} />
          <input className="input" placeholder="Search settings, tutorials, password protection, AI prompts..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>

      {visibleSections.includes("General") && <SettingsCard icon={Settings} title="General">
        <SettingRow label="Theme"><Select value={settings.theme} onChange={(theme) => update({ theme: theme as AppSettings["theme"] })} options={["light", "dark", "system"]} /></SettingRow>
        <SettingRow label="Language"><input className="input" value={settings.language} onChange={(event) => update({ language: event.target.value })} /></SettingRow>
        <SettingRow label="Interface Scale"><Select value={settings.interfaceScale} onChange={(interfaceScale) => update({ interfaceScale: interfaceScale as AppSettings["interfaceScale"] })} options={["compact", "comfortable", "large"]} /></SettingRow>
        <SettingRow label="Font Size"><Range value={settings.fontSize} min={12} max={24} onChange={(fontSize) => update({ fontSize })} /></SettingRow>
        <SettingRow label="Startup Page"><Select value={settings.startupPage} onChange={(startupPage) => update({ startupPage: startupPage as AppSettings["startupPage"] })} options={["home", "reader", "library", "settings"]} /></SettingRow>
        <Toggle label="Auto Save" checked={settings.autoSave} onChange={(autoSave) => update({ autoSave })} />
      </SettingsCard>}

      {visibleSections.includes("Appearance") && <SettingsCard icon={SlidersHorizontal} title="Appearance">
        <SettingRow label="UI Density"><Select value={settings.uiDensity} onChange={(uiDensity) => update({ uiDensity: uiDensity as AppSettings["uiDensity"] })} options={["compact", "comfortable"]} /></SettingRow>
        <SettingRow label="Sidebar Width"><Range value={settings.sidebarWidth} min={300} max={520} onChange={(sidebarWidth) => update({ sidebarWidth })} /></SettingRow>
        <Toggle label="Animations" checked={settings.animations} onChange={(animations) => update({ animations })} />
        <Toggle label="Reduced Motion" checked={settings.reducedMotion} onChange={(reducedMotion) => update({ reducedMotion })} />
        <SettingRow label="Color Accessibility"><Select value={settings.colorAccessibility} onChange={(colorAccessibility) => update({ colorAccessibility: colorAccessibility as AppSettings["colorAccessibility"] })} options={["default", "high-contrast", "color-blind-friendly"]} /></SettingRow>
      </SettingsCard>}

      {visibleSections.includes("Reader Settings") && <SettingsCard icon={BookOpenText} title="Reader Settings">
        <SettingRow label="Reading Font"><input className="input" value={settings.readingFont} onChange={(event) => update({ readingFont: event.target.value })} /></SettingRow>
        <SettingRow label="Reading Font Size"><Range value={settings.readingFontSize} min={14} max={28} onChange={(readingFontSize) => update({ readingFontSize })} /></SettingRow>
        <SettingRow label="Reading Width"><Select value={settings.readingWidth} onChange={(readingWidth) => update({ readingWidth: readingWidth as AppSettings["readingWidth"] })} options={["narrow", "medium", "wide"]} /></SettingRow>
        <SettingRow label="Reading Themes"><Select value={settings.readingTheme} onChange={(readingTheme) => update({ readingTheme: readingTheme as AppSettings["readingTheme"] })} options={["paper", "bright", "night"]} /></SettingRow>
        <Toggle label="Reading Progress Tracking" checked={settings.readingProgressTracking} onChange={(readingProgressTracking) => update({ readingProgressTracking })} />
        <SettingRow label="Continue Reading Behavior"><Select value={settings.continueReading} onChange={(continueReading) => update({ continueReading: continueReading as AppSettings["continueReading"] })} options={["restart", "resume"]} /></SettingRow>
        <Toggle label="Page Transition Effects" checked={settings.pageTransitions} onChange={(pageTransitions) => update({ pageTransitions })} />
      </SettingsCard>}

      {visibleSections.includes("Editor Settings") && <SettingsCard icon={SlidersHorizontal} title="Editor Settings">
        <SettingRow label="Auto Save Interval"><Range value={settings.autoSaveInterval} min={250} max={3000} onChange={(autoSaveInterval) => update({ autoSaveInterval })} /></SettingRow>
        <SettingRow label="Editor Font"><input className="input" value={settings.editorFont} onChange={(event) => update({ editorFont: event.target.value })} /></SettingRow>
        <SettingRow label="Editor Font Size"><Range value={settings.editorFontSize} min={12} max={24} onChange={(editorFontSize) => update({ editorFontSize })} /></SettingRow>
        <Toggle label="Spell Check" checked={settings.spellCheck} onChange={(spellCheck) => update({ spellCheck })} />
        <Toggle label="Grammar Check" checked={settings.grammarCheck} onChange={(grammarCheck) => update({ grammarCheck })} />
        <Toggle label="Word Count" checked={settings.wordCount} onChange={(wordCount) => update({ wordCount })} />
        <Toggle label="Character Count" checked={settings.characterCount} onChange={(characterCount) => update({ characterCount })} />
        <SettingRow label="Branch Visualization Preferences"><Select value={settings.branchVisualization} onChange={(branchVisualization) => update({ branchVisualization: branchVisualization as AppSettings["branchVisualization"] })} options={["simple", "detailed"]} /></SettingRow>
        <Toggle label="Writing Focus Mode" checked={settings.writingFocusMode} onChange={(writingFocusMode) => update({ writingFocusMode })} />
      </SettingsCard>}

      {visibleSections.includes("Tutorials & Learning") && <SettingsCard icon={GraduationCap} title="Tutorials & Learning">
        <div className="rounded-2xl bg-indigo-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-black text-indigo-950">Learning progress</p><p className="text-sm text-slate-600">{completed} completed, {tutorialModules.length - completed} remaining. Suggested next: {suggested.title}</p></div>
            <p className="text-3xl font-black text-indigo-700">{progress}%</p>
          </div>
          <div className="mt-3 h-3 rounded-full bg-white"><div className="h-3 rounded-full bg-indigo-600" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="button button-primary" onClick={() => relaunchOnboarding("launch")}>Launch Full Onboarding</button>
          <button className="button button-secondary" onClick={() => relaunchOnboarding("restart")}>Restart Onboarding</button>
          <button className="button button-secondary" onClick={() => relaunchOnboarding("resume")}>Resume Onboarding</button>
          <button className="button button-secondary" onClick={() => update({ completedTutorials: [] })}><RotateCcw size={16} /> Reset Tutorial Progress</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tutorialModules.map((module) => (
            <article className="rounded-2xl border border-slate-200 p-4" key={module.id}>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{module.level} • {module.minutes}</p>
              <h3 className="mt-2 font-black text-indigo-950">{module.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
              <button className="button button-secondary mt-3 w-full text-sm" onClick={() => complete(module.id)}>{settings.completedTutorials.includes(module.id) ? "Completed" : "Mark Complete"}</button>
            </article>
          ))}
        </div>
        <Toggle label="Beginner Mode" checked={settings.beginnerMode} onChange={(beginnerMode) => update({ beginnerMode, advancedMode: beginnerMode ? false : settings.advancedMode })} />
        <Toggle label="Advanced Mode" checked={settings.advancedMode} onChange={(advancedMode) => update({ advancedMode, beginnerMode: advancedMode ? false : settings.beginnerMode })} />
      </SettingsCard>}

      {visibleSections.includes("Password Protection") && <SettingsCard icon={KeyRound} title="Password Protection">
        <Toggle label="Enable Password Protection" checked={settings.passwordProtection.enabled} onChange={(enabled) => update({ passwordProtection: { ...settings.passwordProtection, enabled } })} />
        <Toggle label="Password Strength Indicator" checked={settings.passwordProtection.strengthIndicator} onChange={(strengthIndicator) => update({ passwordProtection: { ...settings.passwordProtection, strengthIndicator } })} />
        <Toggle label="Password Visibility Toggle" checked={settings.passwordProtection.visibilityToggle} onChange={(visibilityToggle) => update({ passwordProtection: { ...settings.passwordProtection, visibilityToggle } })} />
        <Toggle label="Access Attempt Feedback" checked={settings.passwordProtection.accessAttemptFeedback} onChange={(accessAttemptFeedback) => update({ passwordProtection: { ...settings.passwordProtection, accessAttemptFeedback } })} />
        <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Password changes happen per story during sharing. Use Read and Modify sharing to generate password-protected editable story files.</p>
      </SettingsCard>}

      {visibleSections.includes("Notifications") && <SettingsCard icon={ShieldCheck} title="Notifications">
        {Object.entries(settings.notifications).map(([key, value]) => <Toggle key={key} label={labelize(key)} checked={value} onChange={(checked) => update({ notifications: { ...settings.notifications, [key]: checked } })} />)}
      </SettingsCard>}

      {visibleSections.includes("Privacy & Permissions") && <SettingsCard icon={ShieldCheck} title="Privacy & Permissions">
        <p className="text-sm leading-6 text-slate-600">No account, no cloud story storage, and no analytics. Shared story permissions are embedded in exported files and enforced by the app UI.</p>
        <p className="text-sm leading-6 text-slate-600">Read Only files open in Reader. Read and Modify files require the correct password to unlock editing.</p>
      </SettingsCard>}

      {visibleSections.includes("Backup & Recovery") && <SettingsCard icon={Download} title="Backup & Recovery">
        <Toggle label="Automatic Backups" checked={settings.backups.automatic} onChange={(automatic) => update({ backups: { automatic } })} />
        <p className="text-sm leading-6 text-slate-600">Use JSON export in the editor for story backups. Local backups are stored in this browser.</p>
        <div className="flex flex-wrap gap-2">
          <button className="button button-secondary" onClick={exportAllLocalData}>Export all local data</button>
          <button className="button button-danger" onClick={clearLocalData}>Clear local stories and reset settings</button>
        </div>
      </SettingsCard>}

      {visibleSections.includes("Advanced Settings") && <SettingsCard icon={SlidersHorizontal} title="Advanced Settings">
        <Toggle label="Developer Mode" checked={settings.advanced.developerMode} onChange={(developerMode) => update({ advanced: { ...settings.advanced, developerMode } })} />
        <Toggle label="Debug Mode" checked={settings.advanced.debugMode} onChange={(debugMode) => update({ advanced: { ...settings.advanced, debugMode } })} />
        <Toggle label="Experimental Features" checked={settings.advanced.experimentalFeatures} onChange={(experimentalFeatures) => update({ advanced: { ...settings.advanced, experimentalFeatures } })} />
        <SettingRow label="Performance Settings"><Select value={settings.advanced.performanceMode} onChange={(performanceMode) => update({ advanced: { ...settings.advanced, performanceMode: performanceMode as AppSettings["advanced"]["performanceMode"] } })} options={["balanced", "fast", "quality"]} /></SettingRow>
        <button className="button button-secondary" onClick={() => window.location.reload()}>Reload app cache</button>
        <button className="button button-secondary" onClick={exportAllLocalData}>Export debug data</button>
      </SettingsCard>}

      {visibleSections.includes("AI-Assisted Story Creation") && <AiStoryPromptPanel />}
    </section>
  );
}

function SettingsCard({ icon: Icon, title, children }: { icon: typeof Settings; title: string; children: React.ReactNode }) {
  return <section className="card p-5"><h2 className="flex items-center gap-2 text-2xl font-black text-indigo-950"><Icon className="text-indigo-600" /> {title}</h2><div className="mt-4 grid gap-4">{children}</div></section>;
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 md:grid-cols-[220px_1fr] md:items-center"><span className="font-bold text-slate-700">{label}</span>{children}</label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 font-bold text-slate-700"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{labelize(option)}</option>)}</select>;
}

function Range({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <div className="flex items-center gap-3"><input className="w-full" type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /><span className="w-14 text-right text-sm font-bold">{value}</span></div>;
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/^./, (char) => char.toUpperCase());
}
