import axios from "axios";

const link = ["192.168.1.6", "localhost"];

const api = axios.create({
  baseURL: `http://${link[0]}:3001/api/`,
  withCredentials: true,
});

export default api;
