import type { PeriodQuery } from '@/types/common';

export type ExchangeSide = 'Compra' | 'Venda';

export interface ExchangeTransaction {
  id: string;
  carteiraId: string;
  codigoAtivo: string;
  lado: ExchangeSide;
  quantidade: number;
  precoUnitario: number;
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

export interface ExchangeHistoryResponse {
  transacoes: ExchangeTransaction[];
}

export type ExchangeHistoryParams = PeriodQuery & {
  lado?: ExchangeSide;
};

export interface ExchangeUpsertRequest {
  carteiraId: string;
  lado: ExchangeSide;
  codigoAtivo: string;
  quantidade: number;
  precoUnitario: number;
  encargos: number;
  efetivada: boolean;
  dataLancamento: string;
  dataVencimento?: string | null;
  dataEfetivacao?: string | null;
  observacoes?: string | null;
}

export interface ExchangeContextType {
  operations: ExchangeTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: (params?: ExchangeHistoryParams) => Promise<void>;
  getById: (id: string) => Promise<ExchangeTransaction>;
  createOperation: (payload: ExchangeUpsertRequest) => Promise<ExchangeTransaction>;
  updateOperation: (id: string, payload: ExchangeUpsertRequest) => Promise<ExchangeTransaction>;
  removeOperation: (id: string) => Promise<void>;
}
