import axios from "axios";

const api = axios.create({
  baseURL: `https://konnect.vercel.app/api/`,
  withCredentials: true,
});

export default api;
