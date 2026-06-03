import Link from "next/link";
import { BookOpenText, CircleUserRound, HelpCircle, Library, Network } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="shell flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-black text-indigo-950">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <Network size={19} />
          </span>
          <span>Big MAQ Story Engine</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-bold text-slate-600">
          <Link className="button px-3 py-2 hover:bg-indigo-50" href="/library">
            <Library size={16} /> <span className="hidden sm:inline">Library</span>
          </Link>
          <Link className="button px-3 py-2 hover:bg-indigo-50" href="/reader">
            <BookOpenText size={16} /> <span className="hidden sm:inline">Reader</span>
          </Link>
          <Link className="button px-3 py-2 hover:bg-indigo-50" href="/help">
            <HelpCircle size={16} /> <span className="hidden sm:inline">Help</span>
          </Link>
          <Link className="button px-3 py-2 hover:bg-indigo-50" href="/credits">
            <CircleUserRound size={16} /> <span className="hidden sm:inline">Credits</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
