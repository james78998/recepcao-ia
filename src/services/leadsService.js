import api from "./api";

export async function getLeads(params = {}) {
  const response = await api.get("/leads", { params });
  return response.data;
}

export async function getLeadById(id) {
  const response = await api.get(`/leads/${id}`);
  return response.data;
}

export async function getLeadMessages(id) {
  const response = await api.get(`/leads/${id}/messages`);
  return response.data;
}

export async function createLead(data) {
  const response = await api.post("/leads", data);
  return response.data;
}

export async function updateLead(id, data) {
  const response = await api.put(`/leads/${id}`, data);
  return response.data;
}

export async function deleteLead(id) {
  await api.delete(`/leads/${id}`);
}
