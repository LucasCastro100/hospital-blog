"use client";

import { useEffect, useState } from "react";
import { DisplayScreen } from "@/components/display-screen";
import { api, getErrorMessage } from "@/lib/api";
import { defaultSiteSettings } from "@/lib/defaults";
import type { Post, SiteSettings } from "@/lib/types";

export default function DisplayPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get<Post[]>("/posts"), api.get<SiteSettings>("/settings")])
      .then(([postsResponse, settingsResponse]) => {
        setPosts(postsResponse.data);
        setSettings(settingsResponse.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return <DisplayScreen posts={posts} settings={settings} error={error} loading={loading} />;
}
