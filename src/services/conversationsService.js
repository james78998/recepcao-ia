import api from "./api";

export async function getConversations() {
  const response = await api.get("/conversations");
  return response.data;
}

export async function getConversationMessages(id) {
  const response = await api.get(`/conversations/${id}/messages`);
  return response.data;
}
