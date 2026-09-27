"use client";

import { useState } from "react";
import Link from "next/link";

import PostsExplorer from "./PostsExplorer";
import ContentEngine from "./ContentEngine";
import type { AdminPost } from "@/lib/admin/posts";
import type { CalendarConfig } from "@/lib/playbook/calendar";
import type { JobRun } from "@/lib/admin/jobRuns";
import { cn } from "@/lib/utils";

const PlaybookTabs = ({
  posts,
  calendarConfig,
  jobRuns,
}: {
  posts: AdminPost[];
  calendarConfig: CalendarConfig;
  jobRuns: JobRun[];
}) => {
  const [tab, setTab] = useState<"posts" | "engine">("posts");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["posts", "engine"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t ? "bg-foreground text-background" : "bg-black/[0.05] text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "posts" ? "Posts" : "Content engine"}
            </button>
          ))}
        </div>
        {tab === "posts" && (
          <Link
            href="/admin/playbook/new"
            className="h-10 shrink-0 rounded-full bg-foreground px-5 text-sm font-medium leading-10 text-background transition-colors hover:bg-purple"
          >
            New post
          </Link>
        )}
      </div>

      <div className="mt-6">
        {tab === "posts" ? <PostsExplorer posts={posts} /> : <ContentEngine initialConfig={calendarConfig} initialJobRuns={jobRuns} />}
      </div>
    </div>
  );
};

export default PlaybookTabs;
