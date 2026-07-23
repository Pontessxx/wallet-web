export type WalletType = 'Investimento' | 'Corrente';
export type WalletFilterType = '-' | WalletType;
export type WalletOrigin = 'Nacional' | 'Exterior';

export interface Carteira {
  id: string;
  nome: string;
  categoria: string;
  origem: WalletOrigin;
  saldoInicial: number;
  receitas: number;
  despesas: number;
  transferencias: number;
  saldo: number;
  saldoProjetado: number;
}

export interface CreateCarteiraRequest {
  nome: string;
  saldoInicial: number;
  origem: WalletOrigin;
}

export interface EditCarteiraRequest {
  id: string;
  nome: string;
  categoria: string;
  origem: WalletOrigin;
}

export interface RemoveCarteiraRequest {
  id: string;
}

export interface CarteiraSummary {
  carteiras: Carteira[];
  saldoTotal: number;
}

export interface CarteiraContextType {
  carteiras: Carteira[];
  saldoTotal: number;
  isLoading: boolean;
  error: string | null;
  fetchSummary: (tipo?: WalletType) => Promise<void>;
  createCarteira: (data: CreateCarteiraRequest, tipo: WalletType) => Promise<Carteira>;
  editCarteira: (data: EditCarteiraRequest, tipo: WalletType) => Promise<Carteira>;
  removeCarteira: (id: string, tipo: WalletType) => Promise<void>;
}