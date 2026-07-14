import { privateApi } from '@/api/api';
import type { Categoria, CreateCategoriaRequest } from '@/types/categoria';
import { DEFAULT_CATEGORIA_COLOR, DEFAULT_CATEGORIA_ICON } from '@/utils/categoriaVisuals';

type CategoriaListResponse =
  | Categoria[]
  | {
      categorias?: Categoria[];
      Categorias?: Categoria[];
    };

export const categoriaService = {
  list: async () => {
    const response = await privateApi.get<CategoriaListResponse>('/category/v2/list');
    const { data } = response;

    const normalize = (categoria: Partial<Categoria>): Categoria => ({
      id: categoria.id ?? '',
      nome: categoria.nome ?? '',
      iconKey: categoria.iconKey ?? DEFAULT_CATEGORIA_ICON,
      colorHex: categoria.colorHex ?? DEFAULT_CATEGORIA_COLOR,
    });

    if (Array.isArray(data)) {
      return data.map(normalize);
    }

    return (data.categorias ?? data.Categorias ?? []).map(normalize);
  },

  create: async (data: CreateCategoriaRequest) => {
    const response = await privateApi.post<Categoria>('/category/v2/new', data);
    return {
      ...response.data,
      iconKey: response.data.iconKey ?? DEFAULT_CATEGORIA_ICON,
      colorHex: response.data.colorHex ?? DEFAULT_CATEGORIA_COLOR,
    };
  },

  remove: async (id: string) => {
    await privateApi.delete('/category/v2/remove', {
      params: { id },
    });
  },
};