import axios from 'axios';

const useMock = import.meta.env.VITE_ENABLE_MSW === 'true';

const baseURL = useMock ? '' : import.meta.env.VITE_API_URL;

type RefreshResponse = {
  accessToken: string;
  expiresIn: number;
};

const defaultConfig = {
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // necessário pro cookie httpOnly do refresh token ir/voltar
};

export const publicApi = axios.create(defaultConfig);
export const privateApi = axios.create(defaultConfig);

const getAccessToken = () => sessionStorage.getItem('accessToken');

const saveAccessTokenSession = (accessToken: string) => {
  sessionStorage.setItem('accessToken', accessToken);
};

const clearAuthSession = () => {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('accessTokenExpiresAt');
};

const getTokenExpMs = (token: string) => {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) return null;

    const base64Payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=');
    const payload = JSON.parse(atob(paddedPayload)) as { exp?: number };

    if (!payload.exp) return null;

    return payload.exp * 1000;
  } catch {
    return null;
  }
};

const shouldRefreshToken = (token: string) => {
  const tokenExpMs = getTokenExpMs(token);
  if (!tokenExpMs) return false;

  return Date.now() >= tokenExpMs - 60 * 1000;
};

const redirectToLogin = () => {
  clearAuthSession();
  window.location.href = '/login';
};

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token as string);
    }
  });
  pendingQueue = [];
};

const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  const currentAccessToken = getAccessToken();
  if (!currentAccessToken) {
    throw new Error('Access token ausente para renovação.');
  }

  isRefreshing = true;

  try {
    const { data } = await publicApi.post<RefreshResponse>(
      '/auth/v2/refresh',
      {},
      {
        withCredentials: true,
        headers: {
          'X-TicketValidation': 'JwtOnly',
          Authorization: `Bearer ${currentAccessToken}`,
        },
      }
    );

    saveAccessTokenSession(data.accessToken);
    privateApi.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
    processQueue(null, data.accessToken);

    return data.accessToken;
  } catch (refreshError) {
    processQueue(refreshError, null);
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};

privateApi.interceptors.request.use(async (config) => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return config;
  }

  if (shouldRefreshToken(accessToken)) {
    try {
      const refreshedAccessToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${refreshedAccessToken}`;
      return config;
    } catch {
      redirectToLogin();
      return Promise.reject(new Error('Não foi possível renovar a sessão.'));
    }
  }

  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && !error.response) {
      error.message = 'Não foi possível conectar ao servidor.';
    }
    return Promise.reject(error);
  }
);

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    if (!error.response) {
      error.message = 'Não foi possível conectar ao servidor.';
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return privateApi(originalRequest);
      } catch (refreshError) {
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);