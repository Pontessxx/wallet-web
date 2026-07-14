import { privateApi } from '@/api/api';
import type { Categoria, CreateCategoriaRequest } from '@/types/categoria';

export const categoriaService = {
  list: async () => {
    const response = await privateApi.get<Categoria[]>('/category/v2/list');
    return response.data;
  },

  create: async (data: CreateCategoriaRequest) => {
    const response = await privateApi.post<Categoria>('/category/v2/new', data);
    return response.data;
  },

  remove: async (id: string) => {
    await privateApi.delete('/category/v2/remove', {
      data: { id },
    });
  },
};