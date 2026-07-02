import api from "./api";

export async function getConversations() {
  const response = await api.get("/conversations");
  return response.data;
}

export async function getConversationMessages(id) {
  const response = await api.get(`/conversations/${id}/messages`);
  return response.data;
}

export async function sendMessage(messageId) {
  const response = await api.post(`/messages/${messageId}/send`);
  return response.data;
}
