import { notFound } from "next/navigation";

import { getAdminProject } from "@/lib/admin/projects";
import ProjectForm from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

const EditProjectPage = async ({ params }: { params: { slug: string } }) => {
  const project = await getAdminProject(params.slug);
  if (!project) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">{project.client}</h1>
      <p className="mt-1 text-sm text-muted-foreground">/work/{project.slug}</p>
      <div className="mt-6">
        <ProjectForm initial={project} isNew={false} />
      </div>
    </div>
  );
};

export default EditProjectPage;
