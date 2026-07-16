import { transactionService } from '@/services/transactionService';
import { toApiErrorMessage } from '@/handlers/apiErrorHandler';
import type { WalletTransferTransaction, WalletTransferUpsertRequest } from '@/types/transaction';

export const transactionHandlers = {
  createTransfer: async (payload: WalletTransferUpsertRequest): Promise<WalletTransferTransaction> => {
    try {
      return await transactionService.createTransfer(payload);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao criar transferência entre carteiras.'));
    }
  },

  updateTransfer: async (
    id: string,
    payload: WalletTransferUpsertRequest
  ): Promise<WalletTransferTransaction> => {
    try {
      return await transactionService.updateTransfer(id, payload);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao atualizar transferência entre carteiras.'));
    }
  },
};
