import { exchangeService } from '@/services/exchangeService';
import { toApiErrorMessage } from '@/handlers/apiErrorHandler';
import type {
  ExchangeHistoryParams,
  ExchangeTransaction,
  ExchangeUpsertRequest,
} from '@/types/exchange';

export const exchangeHandlers = {
  getById: async (id: string): Promise<ExchangeTransaction> => {
    try {
      return await exchangeService.getById(id);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao buscar operação de bolsa.'));
    }
  },

  history: async (params: ExchangeHistoryParams): Promise<ExchangeTransaction[]> => {
    try {
      return await exchangeService.getHistory(params);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao buscar histórico de operações.'));
    }
  },

  create: async (payload: ExchangeUpsertRequest): Promise<ExchangeTransaction> => {
    try {
      return await exchangeService.create(payload);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao criar operação de bolsa.'));
    }
  },

  update: async (id: string, payload: ExchangeUpsertRequest): Promise<ExchangeTransaction> => {
    try {
      return await exchangeService.update(id, payload);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao atualizar operação de bolsa.'));
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await exchangeService.remove(id);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao remover operação de bolsa.'));
    }
  },
};
