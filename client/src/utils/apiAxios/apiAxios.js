import axios from "axios";

const api = axios.create({
  baseURL: `https://konnect-api.vercel.app/api/`,
  withCredentials: true,
});

export default api;
