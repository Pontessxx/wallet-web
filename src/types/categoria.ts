export type CategoriaIconKey = string;

export type CategoriaTipo = 'Despesa' | 'Receita';

export interface Categoria {
  id: string;
  nome: string;
  iconKey: CategoriaIconKey;
  colorHex: string;
  tipo: CategoriaTipo;
}

export interface CreateCategoriaRequest {
  nome: string;
  iconKey?: CategoriaIconKey;
  colorHex?: string;
  tipo: CategoriaTipo;
}

export interface CategoriaContextType {
  categorias: Categoria[];
  isLoading: boolean;
  error: string | null;
  fetchCategorias: () => Promise<void>;
  createCategoria: (data: CreateCategoriaRequest) => Promise<Categoria>;
  removeCategoria: (id: string) => Promise<void>;
}