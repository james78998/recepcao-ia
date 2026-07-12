import api from "./api";

export async function getAppointments(params = {}) {
  const response = await api.get("/appointments", { params });
  return response.data.data;
}

export async function getAppointmentById(id) {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
}

export async function createAppointment(data) {
  const response = await api.post("/appointments", data);
  return response.data;
}

export async function updateAppointment(id, data) {
  const response = await api.put(`/appointments/${id}`, data);
  return response.data;
}

export async function deleteAppointment(id) {
  await api.delete(`/appointments/${id}`);
}
