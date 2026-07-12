import { privateApi } from '@/api/api';
import type { User } from '@/types/auth';

export const userService = {
  getMe: async () => {
    const response = await privateApi.get<User>('/user/v1/me');
    return response.data;
  },
  remove: async () => {
    await privateApi.delete('/user/v1/remove');
  },
};