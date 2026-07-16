import type { PeriodQuery } from '@/types/common';

export type TransferType = 'Despesa' | 'Receita' | 'Transferencia';

export interface TransferTransaction {
  id: string;
  carteiraId: string;
  carteiraDestinoId: string | null;
  tipo: TransferType;
  categoriaId: string | null;
  categoriaNome: string | null;
  valor: number;
  encargos: number;
  valorTotal: number;
  efetivada: boolean;
  dataLancamento: string;
  dataVencimento: string | null;
  dataEfetivacao: string | null;
  observacoes: string | null;
  criadaEm: string;
  atualizadaEm: string | null;
}

export interface TransferHistoryResponse {
  transacoes: TransferTransaction[];
}

export type TransferHistoryParams = PeriodQuery & {
  tipo?: Exclude<TransferType, 'Transferencia'>;
  categoriaId?: string;
};

export interface TransferUpsertRequest {
  carteiraId: string;
  tipo: Exclude<TransferType, 'Transferencia'>;
  categoriaId: string;
  valor: number;
  encargos: number;
  efetivada: boolean;
  dataLancamento: string;
  dataVencimento?: string | null;
  dataEfetivacao?: string | null;
  observacoes?: string | null;
}

export interface TransferContextType {
  entries: TransferTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: (params: TransferHistoryParams) => Promise<void>;
  getById: (id: string) => Promise<TransferTransaction>;
  createEntry: (payload: TransferUpsertRequest) => Promise<TransferTransaction>;
  updateEntry: (id: string, payload: TransferUpsertRequest) => Promise<TransferTransaction>;
  removeEntry: (id: string) => Promise<void>;
}
