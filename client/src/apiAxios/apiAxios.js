import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.5:3001/api/',
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
});

export default api;
