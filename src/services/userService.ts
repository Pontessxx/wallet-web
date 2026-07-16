import { privateApi } from '@/api/api';
import type { User, EditUsernameRequest, EditPasswordRequest } from '@/types/auth';

const getStoredUserId = () => {
  const rawUser = sessionStorage.getItem('user');
  if (!rawUser) return null;

  try {
    const parsedUser = JSON.parse(rawUser) as { id?: string };
    return parsedUser.id ?? null;
  } catch {
    return null;
  }
};

export const userService = {
  getMe: async () => {
    const response = await privateApi.get<User>('/user/v2/me');
    return response.data;
  },
  edit: async (payload: EditUsernameRequest) => {
    const id = payload.id ?? getStoredUserId();
    if (!id) {
      throw new Error('Não foi possível identificar o usuário autenticado para editar o perfil.');
    }

    const response = await privateApi.put<User>('/user/v2/edit', {
      id,
      username: payload.username,
    });
    return response.data;
  },
  editPassword: async (payload: EditPasswordRequest) => {
    await privateApi.put('/user/v2/edit-password', payload);
  },
  remove: async (id?: string) => {
    const resolvedId = id ?? getStoredUserId();
    if (!resolvedId) {
      throw new Error('Não foi possível identificar o usuário autenticado para remover a conta.');
    }

    await privateApi.delete('/user/v2/remove', {
      params: {
        id: resolvedId,
      },
    });
  },
};