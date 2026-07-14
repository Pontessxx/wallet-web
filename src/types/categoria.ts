export type CategoriaIconKey = string;

export interface Categoria {
  id: string;
  nome: string;
  iconKey: CategoriaIconKey;
  colorHex: string;
}

export interface CreateCategoriaRequest {
  nome: string;
  iconKey?: CategoriaIconKey;
  colorHex?: string;
}

export interface CategoriaContextType {
  categorias: Categoria[];
  isLoading: boolean;
  error: string | null;
  fetchCategorias: () => Promise<void>;
  createCategoria: (data: CreateCategoriaRequest) => Promise<Categoria>;
  removeCategoria: (id: string) => Promise<void>;
}