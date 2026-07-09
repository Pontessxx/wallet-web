import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/auth/v2/login', async ({ request }) => {
    const body = await request.json() as {
      username: string;
      password: string;
    };

    console.log('MSW Login:', body);

    if (
      body.username === 'admin' &&
      body.password === 'admin'
    ) {
      return HttpResponse.json({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,

        user: {
          id: '3',
          username: 'admin',
        },
      });
    }

    return HttpResponse.json(
      {
        message: 'Usuário ou senha inválidos',
      },
      {
        status: 401,
      }
    );
  }),

  http.post('/user/v2/create', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      accessToken: 'novo-token',
      refreshToken: 'novo-refresh',
      expiresIn: 3600,
      user: body,
    });
  }),
];