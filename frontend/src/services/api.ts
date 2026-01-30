// src/services/api.ts
import axios from 'axios';
import { ApiResponse, Product, Inventory } from '../types/api.responses';

const api = axios.create({
  // Vercel inyectará esta URL en tiempo de build
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para inyectar el token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // ✅ Corregido: Usando backticks para el Template Literal
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productSvc = {
  // Nota: Devolvemos ApiResponse para que el Dashboard lea .data.data
  getAll: () => api.get<ApiResponse<Product[]>>('/product'),
  create: (data: any) => api.post<ApiResponse<any>>('/product/create', data),
};

export const inventorySvc = {
  getAll: () => api.get<ApiResponse<Inventory[]>>('/inventory'),
};

export default api;