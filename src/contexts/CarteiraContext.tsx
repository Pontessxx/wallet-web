import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  Carteira,
  CarteiraContextType,
  CreateCarteiraRequest,
  EditCarteiraRequest,
  WalletType,
} from '@/types/carteira';
import { carteiraService } from '@/services/carteiraService';

const CarteiraContext = createContext<CarteiraContextType | undefined>(undefined);

interface CarteiraProviderProps {
  children: ReactNode;
}

const CarteiraProvider = ({ children }: CarteiraProviderProps) => {
  const [carteiras, setCarteiras] = useState<Carteira[]>([]);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async (tipo: WalletType) => {
    setIsLoading(true);
    setError(null);

    try {
        const data = await carteiraService.getSummary(tipo);
        setCarteiras(data.carteiras ?? []);
        setSaldoTotal(data.saldoTotal ?? 0);
    } catch (err) {
        setError('Erro ao carregar carteiras.');
        console.error('Erro ao carregar resumo:', err);
    } finally {
        setIsLoading(false);
    }
    };

  const createCarteira = async (
    data: CreateCarteiraRequest,
    tipo: WalletType
  ): Promise<Carteira> => {
    setIsLoading(true);
    setError(null);

    try {
      const novaCarteira = await carteiraService.createAccount(data, tipo);
      setCarteiras((prev) => [...prev, novaCarteira]);
      return novaCarteira;
    } catch (err) {
      setError('Erro ao criar carteira. Tente novamente.');
      console.error('Erro ao criar carteira:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const editCarteira = async (
    data: EditCarteiraRequest,
    tipo: WalletType
  ): Promise<Carteira> => {
    setIsLoading(true);
    setError(null);

    try {
      const carteiraEditada = await carteiraService.editAccount(data, tipo);
      setCarteiras((prev) =>
        prev.map((c) => (c.id === carteiraEditada.id ? carteiraEditada : c))
      );
      return carteiraEditada;
    } catch (err) {
      setError('Erro ao editar carteira. Tente novamente.');
      console.error('Erro ao editar carteira:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCarteira = async (id: string, tipo: WalletType): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await carteiraService.removeAccount(id, tipo);
      setCarteiras((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError('Erro ao remover carteira. Tente novamente.');
      console.error('Erro ao remover carteira:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: CarteiraContextType = {
    carteiras,
    saldoTotal,
    isLoading,
    error,
    fetchSummary,
    createCarteira,
    editCarteira,
    removeCarteira,
  };

  return <CarteiraContext.Provider value={value}>{children}</CarteiraContext.Provider>;
};

export const useCarteira = () => {
  const context = useContext(CarteiraContext);
  if (!context) {
    throw new Error('useCarteira precisa ser usado dentro de um CarteiraProvider');
  }
  return context;
};

export default CarteiraProvider;