import api from './api';

export async function getMessagesCount() {
  const response = await api.get('/messages/count');
  return response.data;
}
