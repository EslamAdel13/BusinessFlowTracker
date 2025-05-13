import React from "react";
import { Project, Phase } from "@shared/schema";
import { ProjectCard } from "@/components/projects/project-card";
import { useAppStore } from "@/lib/store";

interface ProjectListProps {
  projects: Project[];
  phases: Record<number, Phase[]>;
  isLoading?: boolean;
}

export function ProjectList({ projects, phases, isLoading = false }: ProjectListProps) {
  const { openCreatePhaseModal, setSelectedProject } = useAppStore();

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    window.location.href = `/timeline?project=${project.id}`;
  };

  const handleAddPhase = (project: Project) => {
    setSelectedProject(project);
    openCreatePhaseModal();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white shadow rounded-md p-4 w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-8 bg-white shadow rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
        <p className="text-gray-500 mb-4">
          Create your first project to get started with project management.
        </p>
        <button
          onClick={() => useAppStore.getState().openCreateProjectModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="-ml-1 mr-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create New Project
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard
              project={project}
              phases={phases[project.id] || []}
              onViewDetails={() => handleViewProject(project)}
              onAddPhase={() => handleAddPhase(project)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectList;
