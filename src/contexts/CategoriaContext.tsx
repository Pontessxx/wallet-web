import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  Categoria,
  CategoriaContextType,
  CreateCategoriaRequest,
} from '@/types/categoria';
import { categoriaService } from '@/services/categoriaService';

const CategoriaContext = createContext<CategoriaContextType | undefined>(undefined);

interface CategoriaProviderProps {
  children: ReactNode;
}

const CategoriaProvider = ({ children }: CategoriaProviderProps) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await categoriaService.list();
      setCategorias(data ?? []);
    } catch (err) {
      setError('Erro ao carregar categorias.');
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategoria = async (data: CreateCategoriaRequest): Promise<Categoria> => {
    setIsLoading(true);
    setError(null);

    try {
      const novaCategoria = await categoriaService.create(data);
      setCategorias((prev) => [...prev, novaCategoria]);
      return novaCategoria;
    } catch (err) {
      setError('Erro ao criar categoria. Tente novamente.');
      console.error('Erro ao criar categoria:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCategoria = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await categoriaService.remove(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError('Erro ao remover categoria. Tente novamente.');
      console.error('Erro ao remover categoria:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: CategoriaContextType = {
    categorias,
    isLoading,
    error,
    fetchCategorias,
    createCategoria,
    removeCategoria,
  };

  return <CategoriaContext.Provider value={value}>{children}</CategoriaContext.Provider>;
};

export const useCategoria = () => {
  const context = useContext(CategoriaContext);
  if (!context) {
    throw new Error('useCategoria precisa ser usado dentro de um CategoriaProvider');
  }
  return context;
};

export default CategoriaProvider;