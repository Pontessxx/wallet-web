import axios from 'axios';

const useMock = import.meta.env.VITE_ENABLE_MSW === 'true';

const baseURL = useMock ? '' : import.meta.env.VITE_API_URL;

const defaultConfig = {
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // necessário pro cookie httpOnly do refresh token ir/voltar
};

export const publicApi = axios.create(defaultConfig);
export const privateApi = axios.create(defaultConfig);

privateApi.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
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
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(privateApi(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const expiredAccessToken = sessionStorage.getItem('accessToken');

        // Rota exige Bearer (cadeado no Swagger) + cookie HttpOnly do refresh token
        const { data } = await publicApi.post(
          '/auth/v2/refresh',
          {},
          {
            withCredentials: true,
            headers: {
              'X-TicketValidation': 'JwtOnly',
              Authorization: `Bearer ${expiredAccessToken}`,
            },
          }
        );
        const newAccessToken = data.accessToken;

        sessionStorage.setItem('accessToken', newAccessToken);
        privateApi.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return privateApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);