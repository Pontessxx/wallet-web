const modules = import.meta.glob('/src/assets/*/*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export interface BankCatalogItem {
  nome: string
  url: string
}

// pastas que existem em /assets mas não são bancos individuais
const EXCLUDED_FOLDERS = new Set(['Bancos Escuros (logos negativados)'])

export const bankCatalog: BankCatalogItem[] = Object.entries(modules)
  .map(([path, url]) => {
    const partes = path.split('/')
    const pasta = partes[partes.length - 2] ?? ''
    const arquivo = partes[partes.length - 1] ?? ''
    return { nome: pasta, arquivo, url }
  })
  // só pega o arquivo "Logo.svg" de cada pasta (ignora variantes extras tipo
  // "Logo com nome.svg", "itau-2-laranja.svg" etc.), e ignora a pasta de dark mode
  .filter(
    (item) => item.arquivo.toLowerCase() === 'logo.svg' && !EXCLUDED_FOLDERS.has(item.nome)
  )
  .map(({ nome, url }) => ({ nome, url }))
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))