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
};