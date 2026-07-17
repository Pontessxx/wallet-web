import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { exchangeService } from '@/services/exchangeService';
import { useDateFilter } from '@/contexts/DateFilterContext';
import type {
  ExchangeContextType,
  ExchangeHistoryParams,
  ExchangeTransaction,
  ExchangeUpsertRequest,
} from '@/types/exchange';

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined);

interface ExchangeProviderProps {
  children: ReactNode;
}

const ExchangeProvider = ({ children }: ExchangeProviderProps) => {
  const [operations, setOperations] = useState<ExchangeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { periodQuery } = useDateFilter();

  const fetchHistory = async (params?: ExchangeHistoryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await exchangeService.getHistory({
        ...periodQuery,
        ...params,
      });
      setOperations(data);
    } catch (err) {
      setError('Erro ao carregar histórico de operações.');
      console.error('Erro ao carregar histórico de operações:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string) => exchangeService.getById(id);

  const createOperation = async (payload: ExchangeUpsertRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const created = await exchangeService.create(payload);
      setOperations((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError('Erro ao criar operação de bolsa. Tente novamente.');
      console.error('Erro ao criar operação de bolsa:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOperation = async (id: string, payload: ExchangeUpsertRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await exchangeService.update(id, payload);
      setOperations((prev) => prev.map((operation) => (operation.id === updated.id ? updated : operation)));
      return updated;
    } catch (err) {
      setError('Erro ao atualizar operação de bolsa. Tente novamente.');
      console.error('Erro ao atualizar operação de bolsa:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeOperation = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await exchangeService.remove(id);
      setOperations((prev) => prev.filter((operation) => operation.id !== id));
    } catch (err) {
      setError('Erro ao remover operação de bolsa. Tente novamente.');
      console.error('Erro ao remover operação de bolsa:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ExchangeContextType = {
    operations,
    isLoading,
    error,
    fetchHistory,
    getById,
    createOperation,
    updateOperation,
    removeOperation,
  };

  return <ExchangeContext.Provider value={value}>{children}</ExchangeContext.Provider>;
};

export const useExchange = () => {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error('useExchange precisa ser usado dentro de um ExchangeProvider');
  }

  return context;
};

export default ExchangeProvider;
