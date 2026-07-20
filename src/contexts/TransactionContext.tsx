import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { transactionService } from '@/services/transactionService';
import type {
  TransactionContextType,
  WalletTransferTransaction,
  WalletTransferUpsertRequest,
} from '@/types/transaction';

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

const TransactionProvider = ({ children }: TransactionProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransfer = async (payload: WalletTransferUpsertRequest): Promise<WalletTransferTransaction> => {
    setIsLoading(true);
    setError(null);

    try {
      return await transactionService.createTransfer(payload);
    } catch (err) {
      setError('Erro ao criar transferência. Tente novamente.');
      console.error('Erro ao criar transferência:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransfer = async (
    id: string,
    payload: WalletTransferUpsertRequest
  ): Promise<WalletTransferTransaction> => {
    setIsLoading(true);
    setError(null);

    try {
      return await transactionService.updateTransfer(id, payload);
    } catch (err) {
      setError('Erro ao atualizar transferência. Tente novamente.');
      console.error('Erro ao atualizar transferência:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeTransfer = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await transactionService.removeTransfer(id);
    } catch (err) {
      setError('Erro ao remover transferência. Tente novamente.');
      console.error('Erro ao remover transferência:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: TransactionContextType = {
    isLoading,
    error,
    createTransfer,
    updateTransfer,
    removeTransfer,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction precisa ser usado dentro de um TransactionProvider');
  }

  return context;
};

export default TransactionProvider;
