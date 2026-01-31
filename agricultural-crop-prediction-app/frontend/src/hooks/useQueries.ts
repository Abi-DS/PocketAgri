import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Field, Location, CropPrediction, DiseaseScan, ChatMessage, ExternalBlob } from '../backend';
import type { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Field Queries
export function useGetFieldsByUser(userId: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Field[]>({
    queryKey: ['fields', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFieldsByUser(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useAddField() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ name, location, notes }: { name: string; location: Location; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addField(name, location, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields', identity?.getPrincipal().toString()] });
    },
  });
}

// Prediction Queries
export function useGetPredictionsByField(fieldId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<CropPrediction[]>({
    queryKey: ['predictions', fieldId?.toString()],
    queryFn: async () => {
      if (!actor || !fieldId) return [];
      return actor.getPredictionsByField(fieldId);
    },
    enabled: !!actor && !isFetching && !!fieldId,
  });
}

export function useMakePrediction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, crop }: { fieldId: bigint; crop: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.makePrediction(fieldId, crop);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['predictions', variables.fieldId.toString()] });
    },
  });
}

// Disease Scan Queries
export function useGetDiseasesByUser(userId: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<DiseaseScan[]>({
    queryKey: ['diseaseScans', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getDiseasesByUser(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useUploadScan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ fieldId, plantType, image }: { fieldId: bigint; plantType: string; image: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadScan(fieldId, plantType, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diseaseScans', identity?.getPrincipal().toString()] });
    },
  });
}

// Chat Queries
export function useGetChatHistory(userId: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['chatHistory', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getChatHistory(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', identity?.getPrincipal().toString()] });
    },
  });
}
