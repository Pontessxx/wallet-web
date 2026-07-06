import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL;

// Instância pública
export const publicApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Instância privada
export const privateApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

privateApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});


privateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);