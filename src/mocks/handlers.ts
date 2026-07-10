import { http, HttpResponse } from 'msw';

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
            // Simula o cookie HttpOnly setado pelo backend real
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

  // Rota com cadeado: exige Bearer (mesmo expirado) + cookie de refresh
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

  // Rota com cadeado: valida se o refresh token pertence ao usuário do access token
  http.get('/auth/v2/validate', ({ request }) => {
    const token = getBearerToken(request);
    const hasCookie = hasRefreshCookie(request);

    if (!token || !hasCookie) {
      return HttpResponse.json({ valid: false }, { status: 401 });
    }

    return HttpResponse.json({ valid: true });
  }),

  // Rota com cadeado: exige Bearer, revoga refresh tokens e limpa o cookie
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
          // Simula a remoção do cookie (Max-Age=0)
          'Set-Cookie': `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        },
      }
    );
  }),
];