import { publicApi, privateApi } from '@/api/api';
import type { AuthResponse, LoginRequest, SignupRequest } from '@/types/auth';

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await publicApi.post<AuthResponse>('/auth/v2/login', data, {
      headers: {
        'X-TicketValidation': 'JwtOnly',
      },
    });
    return response.data;
  },
  signup: async (data: SignupRequest) => {
    const response = await publicApi.post<AuthResponse>('/user/v2/create', data);
    return response.data;
  },
  logout: async () => {
    await privateApi.delete('/auth/v2/logout', {
      withCredentials: true,
      headers: {
        'X-TicketValidation': 'JwtOnly',
      },
    });
  },
  requestResetCode: async (data: { username: string }) => {
    const response = await publicApi.post('/auth/v1/reset-code', data);
    return response.data;
  },

  changePassword: async (data: { username: string; resetCode: string; newPassword: string }) => {
    const response = await publicApi.put('/auth/v1/change-password', data);
    return response.data;
  },
};