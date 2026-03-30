import client from './client';
import { Task } from '../types';

export const fetchSwipeTasks = async (lat?: number, lng?: number, page = 1): Promise<Task[]> => {
  const params: any = { page, limit: 20, status: 'OPEN' };
  if (lat && lng) {
    params.lat = lat;
    params.lng = lng;
  }
  const { data } = await client.get('/api/tasks', { params });
  return data.data || [];
};

export const expressInterest = async (taskId: string): Promise<void> => {
  await client.post(`/api/tasks/${taskId}/interest`);
};

export const applyToTask = async (taskId: string, message: string, proposedPrice: number): Promise<void> => {
  await client.post(`/api/tasks/${taskId}/apply`, { message, proposedPrice });
};
