import { Suspense } from "react";
import { StoryReader } from "@/components/story-reader";

export const metadata = { title: "Reader" };

export default function ReaderPage() {
  return <Suspense fallback={<main className="shell py-10 muted">Opening reader...</main>}><StoryReader /></Suspense>;
}

