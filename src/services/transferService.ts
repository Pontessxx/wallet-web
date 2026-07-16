import { privateApi } from '@/api/api';
import type {
  TransferHistoryParams,
  TransferHistoryResponse,
  TransferTransaction,
  TransferUpsertRequest,
} from '@/types/transfer';

export const transferService = {
  getById: async (id: string) => {
    const response = await privateApi.get<TransferTransaction>('/transaction/v2/list', {
      params: { id },
    });

    return response.data;
  },

  getHistory: async (params: TransferHistoryParams) => {
    const response = await privateApi.get<TransferHistoryResponse>('/history/v2/transactions', {
      params,
    });

    return (response.data.transacoes ?? []).filter((entry) => entry.tipo !== 'Transferencia');
  },

  create: async (payload: TransferUpsertRequest) => {
    const response = await privateApi.post<TransferTransaction>('/transaction/v2/new', payload);
    return response.data;
  },

  update: async (id: string, payload: TransferUpsertRequest) => {
    const response = await privateApi.put<TransferTransaction>('/transaction/v2/edit', payload, {
      params: {
        id,
      },
    });

    return response.data;
  },

  remove: async (id: string) => {
    await privateApi.delete('/transaction/v2/remove', {
      params: {
        id,
      },
    });
  },
};
