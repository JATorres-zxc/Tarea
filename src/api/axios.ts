import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/', // adjust as needed
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`; // or `Bearer ${token}` depending on backend
  }
  return config;
});

export default instance;