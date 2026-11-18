"use client";

import { useEffect, useState } from "react";
import { PostEditor } from "@/components/post-editor";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>();

  useEffect(() => {
    void params.then((value) => setId(value.id));
  }, [params]);

  if (!id) return null;
  return <PostEditor postId={id} />;
}
