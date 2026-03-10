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
const statusOptionsCache = new Map();
const STATUS_OPTIONS_TTL_MS = 10 * 60 * 1000;

export const fetchLeadStatusOptions = async (status, forceRefresh = false) => {
  const cacheKey = status;
  const now = Date.now();
  const cached = statusOptionsCache.get(cacheKey);

  if (
    !forceRefresh &&
    cached &&
    now - cached.cachedAt < STATUS_OPTIONS_TTL_MS
  ) {
    return cached.options;
  }

  const response = await API.get(`/leads/status-options/${status}`);
  const options = response.data?.options || [];

  statusOptionsCache.set(cacheKey, {
    options,
    cachedAt: now,
  });

  return options;
};

export const createLead = (formData) => API.post("/leads", formData);
export const updateLeadStatus = (id, status) =>
  API.put(`/leads/${id}`, { status });
export const updateLeadFollowUpdate = (id, followUpdate) =>
  API.put(`/leads/${id}`, { followUpdate });
export const addNote = (id, content) =>
  API.post(`/leads/${id}/notes`, { content });
export const deleteLead = (id) => API.delete(`/leads/${id}`);

export default API;
