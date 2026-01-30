import React, { useEffect, useState } from 'react';
import { productSvc, inventorySvc } from '../services/api';
import { Product, Inventory } from '../types/api.responses';
import axios from 'axios';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);

  // Toma la URL de Vercel (Panel de Configuración)
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      const prodRes = await productSvc.getAll();
      const invRes = await inventorySvc.getAll();
      
      // Acceso seguro: Axios(.data) -> Interceptor(.data)
      const rawProducts = prodRes.data?.data as any;
      const productList = rawProducts?.data || rawProducts || [];

      const rawInventory = invRes.data?.data as any;
      const inventoryList = rawInventory?.data || rawInventory || [];

      setProducts(Array.isArray(productList) ? productList : []);
      setInventory(Array.isArray(inventoryList) ? inventoryList : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const simulateNewProduct = async () => {
    setLoading(true);
    try {
      // 1. LOGIN REAL (Usando backticks corregidos)
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@admin.com',
        password: 'admin123'
      });

      // Extraemos el token del wrapper del interceptor
      const jwt = loginRes.data.data.accessToken; 
      localStorage.setItem('token', jwt);

      // 2. CREAR PRODUCTO
      const randomId = Math.floor(Math.random() * 999);
      await productSvc.create({ 
        categoryId: 1,
        title: `Laptop Nexus Pro v${randomId}`,
        code: `SKU-${randomId}`,
        variationType: 'NONE'
      });

      alert("🚀 ¡Producto y Variación creados exitosamente!");
      await fetchData();

    } catch (error: any) {
      // Manejo de error robusto para la entrevista
      if (!error.response) {
        alert("⚠️ Error de Red: No se pudo conectar con el Backend en Render. Revisa el estado del servicio.");
      } else {
        console.error("Detalle del error:", error.response.data);
        alert(`Error ${error.response.status}: ${error.response.data.message || 'Datos inválidos'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg font-bold text-slate-700">Panel de Control</h1>
          <p className="text-sm text-slate-400">Gestión de Catálogo e Inventario Asíncrono</p>
        </div>
        <button 
          onClick={simulateNewProduct}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? "Procesando..." : "⚡ Simular Creación (Evento asíncrono)"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Catálogo */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-indigo-700">Catálogo de Productos</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {products.length > 0 ? products.map((p) => (
              <div key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center hover:border-indigo-300 transition-colors">
                <div>
                  <p className="font-medium text-slate-800">Producto #{p.id}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">UUID/Code: {p.code || 'N/A'}</p>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded font-bold uppercase">Draft</span>
              </div>
            )) : <p className="text-center py-10 text-slate-400">No hay productos disponibles.</p>}
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 text-green-700">Stock Actual (Redis)</h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Variation ID</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length > 0 ? inventory.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="p-3 font-mono text-slate-500">#{i.productVariationId}</td>
                  <td className="p-3 font-bold text-green-600">{i.quantity} uds</td>
                  <td className="p-3 text-right text-[9px] bg-green-50 text-green-700 rounded-full">SYNC</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="p-10 text-center text-slate-400 italic">Esperando que BullMQ procese eventos...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};