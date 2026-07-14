import { http, HttpResponse } from 'msw';
import type { Carteira, WalletType } from '@/types/carteira';
import type { Categoria } from '@/types/categoria';

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

// "Banco" em memória das categorias
let categoriaDb: Categoria[] = [
  { id: 'cat-mock-1', nome: 'Alimentação' },
  { id: 'cat-mock-2', nome: 'Transporte' },
  { id: 'cat-mock-3', nome: 'Lazer' },
];

// "Banco" em memória de usuários válidos (mock simplificado pro fluxo de senha)
const userDb: Record<string, { password: string }> = {
  admin: { password: 'admin' }, // usuário padrão, usado pro resto dos fluxos
  userChangePass: { password: 'senha123' }, // usuário dedicado só pro fluxo de "esqueci minha senha"
};

// Códigos de redefinição gerados, por username
const resetCodeDb: Record<string, { code: string; expiresAt: number }> = {};

const RESET_CODE_TTL_MS = 5 * 60 * 1000; // 5 minutos

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
          user: loggedInUser,
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

  // ===== Esqueci minha senha =====

  http.post('/auth/v1/reset-code', async ({ request }) => {
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

  http.put('/auth/v1/change-password', async ({ request }) => {
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

  http.get('/user/v1/me', ({ request }) => {
    const token = getBearerToken(request);

    if (!token || !loggedInUser) {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Não autenticado',
          status: 401,
          detail: 'Access token ausente ou inválido.',
          instance: '/user/v1/me',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json(loggedInUser);
  }),

  http.delete('/user/v1/remove', ({ request }) => {
    const token = getBearerToken(request);

    if (!token || !loggedInUser) {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Não autenticado',
          status: 401,
          detail: 'Access token ausente ou inválido.',
          instance: '/user/v1/remove',
        },
        { status: 401 }
      );
    }

    delete userDb[loggedInUser.username];
    loggedInUser = null;

    return HttpResponse.json(
      { message: 'Usuário removido com sucesso.' },
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

  // ===== Categoria (category) =====

  http.get('/category/v2/list', ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    return HttpResponse.json(categoriaDb);
  }),

  http.post('/category/v2/new', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as { nome: string };

    if (!body.nome?.trim()) {
      return HttpResponse.json(
        { message: 'Nome é obrigatório.' },
        { status: 400 }
      );
    }

    const novaCategoria: Categoria = {
      id: crypto.randomUUID(),
      nome: body.nome,
    };

    categoriaDb.push(novaCategoria);

    return HttpResponse.json(novaCategoria, { status: 201 });
  }),

  http.delete('/category/v2/remove', async ({ request }) => {
    const token = getBearerToken(request);
    if (!token) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as { id: string };

    const index = categoriaDb.findIndex((c) => c.id === body.id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
    }

    categoriaDb = categoriaDb.filter((c) => c.id !== body.id);

    return HttpResponse.json({ message: 'Categoria removida com sucesso.' });
  }),
];