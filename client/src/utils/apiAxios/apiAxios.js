import axios from "axios";

// 172.27.138.123 FST 4
// 192.168.126.43 hotspot
const api = axios.create({
  baseURL: `http://192.168.126.43:3001/api/`,
  withCredentials: true,
});

export default api;
