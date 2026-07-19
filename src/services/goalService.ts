import { privateApi } from '@/api/api';
import type {
  CreateGoalAporteRequest,
  CreateGoalOptions,
  CreateGoalRequest,
  Goal,
  GoalAporteListResponse,
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

  createAporte: async (goalId: string, payload: CreateGoalAporteRequest) => {
    const response = await privateApi.post<Goal>('/goal/v2/aporte/new', payload, {
      params: {
        id: goalId,
      },
    });

    return response.data;
  },

  listAportes: async (goalId: string) => {
    const response = await privateApi.get<GoalAporteListResponse>('/goal/v2/aporte/list', {
      params: {
        id: goalId,
      },
    });

    return response.data.aportes ?? [];
  },

  removeAporte: async (aporteId: string) => {
    const response = await privateApi.delete<Goal>('/goal/v2/aporte/remove', {
      params: {
        id: aporteId,
      },
    });

    return response.data;
  },
};
