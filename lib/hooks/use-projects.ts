'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Project, UpdateProjectDto, createProjectDto } from '@/lib/api/api';
import { createProject, loadProject, loadProjects, saveProject } from '@/lib/api/client-api';
import { projectKeys } from '@/lib/query-keys';

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: projectKeys.all,
    queryFn: loadProjects,
  });
}

export function useProject(projectId: string) {
  return useQuery<Project>({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => loadProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, createProjectDto>({
    mutationFn: createProject,
    onSuccess(project) {
      queryClient.setQueryData<Project[]>(projectKeys.all, (projects) => (
        projects ? [...projects, project] : [project]
      ));
      queryClient.setQueryData(projectKeys.detail(project.id), project);
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, UpdateProjectDto>({
    mutationFn: (dto) => saveProject(projectId, dto),
    onSuccess(project) {
      queryClient.setQueryData(projectKeys.detail(projectId), project);
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
