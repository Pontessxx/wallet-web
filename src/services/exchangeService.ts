import { privateApi } from '@/api/api';
import type {
  ExchangeHistoryParams,
  ExchangeHistoryResponse,
  ExchangeTransaction,
  ExchangeUpsertRequest,
} from '@/types/exchange';

export const exchangeService = {
  getById: async (id: string) => {
    const response = await privateApi.get<ExchangeTransaction>('/exchange/v2/list', {
      params: { id },
    });

    return response.data;
  },

  getHistory: async (params: ExchangeHistoryParams) => {
    const response = await privateApi.get<ExchangeHistoryResponse>('/exchange/v2/history', {
      params,
    });

    return response.data.transacoes ?? [];
  },

  create: async (payload: ExchangeUpsertRequest) => {
    const response = await privateApi.post<ExchangeTransaction>('/exchange/v2/new', payload);
    return response.data;
  },

  update: async (id: string, payload: ExchangeUpsertRequest) => {
    const response = await privateApi.put<ExchangeTransaction>('/exchange/v2/edit', payload, {
      params: {
        id,
      },
    });

    return response.data;
  },

  remove: async (id: string) => {
    await privateApi.delete('/exchange/v2/remove', {
      params: {
        id,
      },
    });
  },
};
