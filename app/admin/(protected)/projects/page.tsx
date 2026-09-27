import Link from "next/link";

import { listAdminProjects } from "@/lib/admin/projects";
import ProjectsExplorer from "@/components/admin/ProjectsExplorer";

export const dynamic = "force-dynamic";

const ProjectsPage = async () => {
  const projects = await listAdminProjects();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Drag to reorder. This is what shows on the Work page.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="h-10 rounded-full bg-foreground px-5 text-sm font-medium leading-10 text-background transition-colors hover:bg-purple"
        >
          New project
        </Link>
      </div>
      <div className="mt-6">
        <ProjectsExplorer projects={projects} />
      </div>
    </div>
  );
};

export default ProjectsPage;
