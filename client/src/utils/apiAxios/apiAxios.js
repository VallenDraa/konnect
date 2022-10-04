import axios from "axios";

const api = axios.create({
  baseURL: `https://kon-nect.herokuapp.com/api/`,
  withCredentials: true,
});

export default api;
