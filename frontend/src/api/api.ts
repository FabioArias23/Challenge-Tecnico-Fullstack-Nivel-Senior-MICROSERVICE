// src/services/api.ts
import axios from 'axios';
import { ApiResponse, Product, Inventory } from '../types/api.responses';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const productSvc = {
  // 1. Intenta con plurales si el 404 persiste, es el estándar de Nest (products)
  getAll: () => api.get<ApiResponse<Product[]>>('/products'), 
  create: (data: Partial<Product>) => api.post<ApiResponse<Product>>('/products', data),
};

export const inventorySvc = {
  // 2. Basado en tu log, la ruta de inventario parece estar bajo /inventory
  // Si el 404 persiste, prueba con '/inventories' o '/inventory'
  getAll: () => api.get<ApiResponse<Inventory[]>>('/inventory'),
};

export default api;