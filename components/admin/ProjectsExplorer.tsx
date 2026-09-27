"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical } from "react-icons/fa6";

import type { AdminProject } from "@/lib/admin/projects";

const Row = ({
  project,
  onTogglePublished,
  onDelete,
}: {
  project: AdminProject;
  onTogglePublished: (slug: string, published: boolean) => void;
  onDelete: (slug: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.slug });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-4 border-b border-black/[0.06] bg-white px-4 py-3 last:border-0 ${isDragging ? "z-10 shadow-lg" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab touch-none text-neutral-400 active:cursor-grabbing"
      >
        <FaGripVertical size={14} />
      </button>

      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image src={project.image} alt="" fill sizes="64px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{project.client}</p>
        <p className="truncate text-xs text-muted-foreground">
          {project.category} &middot; {project.slug}
        </p>
      </div>

      <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={project.published}
          onChange={(e) => onTogglePublished(project.slug, e.target.checked)}
          className="h-4 w-4 accent-purple"
        />
        Published
      </label>

      <Link
        href={`/admin/projects/${project.slug}`}
        className="shrink-0 rounded-full border border-black/[0.12] px-3 py-1.5 text-xs font-medium transition-colors hover:border-purple/40 hover:text-purple"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={() => onDelete(project.slug)}
        className="shrink-0 rounded-full border border-black/[0.12] px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:border-destructive/40"
      >
        Delete
      </button>
    </div>
  );
};

const ProjectsExplorer = ({ projects: initial }: { projects: AdminProject[] }) => {
  const [projects, setProjects] = useState(initial);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.slug === active.id);
    const newIndex = projects.findIndex((p) => p.slug === over.id);
    const next = arrayMove(projects, oldIndex, newIndex);
    setProjects(next);
    await fetch("/api/admin/projects/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: next.map((p) => p.slug) }),
    });
  };

  const togglePublished = async (slug: string, published: boolean) => {
    setProjects((prev) => prev.map((p) => (p.slug === slug ? { ...p, published } : p)));
    await fetch(`/api/admin/projects/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
  };

  const remove = async (slug: string) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    setProjects((prev) => prev.filter((p) => p.slug !== slug));
    await fetch(`/api/admin/projects/${slug}`, { method: "DELETE" });
  };

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={projects.map((p) => p.slug)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <Row key={project.slug} project={project} onTogglePublished={togglePublished} onDelete={remove} />
          ))}
        </SortableContext>
      </DndContext>
      {projects.length === 0 && <p className="p-6 text-center text-muted-foreground">No projects yet.</p>}
    </div>
  );
};

export default ProjectsExplorer;
