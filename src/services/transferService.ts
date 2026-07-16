import { privateApi } from '@/api/api';
import type {
  TransferHistoryParams,
  TransferHistoryResponse,
  TransferTransaction,
  TransferUpsertRequest,
} from '@/types/transfer';

export const transferService = {
  getById: async (id: string) => {
    const response = await privateApi.get<TransferTransaction>('/transfer/v2/list', {
      params: { id },
    });

    return response.data;
  },

  getHistory: async (params: TransferHistoryParams) => {
    const response = await privateApi.get<TransferHistoryResponse>('/transfer/v2/history', {
      params,
    });

    return response.data.transacoes ?? [];
  },

  create: async (payload: TransferUpsertRequest) => {
    const response = await privateApi.post<TransferTransaction>('/transfer/v2/new', payload);
    return response.data;
  },

  update: async (id: string, payload: TransferUpsertRequest) => {
    const response = await privateApi.put<TransferTransaction>('/transfer/v2/edit', payload, {
      params: {
        id,
      },
    });

    return response.data;
  },

  remove: async (id: string) => {
    await privateApi.delete('/transfer/v2/remove', {
      params: {
        id,
      },
    });
  },
};
