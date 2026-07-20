import { http, HttpResponse } from 'msw';
import type { Carteira, WalletType } from '@/types/carteira';
import type { Categoria, CategoriaIconKey, CategoriaTipo } from '@/types/categoria';
import type { TransferTransaction, TransferUpsertRequest } from '@/types/transfer';
import type { ExchangeTransaction, ExchangeUpsertRequest } from '@/types/exchange';
import type { WalletTransferUpsertRequest } from '@/types/transaction';
import type { Goal, GoalAporte } from '@/types/goal';

const REFRESH_COOKIE_NAME = 'refreshToken';

// Helper pra checar se a request tem um Bearer token válido (mock simplificado)
const getBearerToken = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '');
};

// Helper pra checar se o cookie de refresh token está presente
const hasRefreshCookie = (request: Request): boolean => {
  const cookieHeader = request.headers.get('cookie') ?? '';
  return cookieHeader.includes(`${REFRESH_COOKIE_NAME}=`);
};

// Helper pra pegar e validar o header X-WalletType
const getWalletType = (request: Request): WalletType | null => {
  const tipo = request.headers.get('X-WalletType');
  if (tipo === 'Corrente' || tipo === 'Investimento') return tipo;
  return null;
};

const findWalletById = (walletId: string): Carteira | undefined =>
  [...carteiraDb.Corrente, ...carteiraDb.Investimento].find((wallet) => wallet.id === walletId);

// Guarda o usuário "logado" no mock, setado no login e limpo no logout/remove
let loggedInUser: { id: string; username: string } | null = null;

// Helper pra pegar o id mockado a partir do username (mesma regra usada no login)
const getUserIdFromUsername = (username: string): string =>
  username === 'admin' ? '3' : 'mock-user-id';

// "Banco" em memória das carteiras, segmentado por tipo
const carteiraDb: Record<WalletType, Carteira[]> = {
  Corrente: [
    {
      id: 'mock-1',
      nome: 'CarteiraTeste',
      categoria: 'Corrente',
      saldoInicial: 0,
      receitas: 0,
      despesas: 0,
      transferencias: 0,
      saldo: 0,
      saldoProjetado: 0,
    },
    {
      id: 'mock-2',
      nome: 'Alelo',
      categoria: 'Corrente',
      saldoInicial: 1500,
      receitas: 0,
      despesas: 0,
      transferencias: 0,
      saldo: 1500,
      saldoProjetado: 0,
    },
    {
      id: 'mock-3',
      nome: 'XP Investimentos',
      categoria: 'Corrente',
      saldoInicial: 12000,
      receitas: 0,
      despesas: 0,
      transferencias: 0,
      saldo: 12000,
      saldoProjetado: 0,
    },
    {
      id: 'mock-4',
      nome: 'Bradesco S.A',
      categoria: 'Corrente',
      saldoInicial: 3500,
      receitas: 0,
      despesas: 0,
      transferencias: 0,
      saldo: 3500,
      saldoProjetado: 0,
    },
  ],

  Investimento: [
    {
      id: 'mock-5',
      nome: 'XP',
      categoria: 'Investimento',
      saldoInicial: 0,
      receitas: 0,
      despesas: 0,
      transferencias: 0,
      saldo: 0,
      saldoProjetado: 0,
    },
  ],
};

// "Banco" em memória das categorias
const DEFAULT_CATEGORIA_ICON: CategoriaIconKey = 'tag';
const DEFAULT_CATEGORIA_COLOR = '#64748B';
const ICON_KEY_ALLOWLIST: CategoriaIconKey[] = [
  'tag',
  'shopping-cart',
  'car',
  'house',
  'briefcase',
  'heart-pulse',
  'book-open',
  'gamepad-2',
  'plane',
  'utensils',
];

const COLOR_HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

let categoriaDb: Categoria[] = [
  {
    id: 'cat-mock-1',
    nome: 'Alimentação',
    iconKey: 'utensils',
    colorHex: '#F97316',
    tipo: 'Despesa',
  },
  {
    id: 'cat-mock-2',
    nome: 'Transporte',
    iconKey: 'car',
    colorHex: '#3B82F6',
    tipo: 'Despesa',
  },
  {
    id: 'cat-mock-3',
    nome: 'Lazer',
    iconKey: 'gamepad-2',
    colorHex: '#8B5CF6',
    tipo: 'Despesa',
  },
  {
    id: 'cat-mock-4',
    nome: 'Salário',
    iconKey: 'briefcase',
    colorHex: '#06B6D4',
    tipo: 'Receita',
  },
];

let goalDb: Goal[] = [
  { id: 'goal-mock-1', nome: 'GARMIN 570 music', iconKey: 'watch', valorTotal: 2953.84, meses: 6, valorMensal: 408.97, valorAportado: 500, valorRestante: 2453.84, percentualConcluido: 17, carteiraId: null, carteiraNome: null, criadaEm: '2026-01-18T00:00:00.000Z' },
  { id: 'goal-mock-2', nome: 'Viagem', iconKey: 'plane', valorTotal: 17000, meses: 18, valorMensal: 819.3, valorAportado: 2252.59, valorRestante: 14747.41, percentualConcluido: 13, carteiraId: null, carteiraNome: null, criadaEm: '2026-01-18T00:00:00.000Z' },
  { id: 'goal-mock-3', nome: 'Pós graduação', iconKey: 'graduation-cap', valorTotal: 13500, meses: 12, valorMensal: 1125, valorAportado: 13545.21, valorRestante: 0, percentualConcluido: 100, carteiraId: null, carteiraNome: null, criadaEm: '2025-07-18T00:00:00.000Z' },
  { id: 'goal-mock-4', nome: 'Relógio', iconKey: 'target', valorTotal: 1700, meses: 4, valorMensal: 425, valorAportado: 1699.99, valorRestante: 0, percentualConcluido: 100, carteiraId: null, carteiraNome: null, criadaEm: '2025-11-18T00:00:00.000Z' },
];

const recalcGoal = (goal: Goal): Goal => {
  const valorAportado = (goalAporteDb[goal.id] ?? []).reduce((sum, aporte) => sum + aporte.valor, 0);
  return {
    ...goal,
    valorAportado,
    valorRestante: Math.max(goal.valorTotal - valorAportado, 0),
    percentualConcluido: goal.valorTotal > 0 ? Math.min(Math.round((valorAportado / goal.valorTotal) * 100), 100) : 0,
  };
};

const goalAporteDb: Record<string, GoalAporte[]> = {};

const addAporteFromTransacao = (objetivoId: string, transacao: TransferTransaction) => {
  const aporte: GoalAporte = {
    id: crypto.randomUUID(),
    valor: transacao.valor,
    data: transacao.dataLancamento,
    observacao: transacao.observacoes,
    recorrente: false,
    criadoEm: new Date().toISOString(),
    transacaoId: transacao.id,
  };

  goalAporteDb[objetivoId] = [aporte, ...(goalAporteDb[objetivoId] ?? [])];
  const goal = goalDb.find((g) => g.id === objetivoId);
  if (goal) {
    goalDb = goalDb.map((g) => (g.id === objetivoId ? recalcGoal(g) : g));
  }
};

const removeAporteByTransacaoId = (transacaoId: string) => {
  for (const objetivoId of Object.keys(goalAporteDb)) {
    const before = goalAporteDb[objetivoId] ?? [];
    const after = before.filter((a) => a.transacaoId !== transacaoId);

    if (after.length !== before.length) {
      goalAporteDb[objetivoId] = after;
      goalDb = goalDb.map((g) => (g.id === objetivoId ? recalcGoal(g) : g));
    }
  }
};

// "Banco" em memória de usuários válidos (mock simplificado pro fluxo de senha)
const userDb: Record<string, { password: string }> = {
  admin: { password: 'admin' }, // usuário padrão, usado pro resto dos fluxos
  userChangePass: { password: 'senha123' }, // usuário dedicado só pro fluxo de "esqueci minha senha"
};

// Códigos de redefinição gerados, por username
const resetCodeDb: Record<string, { code: string; expiresAt: number }> = {};

const RESET_CODE_TTL_MS = 5 * 60 * 1000; // 5 minutos

const parsePeriodRange = (url: URL): { start: Date; endExclusive: Date } | null => {
  const periodType = url.searchParams.get('periodType');
  if (!periodType) return null;

  if (periodType === 'range') {
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    if (!startDate || !endDate) return null;

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const endExclusive = new Date(`${endDate}T00:00:00.000Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

    if (Number.isNaN(start.getTime()) || Number.isNaN(endExclusive.getTime())) return null;
    return { start, endExclusive };
  }

  if (periodType === 'monthly') {
    const year = Number(url.searchParams.get('year'));
    const month = Number(url.searchParams.get('month'));
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;

    const start = new Date(Date.UTC(year, month - 1, 1));
    const endExclusive = new Date(Date.UTC(year, month, 1));
    return { start, endExclusive };
  }

  if (periodType === 'yearly') {
    const year = Number(url.searchParams.get('year'));
    if (!Number.isFinite(year)) return null;

    const start = new Date(Date.UTC(year, 0, 1));
    const endExclusive = new Date(Date.UTC(year + 1, 0, 1));
    return { start, endExclusive };
  }

  return null;
};

const isInsidePeriod = (dateValue: string, range: { start: Date; endExclusive: Date } | null): boolean => {
  if (!range) return true;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return date >= range.start && date < range.endExclusive;
};

let transferTransactionDb: TransferTransaction[] = [
  {
    id: 'tr-mock-1',
    carteiraId: 'mock-2',
    carteiraDestinoId: null,
    tipo: 'Receita',
    categoriaId: 'cat-mock-4',
    categoriaNome: 'Salário',
    valor: 2500,
    encargos: 0,
    valorTotal: 2500,
    efetivada: true,
    dataLancamento: '2026-07-10T00:00:00.000Z',
    dataVencimento: null,
    dataEfetivacao: '2026-07-10T00:00:00.000Z',
    observacoes: 'Receita recorrente',
    criadaEm: '2026-07-10T12:00:00.000Z',
    atualizadaEm: null,
    objetivoId: null,
  },
  {
    id: 'tr-mock-2',
    carteiraId: 'mock-2',
    carteiraDestinoId: null,
    tipo: 'Despesa',
    categoriaId: 'cat-mock-2',
    categoriaNome: 'Transporte',
    valor: 340,
    encargos: 10,
    valorTotal: 350,
    efetivada: true,
    dataLancamento: '2026-07-12T00:00:00.000Z',
    dataVencimento: null,
    dataEfetivacao: '2026-07-12T00:00:00.000Z',
    observacoes: 'Combustivel',
    criadaEm: '2026-07-12T12:00:00.000Z',
    atualizadaEm: null,
    objetivoId: null,
  },
  {
    id: 'tr-mock-3',
    carteiraId: 'mock-2',
    carteiraDestinoId: 'mock-5',
    tipo: 'Transferencia',
    categoriaId: null,
    categoriaNome: null,
    valor: 500,
    encargos: 0,
    valorTotal: 500,
    efetivada: true,
    dataLancamento: '2026-07-14T00:00:00.000Z',
    dataVencimento: null,
    dataEfetivacao: '2026-07-14T00:00:00.000Z',
    observacoes: 'Aporte para investimentos',
    criadaEm: '2026-07-14T12:00:00.000Z',
    atualizadaEm: null,
    objetivoId: null,
  },
];

let exchangeTransactionDb: ExchangeTransaction[] = [
  {
    id: 'ex-mock-1',
    carteiraId: 'mock-5',
    codigoAtivo: 'PETR4',
    lado: 'Compra',
    quantidade: 10,
    precoUnitario: 32.5,
    valor: 325,
    encargos: 1.5,
    valorTotal: 326.5,
    efetivada: true,
    dataLancamento: '2026-07-11T00:00:00.000Z',
    dataVencimento: null,
    dataEfetivacao: '2026-07-11T00:00:00.000Z',
    observacoes: null,
    criadaEm: '2026-07-11T12:00:00.000Z',
    atualizadaEm: null,
  },
  {
    id: 'ex-mock-2',
    carteiraId: 'mock-5',
    codigoAtivo: 'VALE3',
    lado: 'Venda',
    quantidade: 4,
    precoUnitario: 68,
    valor: 272,
    encargos: 1,
    valorTotal: 273,
    efetivada: true,
    dataLancamento: '2026-07-15T00:00:00.000Z',
    dataVencimento: null,
    dataEfetivacao: '2026-07-15T00:00:00.000Z',
    observacoes: 'Realizacao parcial',
    criadaEm: '2026-07-15T12:00:00.000Z',
    atualizadaEm: null,
  },
];

export const handlers = [
  http.post('/auth/v2/login', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };

    const usuario = userDb[body.username];

    if (usuario && usuario.password === body.password) {
      loggedInUser = {
        id: getUserIdFromUsername(body.username),
        username: body.username,
      };

      return HttpResponse.json(
        {
          accessToken: 'mock-access-token',
          expiresIn: 3600,
          userId: loggedInUser.id,
          username: loggedInUser.username,
        },
        {
          headers: {
            'Set-Cookie': `${REFRESH_COOKIE_NAME}=mock-refresh-token; Path=/; HttpOnly; SameSite=Lax`,
          },
        }
      );
    }

    return HttpResponse.json(
      { message: 'Usuário ou senha inválidos' },
      { status: 401 }
    );
  }),

  http.post('/user/v2/create', async ({ request }) => {
    const body = (await request.json()) as { username: string };

    const userId = getUserIdFromUsername(body.username);
    loggedInUser = {
      id: userId,
      username: body.username,
    };

    return HttpResponse.json(
      {
        accessToken: 'novo-token',
        expiresIn: 3600,
        userId,
        username: body.username,
      },
      {
        headers: {
          'Set-Cookie': `${REFRESH_COOKIE_NAME}=novo-refresh; Path=/; HttpOnly; SameSite=Lax`,
        },
      }
    );
  }),

  http.post('/auth/v2/refresh', ({ request }) => {
    const token = getBearerToken(request);
    const hasCookie = hasRefreshCookie(request);

    if (!token) {
      return HttpResponse.json(
        { message: 'Access token ausente ou inválido.' },
        { status: 401 }
      );
    }

    if (!hasCookie) {
      return HttpResponse.json(
        { message: 'Refresh token ausente ou expirado.' },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        accessToken: 'mock-access-token-renovado',
        expiresIn: 3600,
      },
      {
        headers: {
          'Set-Cookie': `${REFRESH_COOKIE_NAME}=mock-refresh-token-renovado; Path=/; HttpOnly; SameSite=Lax`,
        },
      }
    );
  }),

  http.get('/auth/v2/validate', ({ request }) => {
    const token = getBearerToken(request);
    const hasCookie = hasRefreshCookie(request);

    if (!token || !hasCookie) {
      return HttpResponse.json({ valid: false }, { status: 401 });
    }

    return HttpResponse.json({ isValid: true, userId: loggedInUser?.id ?? 'mock-user-id', expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() });
  }),

  http.delete('/auth/v2/logout', ({ request }) => {
    const token = getBearerToken(request);

    if (!token) {
      return HttpResponse.json(
        { message: 'Access token ausente ou inválido.' },
        { status: 401 }
      );
    }

    return new HttpResponse(null, {
      status: 204,
      headers: {
        'Set-Cookie': `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      },
    });
  }),

  // ===== Esqueci minha senha =====

  http.post('/auth/v2/reset-code', async ({ request }) => {
    const body = (await request.json()) as { username: string };

    if (!body.username?.trim()) {
      return HttpResponse.json(
        { message: 'Username é obrigatório.' },
        { status: 400 }
      );
    }

    // gera um código numérico de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);

    resetCodeDb[body.username] = {
      code: resetCode,
      expiresAt: expiresAt.getTime(),
    };

    return HttpResponse.json({
      resetCode,
      expiresAt: expiresAt.toISOString(),
    });
  }),

  http.put('/auth/v2/change-password', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      resetCode: string;
      newPassword: string;
    };

    if (!body.username?.trim() || !body.resetCode?.trim() || !body.newPassword?.trim()) {
      return HttpResponse.json(
        { message: 'Username, resetCode e newPassword são obrigatórios.' },
        { status: 400 }
      );
    }

    if (!userDb[body.username]) {
      return HttpResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    const stored = resetCodeDb[body.username];

    if (!stored) {
      return HttpResponse.json(
        { message: 'Nenhum código de redefinição foi gerado para esse usuário.' },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiresAt) {
      delete resetCodeDb[body.username];
      return HttpResponse.json(
        { message: 'Código de redefinição expirado.' },
        { status: 400 }
      );
    }

    if (stored.code !== body.resetCode) {
      return HttpResponse.json(
        { message: 'Código de redefinição inválido.' },
        { status: 400 }
      );
    }

    userDb[body.username].password = body.newPassword;
    delete resetCodeDb[body.username];

    return HttpResponse.json({ message: 'Senha atualizada com sucesso.' });
  }),

  // ===== User =====

  http.get('/user/v2/me', ({ request }) => {
    const token = getBearerToken(request);

    if (!token || !loggedInUser) {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Não autenticado',
          status: 401,
          detail: 'Access token ausente ou inválido.',
          instance: '/user/v2/me',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json(loggedInUser);
  }),

  http.put('/user/v2/edit', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token || !loggedInUser) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as { id: string; username: string };
    if (!body.username?.trim()) {
      return HttpResponse.json({ message: 'Username é obrigatório.' }, { status: 400 });
    }

    loggedInUser = {
      id: body.id ?? loggedInUser.id,
      username: body.username.trim(),
    };

    return HttpResponse.json(loggedInUser);
  }),

  http.put('/user/v2/edit-password', ({ request }) => {
    const token = getBearerToken(request);
    if (!token || !loggedInUser) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    return HttpResponse.json({ message: 'Senha atualizada com sucesso.' });
  }),

  http.delete('/user/v2/remove', ({ request }) => {
    const token = getBearerToken(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!token || !loggedInUser || !id) {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Não autenticado',
          status: 401,
          detail: 'Access token ausente ou inválido.',
          instance: '/user/v2/remove',
        },
        { status: 401 }
      );
    }

    delete userDb[loggedInUser.username];
    loggedInUser = null;

    return new HttpResponse(null, {
      status: 204,
      headers: {
        'Set-Cookie': `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      },
    });
  }),

  // ===== Carteira (wallet) =====

  http.post('/wallet/v2/accounts/create', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const tipo = getWalletType(request);
    if (!tipo) {
      return HttpResponse.json(
        { message: 'Header X-WalletType inválido ou ausente.' },
        { status: 400 }
      );
    }

    const body = (await request.json()) as { nome: string; saldoInicial: number };

    const novaCarteira: Carteira = {
      id: crypto.randomUUID(),
      nome: body.nome,
      categoria: tipo,
      saldoInicial: body.saldoInicial,
      receitas: 0,
      despesas: 0,
      transferencias: 0,
      saldo: body.saldoInicial,
      saldoProjetado: body.saldoInicial,
    };

    carteiraDb[tipo].push(novaCarteira);

    return HttpResponse.json(novaCarteira, { status: 201 });
  }),

  http.put('/wallet/v2/accounts/edit', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<Carteira> & { id: string; categoria?: WalletType };
    const origemTipo = (Object.keys(carteiraDb) as WalletType[]).find((key) =>
      carteiraDb[key].some((c) => c.id === body.id)
    );

    if (!origemTipo) {
      return HttpResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 });
    }

    const origemIndex = carteiraDb[origemTipo].findIndex((c) => c.id === body.id);
    if (origemIndex === -1) {
      return HttpResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 });
    }

    const destinoTipo = body.categoria ?? origemTipo;
    const carteiraAtual = carteiraDb[origemTipo][origemIndex];
    const carteiraAtualizada: Carteira = {
      ...carteiraAtual,
      ...body,
      categoria: destinoTipo,
    };

    if (destinoTipo === origemTipo) {
      carteiraDb[origemTipo][origemIndex] = carteiraAtualizada;
    } else {
      carteiraDb[origemTipo].splice(origemIndex, 1);
      carteiraDb[destinoTipo].push(carteiraAtualizada);
    }

    return HttpResponse.json(carteiraAtualizada);
  }),

  http.delete('/wallet/v2/accounts/remove', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as { id: string };

    const tipo = (Object.keys(carteiraDb) as WalletType[]).find((key) =>
      carteiraDb[key].some((c) => c.id === body.id)
    );

    if (!tipo) {
      return HttpResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 });
    }

    const index = carteiraDb[tipo].findIndex((c) => c.id === body.id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 });
    }

    carteiraDb[tipo].splice(index, 1);

    return HttpResponse.json({ message: 'Carteira removida com sucesso.' });
  }),

  http.get('/wallet/v2/summary', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const categoriaQuery = url.searchParams.get('categoria') as WalletType | null;
    const period = parsePeriodRange(url);

    const baseCarteiras = categoriaQuery
      ? carteiraDb[categoriaQuery]
      : [...carteiraDb.Corrente, ...carteiraDb.Investimento];

    const carteiras = baseCarteiras.map((wallet) => {
      const walletTransactions = transferTransactionDb.filter(
        (entry) =>
          isInsidePeriod(entry.dataLancamento, period)
          && (entry.carteiraId === wallet.id || entry.carteiraDestinoId === wallet.id)
      );

      const receitas = walletTransactions
        .filter((entry) => entry.tipo === 'Receita' && entry.carteiraId === wallet.id)
        .reduce((total, entry) => total + entry.valorTotal, 0);

      const despesas = walletTransactions
        .filter((entry) => entry.tipo === 'Despesa' && entry.carteiraId === wallet.id)
        .reduce((total, entry) => total + entry.valorTotal, 0);

      const transferIn = walletTransactions
        .filter((entry) => entry.tipo === 'Transferencia' && entry.carteiraDestinoId === wallet.id)
        .reduce((total, entry) => total + entry.valorTotal, 0);

      const transferOut = walletTransactions
        .filter((entry) => entry.tipo === 'Transferencia' && entry.carteiraId === wallet.id)
        .reduce((total, entry) => total + entry.valorTotal, 0);

      const transferencias = transferIn - transferOut;
      const saldo = wallet.saldoInicial + receitas - despesas + transferencias;

      return {
        ...wallet,
        receitas,
        despesas,
        transferencias,
        saldo,
      };
    });

    const saldoTotal = carteiras.reduce((acc, c) => acc + c.saldo, 0);

    return HttpResponse.json({
      carteiras,
      saldoTotal,
    });
  }),

  // ===== Transaction / Transfer / Exchange =====

  http.get('/history/v2/transactions', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const period = parsePeriodRange(url);
    const tipo = url.searchParams.get('tipo');
    const categoriaId = url.searchParams.get('categoriaId');

    let entries = transferTransactionDb.filter((entry) => isInsidePeriod(entry.dataLancamento, period));

    if (tipo === 'Receita' || tipo === 'Despesa' || tipo === 'Transferencia') {
      entries = entries.filter((entry) => entry.tipo === tipo);
    }

    if (categoriaId) {
      entries = entries.filter((entry) => entry.categoriaId === categoriaId);
    }

    entries = [...entries].sort((a, b) =>
      new Date(b.dataLancamento).getTime() - new Date(a.dataLancamento).getTime()
    );

    return HttpResponse.json({ transacoes: entries });
  }),

  http.get('/history/v2/exchange', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const period = parsePeriodRange(url);
    const lado = url.searchParams.get('lado');

    let entries = exchangeTransactionDb.filter((entry) => isInsidePeriod(entry.dataLancamento, period));

    if (lado === 'Compra' || lado === 'Venda') {
      entries = entries.filter((entry) => entry.lado === lado);
    }

    entries = [...entries].sort((a, b) =>
      new Date(b.dataLancamento).getTime() - new Date(a.dataLancamento).getTime()
    );

    return HttpResponse.json({ transacoes: entries });
  }),

  http.get('/transaction/v2/list', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const entry = transferTransactionDb.find((item) => item.id === id);

    if (!entry) {
      return HttpResponse.json({ message: 'Transação não encontrada.' }, { status: 404 });
    }

    return HttpResponse.json(entry);
  }),

  http.post('/transaction/v2/new', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as TransferUpsertRequest;
    const categoria = categoriaDb.find((item) => item.id === body.categoriaId);
    const objetivoId = body.tipo === 'Receita' ? body.objetivoId ?? null : null;

    const created: TransferTransaction = {
      id: crypto.randomUUID(),
      carteiraId: body.carteiraId,
      carteiraDestinoId: null,
      tipo: body.tipo,
      categoriaId: body.categoriaId,
      categoriaNome: categoria?.nome ?? null,
      valor: body.valor,
      encargos: body.encargos,
      valorTotal: body.valor + body.encargos,
      efetivada: body.efetivada,
      dataLancamento: body.dataLancamento,
      dataVencimento: body.dataVencimento ?? null,
      dataEfetivacao: body.dataEfetivacao ?? null,
      observacoes: body.observacoes ?? null,
      criadaEm: new Date().toISOString(),
      atualizadaEm: null,
      objetivoId,
    };

    transferTransactionDb = [created, ...transferTransactionDb];

    if (objetivoId && created.efetivada) {
      addAporteFromTransacao(objetivoId, created);
    }

    return HttpResponse.json(created, { status: 201 });
  }),

  http.put('/transaction/v2/edit', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const body = (await request.json()) as TransferUpsertRequest;

    const index = transferTransactionDb.findIndex((item) => item.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Transação não encontrada.' }, { status: 404 });
    }

    const categoria = categoriaDb.find((item) => item.id === body.categoriaId);
    const objetivoId = body.tipo === 'Receita' ? body.objetivoId ?? null : null;

    const current = transferTransactionDb[index];
    const updated: TransferTransaction = {
      ...current,
      carteiraId: body.carteiraId,
      tipo: body.tipo,
      categoriaId: body.categoriaId,
      categoriaNome: categoria?.nome ?? null,
      valor: body.valor,
      encargos: body.encargos,
      valorTotal: body.valor + body.encargos,
      efetivada: body.efetivada,
      dataLancamento: body.dataLancamento,
      dataVencimento: body.dataVencimento ?? null,
      dataEfetivacao: body.dataEfetivacao ?? null,
      observacoes: body.observacoes ?? null,
      atualizadaEm: new Date().toISOString(),
      objetivoId,
    };

    transferTransactionDb[index] = updated;

    removeAporteByTransacaoId(updated.id);
    if (objetivoId && updated.efetivada) {
      addAporteFromTransacao(objetivoId, updated);
    }

    return HttpResponse.json(updated);
  }),

  http.delete('/transaction/v2/remove', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const index = transferTransactionDb.findIndex((item) => item.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Transação não encontrada.' }, { status: 404 });
    }

    transferTransactionDb.splice(index, 1);
    removeAporteByTransacaoId(id!);
    return HttpResponse.json({ message: 'Transação removida com sucesso.' });
  }),

  http.post('/transfer/v2/new', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as WalletTransferUpsertRequest;
    const created: TransferTransaction = {
      id: crypto.randomUUID(),
      carteiraId: body.carteiraId,
      carteiraDestinoId: body.carteiraDestinoId,
      tipo: 'Transferencia',
      categoriaId: null,
      categoriaNome: null,
      valor: body.valor,
      encargos: body.encargos,
      valorTotal: body.valor + body.encargos,
      efetivada: body.efetivada,
      dataLancamento: body.dataLancamento,
      dataVencimento: body.dataVencimento ?? null,
      dataEfetivacao: body.dataEfetivacao ?? null,
      observacoes: body.observacoes ?? null,
      criadaEm: new Date().toISOString(),
      atualizadaEm: null,
      objetivoId: null,
    };

    transferTransactionDb = [created, ...transferTransactionDb];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put('/transfer/v2/edit', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const body = (await request.json()) as WalletTransferUpsertRequest;

    const index = transferTransactionDb.findIndex((item) => item.id === id && item.tipo === 'Transferencia');
    if (index === -1) {
      return HttpResponse.json({ message: 'Transferência não encontrada.' }, { status: 404 });
    }

    const current = transferTransactionDb[index];
    const updated: TransferTransaction = {
      ...current,
      carteiraId: body.carteiraId,
      carteiraDestinoId: body.carteiraDestinoId,
      valor: body.valor,
      encargos: body.encargos,
      valorTotal: body.valor + body.encargos,
      efetivada: body.efetivada,
      dataLancamento: body.dataLancamento,
      dataVencimento: body.dataVencimento ?? null,
      dataEfetivacao: body.dataEfetivacao ?? null,
      observacoes: body.observacoes ?? null,
      atualizadaEm: new Date().toISOString(),
    };

    transferTransactionDb[index] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete('/transfer/v2/remove', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const index = transferTransactionDb.findIndex((item) => item.id === id && item.tipo === 'Transferencia');
    if (index === -1) {
      return HttpResponse.json({ message: 'Transferência não encontrada.' }, { status: 404 });
    }

    transferTransactionDb.splice(index, 1);
    return HttpResponse.json({ message: 'Transferência removida com sucesso.' });
  }),

  http.get('/exchange/v2/list', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const entry = exchangeTransactionDb.find((item) => item.id === id);

    if (!entry) {
      return HttpResponse.json({ message: 'Operação não encontrada.' }, { status: 404 });
    }

    return HttpResponse.json(entry);
  }),

  http.post('/exchange/v2/new', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as ExchangeUpsertRequest;
    const wallet = findWalletById(body.carteiraId);
    if (!wallet || wallet.categoria !== 'Investimento') {
      return HttpResponse.json(
        { message: 'Carteira informada deve ser do tipo Investimento.' },
        { status: 400 }
      );
    }

    const created: ExchangeTransaction = {
      id: crypto.randomUUID(),
      carteiraId: body.carteiraId,
      codigoAtivo: body.codigoAtivo,
      lado: body.lado,
      quantidade: body.quantidade,
      precoUnitario: body.precoUnitario,
      valor: body.quantidade * body.precoUnitario,
      encargos: body.encargos,
      valorTotal: body.quantidade * body.precoUnitario + body.encargos,
      efetivada: body.efetivada,
      dataLancamento: body.dataLancamento,
      dataVencimento: body.dataVencimento ?? null,
      dataEfetivacao: body.dataEfetivacao ?? null,
      observacoes: body.observacoes ?? null,
      criadaEm: new Date().toISOString(),
      atualizadaEm: null,
    };

    exchangeTransactionDb = [created, ...exchangeTransactionDb];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put('/exchange/v2/edit', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const body = (await request.json()) as ExchangeUpsertRequest;
    const wallet = findWalletById(body.carteiraId);
    if (!wallet || wallet.categoria !== 'Investimento') {
      return HttpResponse.json(
        { message: 'Carteira informada deve ser do tipo Investimento.' },
        { status: 400 }
      );
    }

    const index = exchangeTransactionDb.findIndex((item) => item.id === id);

    if (index === -1) {
      return HttpResponse.json({ message: 'Operação não encontrada.' }, { status: 404 });
    }

    const current = exchangeTransactionDb[index];
    const updated: ExchangeTransaction = {
      ...current,
      carteiraId: body.carteiraId,
      codigoAtivo: body.codigoAtivo,
      lado: body.lado,
      quantidade: body.quantidade,
      precoUnitario: body.precoUnitario,
      valor: body.quantidade * body.precoUnitario,
      encargos: body.encargos,
      valorTotal: body.quantidade * body.precoUnitario + body.encargos,
      efetivada: body.efetivada,
      dataLancamento: body.dataLancamento,
      dataVencimento: body.dataVencimento ?? null,
      dataEfetivacao: body.dataEfetivacao ?? null,
      observacoes: body.observacoes ?? null,
      atualizadaEm: new Date().toISOString(),
    };

    exchangeTransactionDb[index] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete('/exchange/v2/remove', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const index = exchangeTransactionDb.findIndex((item) => item.id === id);

    if (index === -1) {
      return HttpResponse.json({ message: 'Operação não encontrada.' }, { status: 404 });
    }

    exchangeTransactionDb.splice(index, 1);
    return HttpResponse.json({ message: 'Operação removida com sucesso.' });
  }),

  // ===== Categoria (category) =====

  http.get('/category/v2/list', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    return HttpResponse.json({ categorias: categoriaDb });
  }),

  http.post('/category/v2/new', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      nome: string;
      iconKey?: CategoriaIconKey;
      colorHex?: string;
      tipo?: CategoriaTipo;
    };

    if (!body.nome?.trim()) {
      return HttpResponse.json(
        { message: 'Nome é obrigatório.' },
        { status: 400 }
      );
    }

    if (body.tipo && body.tipo !== 'Despesa' && body.tipo !== 'Receita') {
      return HttpResponse.json(
        { message: "Tipo inválido. Use 'Receita' ou 'Despesa'." },
        { status: 400 }
      );
    }

    if (body.iconKey && !ICON_KEY_ALLOWLIST.includes(body.iconKey)) {
      return HttpResponse.json(
        { message: 'Ícone inválido.' },
        { status: 400 }
      );
    }

    if (body.colorHex && !COLOR_HEX_REGEX.test(body.colorHex)) {
      return HttpResponse.json(
        { message: 'Cor inválida. Use o formato #RRGGBB.' },
        { status: 400 }
      );
    }

    const novaCategoria: Categoria = {
      id: crypto.randomUUID(),
      nome: body.nome.trim(),
      iconKey: body.iconKey ?? DEFAULT_CATEGORIA_ICON,
      colorHex: body.colorHex ?? DEFAULT_CATEGORIA_COLOR,
      tipo: body.tipo ?? 'Despesa',
    };

    categoriaDb.push(novaCategoria);

    return HttpResponse.json(novaCategoria, { status: 201 });
  }),

  http.delete('/category/v2/remove', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return HttpResponse.json(
        { message: 'Id da categoria é obrigatório.' },
        { status: 400 }
      );
    }

    const index = categoriaDb.findIndex((c) => c.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
    }

    categoriaDb = categoriaDb.filter((c) => c.id !== id);

    return HttpResponse.json({ message: 'Categoria removida com sucesso.' });
  }),

  http.get('/goal/v2/list', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    return HttpResponse.json({ objetivos: goalDb });
  }),

  http.post('/goal/v2/new', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      nome: string;
      valorTotal: number;
      meses: number;
      iconKey?: string;
    };

    if (!body.nome?.trim() || !body.valorTotal || !body.meses) {
      return HttpResponse.json(
        { message: 'Nome, valor total e meses são obrigatórios.' },
        { status: 400 }
      );
    }

    const carteiraId = new URL(request.url).searchParams.get('carteiraId');
    const carteira = carteiraId ? findWalletById(carteiraId) : undefined;

    const novoObjetivo: Goal = {
      id: crypto.randomUUID(),
      nome: body.nome.trim(),
      iconKey: body.iconKey?.trim() || 'target',
      valorTotal: body.valorTotal,
      meses: body.meses,
      valorMensal: body.valorTotal / body.meses,
      valorAportado: 0,
      valorRestante: body.valorTotal,
      percentualConcluido: 0,
      carteiraId: carteiraId || null,
      carteiraNome: carteira?.nome ?? null,
      criadaEm: new Date().toISOString(),
    };

    goalDb = [novoObjetivo, ...goalDb];
    goalAporteDb[novoObjetivo.id] = [];

    return HttpResponse.json(novoObjetivo, { status: 201 });
  }),

  http.put('/goal/v2/edit', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const existing = goalDb.find((goal) => goal.id === id);

    if (!existing) {
      return HttpResponse.json({ message: 'Objetivo não encontrado.' }, { status: 404 });
    }

    const body = (await request.json()) as {
      nome: string;
      valorTotal: number;
      meses: number;
      carteiraId?: string | null;
      iconKey?: string;
    };

    const carteira = body.carteiraId ? findWalletById(body.carteiraId) : undefined;

    const atualizado: Goal = recalcGoal({
      ...existing,
      nome: body.nome.trim(),
      iconKey: body.iconKey?.trim() || existing.iconKey,
      valorTotal: body.valorTotal,
      meses: body.meses,
      valorMensal: body.valorTotal / body.meses,
      carteiraId: body.carteiraId ?? null,
      carteiraNome: carteira?.nome ?? null,
    });

    goalDb = goalDb.map((goal) => (goal.id === id ? atualizado : goal));

    return HttpResponse.json(atualizado);
  }),

  http.delete('/goal/v2/remove', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const exists = goalDb.some((goal) => goal.id === id);

    if (!exists) {
      return HttpResponse.json({ message: 'Objetivo não encontrado.' }, { status: 404 });
    }

    goalDb = goalDb.filter((goal) => goal.id !== id);
    delete goalAporteDb[id!];

    return HttpResponse.json({ message: 'Objetivo removido com sucesso.' });
  }),

  http.post('/goal/v2/aporte/new', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const goal = goalDb.find((g) => g.id === id);

    if (!goal) {
      return HttpResponse.json({ message: 'Objetivo não encontrado.' }, { status: 404 });
    }

    const body = (await request.json()) as {
      valor: number;
      data: string;
      observacao?: string;
      recorrente?: boolean;
    };

    if (!body.valor || body.valor <= 0) {
      return HttpResponse.json({ message: 'Valor do depósito deve ser maior que zero.' }, { status: 400 });
    }

    const aporte: GoalAporte = {
      id: crypto.randomUUID(),
      valor: body.valor,
      data: body.data,
      observacao: body.observacao?.trim() || null,
      recorrente: !!body.recorrente,
      criadoEm: new Date().toISOString(),
      transacaoId: null,
    };

    goalAporteDb[goal.id] = [aporte, ...(goalAporteDb[goal.id] ?? [])];

    const atualizado = recalcGoal(goal);
    goalDb = goalDb.map((g) => (g.id === goal.id ? atualizado : g));

    return HttpResponse.json(atualizado, { status: 201 });
  }),

  http.get('/goal/v2/aporte/list', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    const exists = goalDb.some((g) => g.id === id);

    if (!exists) {
      return HttpResponse.json({ message: 'Objetivo não encontrado.' }, { status: 404 });
    }

    const aportes = [...(goalAporteDb[id!] ?? [])].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    return HttpResponse.json({ aportes });
  }),

  http.delete('/goal/v2/aporte/remove', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const aporteId = new URL(request.url).searchParams.get('id');
    const goal = goalDb.find((g) => (goalAporteDb[g.id] ?? []).some((a) => a.id === aporteId));

    if (!goal) {
      return HttpResponse.json({ message: 'Depósito não encontrado.' }, { status: 404 });
    }

    const aporte = goalAporteDb[goal.id]!.find((a) => a.id === aporteId)!;

    if (aporte.transacaoId) {
      return HttpResponse.json(
        { message: 'Este depósito veio de uma receita. Edite ou remova a transação de origem.' },
        { status: 400 }
      );
    }

    goalAporteDb[goal.id] = goalAporteDb[goal.id]!.filter((a) => a.id !== aporteId);

    const atualizado = recalcGoal(goal);
    goalDb = goalDb.map((g) => (g.id === goal.id ? atualizado : g));

    return HttpResponse.json(atualizado);
  }),
];