import { privateApi } from '@/api/api';
import type {
  Carteira,
  CarteiraSummary,
  CreateCarteiraRequest,
  EditCarteiraRequest,
  WalletType,
} from '@/types/carteira';
import type { PeriodQuery } from '@/types/common';

export const carteiraService = {
  createAccount: async (data: CreateCarteiraRequest, tipo: WalletType) => {
    const response = await privateApi.post<Carteira>('/wallet/v2/accounts/create', data, {
      headers: {
        'X-WalletType': tipo,
      },
    });
    return response.data;
  },

  editAccount: async (data: EditCarteiraRequest, _tipo: WalletType) => {
    const response = await privateApi.put<Carteira>('/wallet/v2/accounts/edit', data);
    return response.data;
  },

  removeAccount: async (id: string) => {
    await privateApi.delete('/wallet/v2/accounts/remove', {
      data: { id },
    });
  },

  getSummary: async (tipo?: WalletType, period?: PeriodQuery) => {
    const params = {
      ...(tipo ? { categoria: tipo } : {}),
      ...(period ?? {}),
    };

    const response = await privateApi.get<CarteiraSummary>('/wallet/v2/summary', {
      params,
    });
    return response.data;
  },
};