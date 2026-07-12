import api from "./api";

export async function getGoogleCalendarAuthUrl() {
  const response = await api.get("/auth/google/auth-url");
  return response.data;
}
