import { privateApi } from '@/api/api';
import type { WalletTransferTransaction, WalletTransferUpsertRequest } from '@/types/transaction';

export const transactionService = {
  createTransfer: async (payload: WalletTransferUpsertRequest) => {
    const response = await privateApi.post<WalletTransferTransaction>('/transfer/v2/new', payload);
    return response.data;
  },

  updateTransfer: async (id: string, payload: WalletTransferUpsertRequest) => {
    const response = await privateApi.put<WalletTransferTransaction>('/transfer/v2/edit', payload, {
      params: {
        id,
      },
    });

    return response.data;
  },
};
