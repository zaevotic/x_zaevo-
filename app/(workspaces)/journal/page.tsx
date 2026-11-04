import { getPosts } from "@/lib/journal";
import JournalWorkspace from "@/components/sys/usr/journal-workspace";
import { Suspense } from "react";

export default function JournalPage() {
  const posts = getPosts();

  return (
    <Suspense fallback={null}>
      <JournalWorkspace initialPosts={posts} />
    </Suspense>
  );
}
