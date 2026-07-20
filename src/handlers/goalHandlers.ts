import { goalService } from '@/services/goalService';
import { toApiErrorMessage } from '@/handlers/apiErrorHandler';
import type {
  CreateGoalAporteRequest,
  CreateGoalOptions,
  CreateGoalRequest,
  Goal,
  GoalAporte,
  GoalListParams,
  UpdateGoalRequest,
} from '@/types/goal';

export const goalHandlers = {
  list: async (params?: GoalListParams): Promise<Goal[]> => {
    try {
      return await goalService.list(params);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao listar objetivos.'));
    }
  },

  create: async (payload: CreateGoalRequest, options?: CreateGoalOptions): Promise<Goal> => {
    try {
      return await goalService.create(payload, options);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao criar objetivo.'));
    }
  },

  update: async (id: string, payload: UpdateGoalRequest): Promise<Goal> => {
    try {
      return await goalService.update(id, payload);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao atualizar objetivo.'));
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await goalService.remove(id);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao remover objetivo.'));
    }
  },

  createAporte: async (goalId: string, payload: CreateGoalAporteRequest): Promise<Goal> => {
    try {
      return await goalService.createAporte(goalId, payload);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao registrar deposito.'));
    }
  },

  listAportes: async (goalId: string): Promise<GoalAporte[]> => {
    try {
      return await goalService.listAportes(goalId);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao listar depositos.'));
    }
  },

  removeAporte: async (aporteId: string): Promise<Goal> => {
    try {
      return await goalService.removeAporte(aporteId);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao remover deposito.'));
    }
  },
};
