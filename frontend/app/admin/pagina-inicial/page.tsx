"use client";

import { PageEditor } from "@/components/page-editor";
import { HOME_SLUG } from "@/lib/defaults";

export default function AdminHomePage() {
  return <PageEditor slug={HOME_SLUG} />;
}
