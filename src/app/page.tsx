import Link from "next/link";
import { BookOpenText, ShieldCheck } from "lucide-react";
import { CreateStoryButton } from "@/components/create-story-button";

export default function Home() {
  return (
    <main>
      <section className="shell flex min-h-[calc(100vh-4rem)] items-center py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Big MAQ Studio presents</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-indigo-950 sm:text-7xl">
            Interactive Story Engine
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            A lightweight, privacy-first Twine-style editor for learning how branching stories work.
            Create a story from scratch or read an imported story file.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CreateStoryButton />
            <Link href="/reader" className="button button-secondary">
              <BookOpenText size={17} /> Read story
            </Link>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700">
            <ShieldCheck size={17} /> No account. No tracking. Your stories stay on your device.
          </p>
        </div>
      </section>
    </main>
  );
}
