import { bankCatalog } from './bankCatalog'

const STOP_WORDS = ['banco', 'sa', 'ltda']

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[().-/]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.includes(word))
    .join(' ')
    .trim()

export const getBankLogo = (nomeCarteira: string): string | null => {
  const alvo = normalize(nomeCarteira)
  if (!alvo) return null

  let melhor: { url: string; score: number } | null = null

  for (const banco of bankCatalog) {
    const candidato = normalize(banco.nome)
    if (!candidato) continue

    const bate = alvo.includes(candidato) || candidato.includes(alvo)
    if (!bate) continue

    const score = candidato.length // prioriza o match mais específico
    if (!melhor || score > melhor.score) {
      melhor = { url: banco.url, score }
    }
  }

  return melhor?.url ?? null
}