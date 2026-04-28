import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getApiErrorMessage(error, fallback = 'Request failed') {
  return error.response?.data?.message || error.response?.data?.title || error.message || fallback;
}