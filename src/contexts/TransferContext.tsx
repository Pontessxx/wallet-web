import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { transferService } from '@/services/transferService';
import { useDateFilter } from '@/contexts/DateFilterContext';
import type {
  TransferContextType,
  TransferHistoryParams,
  TransferTransaction,
  TransferUpsertRequest,
} from '@/types/transfer';

const TransferContext = createContext<TransferContextType | undefined>(undefined);

interface TransferProviderProps {
  children: ReactNode;
}

const TransferProvider = ({ children }: TransferProviderProps) => {
  const [entries, setEntries] = useState<TransferTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { periodQuery } = useDateFilter();

  const fetchHistory = async (params?: TransferHistoryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await transferService.getHistory({
        ...periodQuery,
        ...params,
      });
      setEntries(data);
    } catch (err) {
      setError('Erro ao carregar histórico de lançamentos.');
      console.error('Erro ao carregar histórico de lançamentos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string) => transferService.getById(id);

  const createEntry = async (payload: TransferUpsertRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const created = await transferService.create(payload);
      setEntries((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError('Erro ao criar lançamento. Tente novamente.');
      console.error('Erro ao criar lançamento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (id: string, payload: TransferUpsertRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await transferService.update(id, payload);
      setEntries((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
      return updated;
    } catch (err) {
      setError('Erro ao atualizar lançamento. Tente novamente.');
      console.error('Erro ao atualizar lançamento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeEntry = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await transferService.remove(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      setError('Erro ao remover lançamento. Tente novamente.');
      console.error('Erro ao remover lançamento:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: TransferContextType = {
    entries,
    isLoading,
    error,
    fetchHistory,
    getById,
    createEntry,
    updateEntry,
    removeEntry,
  };

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
};

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error('useTransfer precisa ser usado dentro de um TransferProvider');
  }

  return context;
};

export default TransferProvider;
