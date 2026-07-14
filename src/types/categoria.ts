export interface Categoria {
  id: string;
  nome: string;
}

export interface CreateCategoriaRequest {
  nome: string;
}

export interface CategoriaContextType {
  categorias: Categoria[];
  isLoading: boolean;
  error: string | null;
  fetchCategorias: () => Promise<void>;
  createCategoria: (data: CreateCategoriaRequest) => Promise<Categoria>;
  removeCategoria: (id: string) => Promise<void>;
}