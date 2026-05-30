'use client';

import { createStepDto, type Step } from '@/lib/api/api';
import { createStep, deleteStep, loadSteps, saveStep } from "../api/client-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stepKeys, taskKeys } from '../query-keys';

export function useSteps(projectId: string) {
    return useQuery<Step[]>({
        queryKey: stepKeys.byProject(projectId),
        queryFn: () => loadSteps(projectId),
        enabled: Boolean(projectId),
    });
}

export function useCreateStep() {
    const queryClient = useQueryClient();

    return useMutation<Step, Error, createStepDto>({
        mutationFn: createStep,
        onSuccess(step, variables) {
            queryClient.setQueryData<Step[]>(stepKeys.all, (steps) => (
                steps ? [...steps, step] : [step]
              ));
              queryClient.setQueryData<Step[]>(stepKeys.byProject(variables.projectId), (steps) => (
                steps ? [...steps, step] : [step]
              ));
              queryClient.setQueryData(stepKeys.detail(step.id), step);
        }
    })
}

export function useUpdateSteps(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation<Step[], Error, Step[], { previousSteps?: Step[] }>({
        mutationFn: async (nextSteps) => {
            const updatedSteps = await Promise.all(
                nextSteps.map((step) => (
                    saveStep(projectId, step.id, {
                        name: step.name,
                        position: step.position,
                    })
                ))
            );

            return updatedSteps;
        },
        onMutate(nextSteps) {
            const previousSteps = queryClient.getQueryData<Step[]>(stepKeys.byProject(projectId));
            queryClient.setQueryData(stepKeys.byProject(projectId), nextSteps);

            return { previousSteps };
        },
        onError(_error, _nextSteps, context) {
            if (context?.previousSteps) {
                queryClient.setQueryData(stepKeys.byProject(projectId), context.previousSteps);
            }
        },
        onSuccess(updatedSteps) {
            for (const step of updatedSteps) {
                queryClient.setQueryData(stepKeys.detail(step.id), step);
            }
        },
        onSettled() {
            queryClient.invalidateQueries({ queryKey: stepKeys.byProject(projectId) });
        },
    });
}

export function useDeleteStep(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string, { previousSteps?: Step[] }>({
        mutationFn: (stepId) => deleteStep(projectId, stepId),
        onMutate(stepId) {
            const previousSteps = queryClient.getQueryData<Step[]>(stepKeys.byProject(projectId));
            queryClient.setQueryData<Step[]>(stepKeys.byProject(projectId), (steps) => (
                steps
                    ?.filter((step) => step.id !== stepId)
                    .map((step, index) => ({ ...step, position: index })) ?? []
            ));

            return { previousSteps };
        },
        onError(_error, _stepId, context) {
            if (context?.previousSteps) {
                queryClient.setQueryData(stepKeys.byProject(projectId), context.previousSteps);
            }
        },
        onSuccess(_data, stepId) {
            queryClient.removeQueries({ queryKey: stepKeys.detail(stepId) });
        },
        onSettled() {
            queryClient.invalidateQueries({ queryKey: stepKeys.byProject(projectId) });
            queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
        },
    });
}
