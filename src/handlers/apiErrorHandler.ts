import axios from 'axios';
import type { ApiErrorResponse } from '@/types/common';

export const toApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage;
  }

  const payload = error.response?.data;

  if (payload?.message) {
    return payload.message;
  }

  if (payload?.detail) {
    return payload.detail;
  }

  if (payload?.title) {
    return payload.title;
  }

  return error.message || fallbackMessage;
};
