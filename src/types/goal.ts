import type { PeriodQuery } from '@/types/common';

export interface Goal {
  id: string;
  nome: string;
  valorTotal: number;
  meses: number;
  valorMensal: number;
  valorAportado: number;
  valorRestante: number;
  percentualConcluido: number;
  usaAporteManual: boolean;
  carteiraId: string | null;
}

export interface GoalListResponse {
  objetivos: Goal[];
}

export type GoalListParams = Partial<PeriodQuery> & {
  id?: string;
  carteiraId?: string;
};

export interface CreateGoalRequest {
  nome: string;
  valorTotal: number;
  meses: number;
}

export interface CreateGoalOptions {
  carteiraId?: string;
}

export interface UpdateGoalRequest {
  nome: string;
  valorTotal: number;
  meses: number;
  carteiraId?: string | null;
  aporteManual?: number;
}

export interface GoalContextType {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: (params?: GoalListParams) => Promise<void>;
  createGoal: (payload: CreateGoalRequest, options?: CreateGoalOptions) => Promise<Goal>;
  updateGoal: (id: string, payload: UpdateGoalRequest) => Promise<Goal>;
  removeGoal: (id: string) => Promise<void>;
}
