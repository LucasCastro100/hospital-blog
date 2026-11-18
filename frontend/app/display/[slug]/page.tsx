"use client";

import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DisplayScreen, defaultDisplaySettings } from "@/components/display-screen";
import { api, getErrorMessage } from "@/lib/api";
import type { Post, SiteSettings } from "@/lib/types";

interface DisplayPayload {
  id: string;
  name: string;
  slug: string;
  posts: Post[];
}

function ScreenContent() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [posts, setPosts] = useState<Post[]>([]);
  const [screen, setScreen] = useState<DisplayPayload | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultDisplaySettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      api.get<DisplayPayload>(`/displays/${slug}`),
      api.get<SiteSettings>("/settings"),
    ])
      .then(([screenResponse, settingsResponse]) => {
        setScreen(screenResponse.data);
        setPosts(screenResponse.data.posts ?? []);
        setSettings(settingsResponse.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <DisplayScreen
      posts={posts}
      settings={settings}
      error={error}
      loading={loading}
      screenName={screen?.name}
      allowPortalLink={false}
    />
  );
}

export default function DisplayBySlugPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-slate-900" />}>
      <ScreenContent />
    </Suspense>
  );
}
