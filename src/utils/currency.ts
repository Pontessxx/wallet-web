import type { WalletOrigin } from '@/types/carteira';

export type CurrencyCode = 'BRL' | 'USD';

export const currencyForOrigem = (origem?: WalletOrigin | null): CurrencyCode =>
  origem === 'Exterior' ? 'USD' : 'BRL';

export const currencyPrefix = (currency: CurrencyCode) => (currency === 'USD' ? 'U$' : 'R$');

export const formatCurrency = (value: number, currency: CurrencyCode = 'BRL') =>
  `${currencyPrefix(currency)} ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
