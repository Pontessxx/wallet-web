import { privateApi } from '@/api/api';
import type {
  CreateGoalOptions,
  CreateGoalRequest,
  Goal,
  GoalListParams,
  GoalListResponse,
  UpdateGoalRequest,
} from '@/types/goal';

export const goalService = {
  list: async (params?: GoalListParams) => {
    const response = await privateApi.get<GoalListResponse>('/goal/v2/list', {
      params,
    });

    return response.data.objetivos ?? [];
  },

  create: async (payload: CreateGoalRequest, options?: CreateGoalOptions) => {
    const response = await privateApi.post<Goal>('/goal/v2/new', payload, {
      params: {
        carteiraId: options?.carteiraId,
      },
    });

    return response.data;
  },

  update: async (id: string, payload: UpdateGoalRequest) => {
    const response = await privateApi.put<Goal>('/goal/v2/edit', payload, {
      params: {
        id,
      },
    });

    return response.data;
  },

  remove: async (id: string) => {
    await privateApi.delete('/goal/v2/remove', {
      params: {
        id,
      },
    });
  },
};
