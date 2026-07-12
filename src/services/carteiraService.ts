import { privateApi } from '@/api/api';
import type {
  Carteira,
  CarteiraSummary,
  CreateCarteiraRequest,
  EditCarteiraRequest,
  WalletType,
} from '@/types/carteira';

export const carteiraService = {
  createAccount: async (data: CreateCarteiraRequest, tipo: WalletType) => {
    const response = await privateApi.post<Carteira>('/wallet/v1/accounts/create', data, {
      headers: {
        'X-WalletType': tipo,
      },
    });
    return response.data;
  },

  editAccount: async (data: EditCarteiraRequest, tipo: WalletType) => {
    const response = await privateApi.put<Carteira>('/wallet/v1/accounts/edit', data, {
      headers: {
        'X-WalletType': tipo,
      },
    });
    return response.data;
  },

  removeAccount: async (id: string, tipo: WalletType) => {
    await privateApi.delete('/wallet/v1/accounts/remove', {
      headers: {
        'X-WalletType': tipo,
      },
      data: { id },
    });
  },

  getSummary: async (tipo: WalletType) => {
    const response = await privateApi.get<CarteiraSummary>('/wallet/v1/summary', {
      headers: {
        'X-WalletType': tipo,
      },
    });
    return response.data;
  },
};