import ProjectForm from "@/components/admin/ProjectForm";

const NewProjectPage = () => (
  <div>
    <h1 className="font-display text-2xl font-bold tracking-tight">New project</h1>
    <p className="mt-1 text-sm text-muted-foreground">It goes live on /work as soon as you save it.</p>
    <div className="mt-6">
      <ProjectForm initial={null} isNew />
    </div>
  </div>
);

export default NewProjectPage;
