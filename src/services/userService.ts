import { privateApi } from '@/api/api';
import type { User, EditUsernameRequest, EditPasswordRequest } from '@/types/auth';

export const userService = {
  getMe: async () => {
    const response = await privateApi.get<User>('/user/v2/me');
    return response.data;
  },
  edit: async (payload: EditUsernameRequest) => {
    const response = await privateApi.put<User>('/user/v2/edit', payload);
    return response.data;
  },
  editPassword: async (payload: EditPasswordRequest) => {
    await privateApi.put('/user/v2/edit-password', payload);
  },
  remove: async () => {
    await privateApi.delete('/user/v2/remove');
  },
};