import { carteiraService } from '@/services/carteiraService';
import { toApiErrorMessage } from '@/handlers/apiErrorHandler';
import type {
  Carteira,
  CarteiraSummary,
  CreateCarteiraRequest,
  EditCarteiraRequest,
  WalletType,
} from '@/types/carteira';
import type { PeriodQuery } from '@/types/common';

export const carteiraHandlers = {
  create: async (payload: CreateCarteiraRequest, tipo: WalletType): Promise<Carteira> => {
    try {
      return await carteiraService.createAccount(payload, tipo);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao criar carteira.'));
    }
  },

  edit: async (payload: EditCarteiraRequest, tipo: WalletType): Promise<Carteira> => {
    try {
      return await carteiraService.editAccount(payload, tipo);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao editar carteira.'));
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await carteiraService.removeAccount(id);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao remover carteira.'));
    }
  },

  summary: async (tipo?: WalletType, period?: PeriodQuery): Promise<CarteiraSummary> => {
    try {
      return await carteiraService.getSummary(tipo, period);
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Erro ao buscar resumo das carteiras.'));
    }
  },
};
