import { http, HttpResponse } from 'msw';
import type { Carteira, WalletType } from '@/types/carteira';

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
      nome: 'Investimentos',
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

export const handlers = [
  http.post('/auth/v2/login', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };

    if (body.username === 'admin' && body.password === 'admin') {
      return HttpResponse.json(
        {
          accessToken: 'mock-access-token',
          expiresIn: 3600,
          user: {
            id: '3',
            username: 'admin',
          },
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
    const body = await request.json();

    return HttpResponse.json(
      {
        accessToken: 'novo-token',
        expiresIn: 3600,
        user: body,
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

    return HttpResponse.json({ valid: true });
  }),

  http.delete('/auth/v2/logout', ({ request }) => {
    const token = getBearerToken(request);

    if (!token) {
      return HttpResponse.json(
        { message: 'Access token ausente ou inválido.' },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      { message: 'Logout realizado com sucesso.' },
      {
        status: 200,
        headers: {
          'Set-Cookie': `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        },
      }
    );
  }),

  // ===== Carteira (wallet) =====

  http.post('/wallet/v1/accounts/create', async ({ request }) => {
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

  http.put('/wallet/v1/accounts/edit', async ({ request }) => {
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

    const body = (await request.json()) as Partial<Carteira> & { id: string };

    const index = carteiraDb[tipo].findIndex((c) => c.id === body.id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 });
    }

    carteiraDb[tipo][index] = { ...carteiraDb[tipo][index], ...body };

    return HttpResponse.json(carteiraDb[tipo][index]);
  }),

  http.delete('/wallet/v1/accounts/remove', async ({ request }) => {
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

    const body = (await request.json()) as { id: string };

    const index = carteiraDb[tipo].findIndex((c) => c.id === body.id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 });
    }

    carteiraDb[tipo].splice(index, 1);

    return HttpResponse.json({ message: 'Carteira removida com sucesso.' });
  }),

  http.get('/wallet/v1/summary', ({ request }) => {
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

    const carteiras = carteiraDb[tipo];
    const saldoTotal = carteiras.reduce((acc, c) => acc + c.saldo, 0);

    return HttpResponse.json({
      carteiras,
      saldoTotal,
    });
  }),
];