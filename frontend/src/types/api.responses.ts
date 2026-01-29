// Estas interfaces deben coincidir con tus Entidades/DTOs del Repomix
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
}

export interface Inventory {
  id: number;
  productId: number;
  quantity: number;
}
export interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;         // Aquí va el payload (Product[], Inventory, etc.)
  errorCode: string | null; // El código de error (ej: "70000")
  errors: string[];       // Detalles técnicos del error
}

// El wrapper de respuesta que vi en tu GlobalFilter del backend
export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T; // Aquí vendrá el array de productos o inventario
  errorCode: string | null;
  errors: string[];
}