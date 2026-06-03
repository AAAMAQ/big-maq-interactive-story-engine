import { StoryEditor } from "@/components/story-editor";

export default async function EditorPage({ params }: { params: Promise<{ storyId: string }> }) {
  return <StoryEditor storyId={(await params).storyId} />;
}

