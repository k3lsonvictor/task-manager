'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { projectKeys, stepKeys, taskKeys } from '@/lib/query-keys';

const PROJECT_EVENT_TYPES = [
  'project.created',
  'project.updated',
  'project.deleted',
  'step.created',
  'step.updated',
  'step.deleted',
  'task.created',
  'task.updated',
  'task.deleted',
  'task.moved',
  'projectCreated',
  'projectUpdated',
  'projectDeleted',
  'stepCreated',
  'stepUpdated',
  'stepDeleted',
  'taskCreated',
  'taskUpdated',
  'taskDeleted',
  'taskMoved',
] as const;

type ProjectEvent = {
  id?: string;
  type?: string;
  data?: unknown;
};

function parseProjectEvent(event: MessageEvent): ProjectEvent | null {
  if (!event.data) return null;

  try {
    const data = JSON.parse(event.data) as ProjectEvent;
    return {
      ...data,
      type: data.type ?? event.type,
    };
  } catch {
    return {
      type: event.type,
      data: event.data,
    };
  }
}

export function useProjectEvents(projectId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const eventSource = new EventSource(`/api/projects/${projectId}/events`, {
      withCredentials: true,
    });

    function refreshProjectData(event: MessageEvent) {
      const projectEvent = parseProjectEvent(event);

      if (!projectEvent) return;

      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: stepKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
    }

    eventSource.onmessage = refreshProjectData;

    for (const eventType of PROJECT_EVENT_TYPES) {
      eventSource.addEventListener(eventType, refreshProjectData);
    }

    return () => {
      for (const eventType of PROJECT_EVENT_TYPES) {
        eventSource.removeEventListener(eventType, refreshProjectData);
      }

      eventSource.close();
    };
  }, [projectId, queryClient]);
}
