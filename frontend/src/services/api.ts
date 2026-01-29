// src/services/api.ts
import axios from 'axios';
import { ApiResponse, Product, Inventory } from '../types/api.responses';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// ESTO ES LO QUE FALTA O ESTÁ FALLANDO:
// Este interceptor es VITAL. Se ejecuta ANTES de cada click al botón.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productSvc = {
  getAll: () => api.get('/product'),
  create: (data: any) => api.post('/product/create', data),
};
export const inventorySvc = {
  getAll: () => api.get<ApiResponse<Inventory[]>>('/inventory'),
};

export default api;