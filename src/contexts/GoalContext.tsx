import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { goalService } from '@/services/goalService';
import { useDateFilter } from '@/contexts/DateFilterContext';
import type {
  CreateGoalAporteRequest,
  CreateGoalOptions,
  CreateGoalRequest,
  Goal,
  GoalContextType,
  GoalListParams,
  UpdateGoalRequest,
} from '@/types/goal';

const GoalContext = createContext<GoalContextType | undefined>(undefined);

interface GoalProviderProps {
  children: ReactNode;
}

const GoalProvider = ({ children }: GoalProviderProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { periodQuery } = useDateFilter();

  const fetchGoals = async (params?: GoalListParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await goalService.list({
        ...periodQuery,
        ...params,
      });
      setGoals(data);
    } catch (err) {
      setError('Erro ao carregar objetivos.');
      console.error('Erro ao carregar objetivos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (payload: CreateGoalRequest, options?: CreateGoalOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const created = await goalService.create(payload, options);
      setGoals((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError('Erro ao criar objetivo. Tente novamente.');
      console.error('Erro ao criar objetivo:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoal = async (id: string, payload: UpdateGoalRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await goalService.update(id, payload);
      setGoals((prev) => prev.map((goal) => (goal.id === updated.id ? updated : goal)));
      return updated;
    } catch (err) {
      setError('Erro ao atualizar objetivo. Tente novamente.');
      console.error('Erro ao atualizar objetivo:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeGoal = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await goalService.remove(id);
      setGoals((prev) => prev.filter((goal) => goal.id !== id));
    } catch (err) {
      setError('Erro ao remover objetivo. Tente novamente.');
      console.error('Erro ao remover objetivo:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createGoalAporte = async (goalId: string, payload: CreateGoalAporteRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await goalService.createAporte(goalId, payload);
      setGoals((prev) => prev.map((goal) => (goal.id === updated.id ? updated : goal)));
      return updated;
    } catch (err) {
      setError('Erro ao registrar deposito. Tente novamente.');
      console.error('Erro ao registrar deposito:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGoalAportes = async (goalId: string) => {
    try {
      return await goalService.listAportes(goalId);
    } catch (err) {
      setError('Erro ao carregar depositos.');
      console.error('Erro ao carregar depositos:', err);
      throw err;
    }
  };

  const removeGoalAporte = async (aporteId: string) => {
    setError(null);

    try {
      const updated = await goalService.removeAporte(aporteId);
      setGoals((prev) => prev.map((goal) => (goal.id === updated.id ? updated : goal)));
      return updated;
    } catch (err) {
      setError('Erro ao remover deposito. Tente novamente.');
      console.error('Erro ao remover deposito:', err);
      throw err;
    }
  };

  const value: GoalContextType = {
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    removeGoal,
    createGoalAporte,
    fetchGoalAportes,
    removeGoalAporte,
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
};

export const useGoal = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoal precisa ser usado dentro de um GoalProvider');
  }

  return context;
};

export default GoalProvider;
