import axios from 'axios';

const useMock = import.meta.env.VITE_ENABLE_MSW === 'true';

const baseURL = useMock
  ? ''
  : import.meta.env.VITE_API_URL;

const defaultConfig = {
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Instância pública
export const publicApi = axios.create(defaultConfig);

// Instância privada
export const privateApi = axios.create(defaultConfig);

// Adiciona o Bearer Token automaticamente
privateApi.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Resposta privada
privateApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Resposta pública
publicApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);