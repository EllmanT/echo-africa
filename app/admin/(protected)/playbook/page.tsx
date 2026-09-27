import { listAdminPosts } from "@/lib/admin/posts";
import { listJobRuns } from "@/lib/admin/jobRuns";
import { getCalendarConfig } from "@/lib/playbook/calendar";
import PlaybookTabs from "@/components/admin/PlaybookTabs";

export const dynamic = "force-dynamic";

const PlaybookAdminPage = async () => {
  const [posts, calendarConfig, jobRuns] = await Promise.all([listAdminPosts(), getCalendarConfig(), listJobRuns()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">The Playbook</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Write posts by hand, or let the content engine research and write one for you.
      </p>
      <div className="mt-6">
        <PlaybookTabs posts={posts} calendarConfig={calendarConfig} jobRuns={jobRuns} />
      </div>
    </div>
  );
};

export default PlaybookAdminPage;
