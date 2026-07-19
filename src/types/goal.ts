import type { PeriodQuery } from '@/types/common';

export interface Goal {
  id: string;
  nome: string;
  iconKey: string;
  valorTotal: number;
  meses: number;
  valorMensal: number;
  valorAportado: number;
  valorRestante: number;
  percentualConcluido: number;
  usaAporteManual: boolean;
  carteiraId: string | null;
  carteiraNome: string | null;
  criadaEm: string;
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
  iconKey?: string;
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
  iconKey?: string;
}

export interface GoalAporte {
  id: string;
  valor: number;
  data: string;
  observacao: string | null;
  recorrente: boolean;
  criadoEm: string;
}

export interface GoalAporteListResponse {
  aportes: GoalAporte[];
}

export interface CreateGoalAporteRequest {
  valor: number;
  data: string;
  observacao?: string;
  recorrente?: boolean;
}

export interface GoalContextType {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: (params?: GoalListParams) => Promise<void>;
  createGoal: (payload: CreateGoalRequest, options?: CreateGoalOptions) => Promise<Goal>;
  updateGoal: (id: string, payload: UpdateGoalRequest) => Promise<Goal>;
  removeGoal: (id: string) => Promise<void>;
  createGoalAporte: (goalId: string, payload: CreateGoalAporteRequest) => Promise<Goal>;
  fetchGoalAportes: (goalId: string) => Promise<GoalAporte[]>;
  removeGoalAporte: (aporteId: string) => Promise<Goal>;
}
