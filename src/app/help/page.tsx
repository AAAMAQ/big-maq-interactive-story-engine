import { BookOpenText, Download, GitBranch, HardDrive, Image, KeyRound, ShieldCheck, WifiOff } from "lucide-react";

export const metadata = { title: "Help" };

const topics = [
  [GitBranch, "Build with scenes", "Each card is a scene. Drag it around the canvas, give it a color, and connect it to other scenes through choices or a simple continue transition."],
  [BookOpenText, "Start and endings", "Every story needs one start scene. Each reachable path should eventually arrive at an ending. The verifier checks this before export."],
  [Download, "Import and export", "Stories use a readable .story.json format. You can export view-only files for readers or editable files for collaborators."],
  [KeyRound, "Edit passcodes", "Editable story exports include a passcode check. The passcode is kept in your local library and can be exported separately when you want to share editing access."],
  [HardDrive, "Local saves", "Drafts autosave to IndexedDB in this browser. The editor keeps local backup snapshots so you can restore earlier work."],
  [WifiOff, "Offline PWA", "Install the app from your browser. After the first visit, the editor, library, import, export, and text reader remain available offline."],
  [Image, "Media and variables", "Authors may add remote URLs or local image/audio attachments, plus simple variables, choice conditions, and effects such as score += 1."],
];

export default function HelpPage() {
  return <main className="shell py-10">
    <p className="eyebrow">Educational guide</p>
    <h1 className="mt-2 text-4xl font-black text-indigo-950">How the story engine works</h1>
    <p className="mt-3 max-w-3xl leading-7 text-slate-600">Big MAQ Story Engine is a lightweight visual introduction to interactive narrative design. It turns the scene-and-link concepts from the original C++ engine into an installable web app.</p>
    <section className="mt-8 grid gap-4 md:grid-cols-2">
      {topics.map(([Icon, title, text]) => <article className="card p-5" key={String(title)}><Icon className="text-indigo-600" /><h2 className="mt-3 text-lg font-black text-indigo-950">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{String(text)}</p></article>)}
    </section>
    <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
      <h2 className="flex items-center gap-2 font-black"><ShieldCheck size={18} /> Privacy promise</h2>
      <p className="mt-2">No account, tracking, analytics, or server-side story storage. Vercel serves the application files; your writing stays in your browser unless you deliberately export it.</p>
    </section>
  </main>;
}
