import axios from "axios";

const api = axios.create({
  baseURL: `https://konnect-api.up.railway.app/api`,
  withCredentials: true,
});

export default api;
