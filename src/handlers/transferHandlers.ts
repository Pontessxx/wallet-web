import { transferService } from '@/services/transferService';
import { toApiErrorMessage } from '@/handlers/apiErrorHandler';
import type {
  TransferHistoryParams,
  TransferTransaction,
  TransferUpsertRequest,
} from '@/types/transfer';

export const transferHandlers = {
  getById: async (id: string): Promise<TransferTransaction> => {
    try {
      return await transferService.getById(id);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao buscar lançamento.'));
    }
  },

  history: async (params?: TransferHistoryParams): Promise<TransferTransaction[]> => {
    try {
      return await transferService.getHistory(params);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao buscar histórico de lançamentos.'));
    }
  },

  create: async (payload: TransferUpsertRequest): Promise<TransferTransaction> => {
    try {
      return await transferService.create(payload);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao criar lançamento.'));
    }
  },

  update: async (id: string, payload: TransferUpsertRequest): Promise<TransferTransaction> => {
    try {
      return await transferService.update(id, payload);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao atualizar lançamento.'));
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await transferService.remove(id);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao remover lançamento.'));
    }
  },
};
