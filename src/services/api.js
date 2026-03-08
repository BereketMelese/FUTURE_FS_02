import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export const signIn = (formData) => API.post("/auth/login", formData);
export const signUp = (formData) => API.post("/auth/register", formData);
export const fetchUserApi = () => API.get("/auth/me");

export const fetchLeads = () => API.get("/leads");
export const fetchLead = (id) => API.get(`/leads/${id}`);
export const createLead = (formData) => API.post("/leads", formData);
export const updateLeadStatus = (id, status) =>
  API.put(`/leads/${id}/status`, { status });
export const addNote = (id, note) => API.post(`/leads/${id}/notes`, { note });
export const deleteLead = (id) => API.delete(`/leads/${id}`);

export default API;
