import api from "./api";

export async function getLeads() {
  const response = await api.get("/leads");
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
  const response = await api.delete(`/leads/${id}`);
  return response.data;
}