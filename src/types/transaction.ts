export interface WalletTransferTransaction {
  id: string;
  carteiraId: string;
  carteiraDestinoId: string;
  tipo: 'Transferencia';
  categoriaId: null;
  categoriaNome: null;
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

export interface WalletTransferUpsertRequest {
  carteiraId: string;
  carteiraDestinoId: string;
  valor: number;
  encargos: number;
  efetivada: boolean;
  dataLancamento: string;
  dataVencimento?: string | null;
  dataEfetivacao?: string | null;
  observacoes?: string | null;
}

export interface TransactionContextType {
  isLoading: boolean;
  error: string | null;
  createTransfer: (payload: WalletTransferUpsertRequest) => Promise<WalletTransferTransaction>;
  updateTransfer: (id: string, payload: WalletTransferUpsertRequest) => Promise<WalletTransferTransaction>;
  removeTransfer: (id: string) => Promise<void>;
}
