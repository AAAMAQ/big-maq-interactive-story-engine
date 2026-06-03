import { LibraryClient } from "@/components/library-client";

export const metadata = { title: "Local library" };

export default function LibraryPage() {
  return (
    <main className="shell py-10">
      <p className="eyebrow">Private workspace</p>
      <h1 className="mt-2 text-4xl font-black text-indigo-950">Your local story library</h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-600">
        These projects live only in this browser. Export a JSON file when you want a backup or want to move a story.
      </p>
      <LibraryClient />
    </main>
  );
}

