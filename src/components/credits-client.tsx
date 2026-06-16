"use client";

import { useState } from "react";
import Link from "next/link";
import { Coffee, Share2 } from "lucide-react";

const buyMeACoffee = "https://buymeacoffee.com/bigmaqstudio";

export function CreditsClient() {
  const [shared, setShared] = useState<string | null>(null);
  async function onShare() {
    const shareData = {
      title: "Big MAQ Interactive Story Engine",
      text: "Try Big MAQ Interactive Story Engine — a privacy-first branching story editor.",
      url: window.location.origin,
    };
    try {
      const usedNativeShare = Boolean(navigator.share);
      if (usedNativeShare) await navigator.share(shareData);
      else if (navigator.clipboard) await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setShared(usedNativeShare ? "Shared!" : "Link copied to clipboard");
      setTimeout(() => setShared(null), 2000);
    } catch {}
  }
  return (
    <main className="shell py-10">
      <p className="eyebrow">Big MAQ Studio</p>
      <h1 className="mt-2 text-4xl font-black text-indigo-950">Credits</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Big MAQ Interactive Story Engine is a lightweight educational PWA for creating, reading, and studying branching narratives.
        It is privacy-friendly, works offline after installation, and keeps drafts on the user&apos;s device.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="card p-5">
          <h2 className="text-xl font-black text-indigo-950">Project details</h2>
          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            <p><strong>App:</strong> Big MAQ Interactive Story Engine</p>
            <p><strong>Version:</strong> v0.4.0</p>
            <p><strong>Date of current version:</strong> June 16, 2026</p>
            <p><strong>Company:</strong> BiG MAQ Studio</p>
            <p><strong>Built with:</strong> Next.js, TypeScript, React Flow, IndexedDB, and Vercel-ready PWA tooling.</p>
          </div>
        </article>
        <article className="card p-5">
          <h2 className="text-xl font-black text-indigo-950">Support the project</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">If this educational app helps you, consider supporting BiG MAQ Studio.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="button button-primary" href={buyMeACoffee} target="_blank" rel="noreferrer"><Coffee size={17} /> Buy Me a Coffee</a>
            <button className="button button-secondary" onClick={onShare}><Share2 size={17} /> Share app</button>
          </div>
          {shared && <p className="mt-3 text-sm font-bold text-emerald-700">{shared}</p>}
        </article>
      </section>
      <section className="card mt-5 p-5">
        <h2 className="text-xl font-black text-indigo-950">Short dev log</h2>
        <div className="mt-4 grid gap-4 text-sm leading-6 text-slate-700">
          <article className="border-l-4 border-indigo-500 pl-4"><p className="text-xs font-bold text-slate-500">June 16, 2026</p><h3 className="font-black text-indigo-950">Settings and onboarding reliability update</h3><p>Improved the full Settings system so preferences persist safely, runtime theme and layout settings apply immediately, onboarding can be relaunched from Settings, and backup and data-management actions perform real work instead of acting like placeholders.</p></article>
          <article className="border-l-4 border-indigo-500 pl-4"><p className="text-xs font-bold text-slate-500">June 16, 2026</p><h3 className="font-black text-indigo-950">Advanced RPG system expansion</h3><p>Expanded the story engine with random dice rolls, weighted random branches, encounter tables, inventory support, RPG stats, XP leveling, loot tables, stat-based checks, hidden-route logic, and matching support across the reader, editor, playtest mode, exports, and verification.</p></article>
          <article className="border-l-4 border-indigo-500 pl-4"><p className="text-xs font-bold text-slate-500">June 15, 2026</p><h3 className="font-black text-indigo-950">Learning center and password sharing upgrade</h3><p>Added the settings-based learning center, AI story prompt tools, onboarding system, password-protected sharing flow, improved Reader and Library organization, and stronger help content for local-first collaboration.</p></article>
          <article className="border-l-4 border-indigo-500 pl-4"><p className="text-xs font-bold text-slate-500">June 3, 2026</p><h3 className="font-black text-indigo-950">Feature expansion release</h3><p>Added analytics, improved verification, undo and redo, playtest preview, searchable graph navigation, tags, chapters, variables, local media attachments, export tools, backups, and offline/update status.</p></article>
          <article className="border-l-4 border-indigo-500 pl-4"><p className="text-xs font-bold text-slate-500">June 3, 2026</p><h3 className="font-black text-indigo-950">Default library demo</h3><p>The educational fan demo is now available from the local library by default, while the homepage stays focused on creating and reading stories.</p></article>
          <article className="border-l-4 border-indigo-500 pl-4"><p className="text-xs font-bold text-slate-500">June 2, 2026</p><h3 className="font-black text-indigo-950">Initial PWA build</h3><p>Built the privacy-first editor, reader, IndexedDB storage, JSON import/export, PWA manifest, service worker, and first verification engine.</p></article>
        </div>
      </section>
      <section className="card mt-5 p-5 text-sm leading-6 text-slate-700">
        <h2 className="text-xl font-black text-indigo-950">Copyright and privacy</h2>
        <p className="mt-3">© {new Date().getFullYear()} BiG MAQ Studio. All rights reserved. The software code and accompanying documentation are protected by copyright law.</p>
        <p className="mt-2">The app stores drafts locally in your browser. No account, tracking, analytics, or server-side story database is required.</p>
        <p className="mt-2">Install the PWA by opening it in your browser, tapping Share/Menu, and choosing Add to Home Screen or Install App.</p>
      </section>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link className="button button-secondary" href="/help">Need help</Link>
        <Link className="button button-secondary" href="/reader">Reader</Link>
        <Link className="button button-secondary" href="/library">Library</Link>
      </div>
    </main>
  );
}
