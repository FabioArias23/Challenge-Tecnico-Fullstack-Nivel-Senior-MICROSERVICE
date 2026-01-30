import React, { useEffect, useState } from 'react';
import { productSvc, inventorySvc } from '../services/api';
import { Product, Inventory } from '../types/api.responses';
import axios from 'axios';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);

const API_URL = import.meta.env.VITE_API_URL;


  const fetchData = async () => {
    try {
      const prodRes = await productSvc.getAll();
      const invRes = await inventorySvc.getAll();
      
      // Manejo de la respuesta con Interceptor (isSuccess: true, data: [...])
      const rawProducts = prodRes.data.data as any;
      const productList = rawProducts?.data || rawProducts || [];

      const rawInventory = invRes.data.data as any;
      const inventoryList = rawInventory?.data || rawInventory || [];

      setProducts(Array.isArray(productList) ? productList : []);
      setInventory(Array.isArray(inventoryList) ? inventoryList : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // FUNCIÓN PARA LA ENTREVISTA: Simular flujo asíncrono completo
const simulateNewProduct = async () => {
  setLoading(true);
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    const jwt = loginRes.data.data.accessToken; 
    localStorage.setItem('token', jwt);

    // Enviar campos que el nuevo DTO ya acepta
    const randomId = Math.floor(Math.random() * 999);
    await productSvc.create({ 
      categoryId: 1,
      title: `Laptop Nexus Pro v${randomId}`,
      code: `SKU-${randomId}`,
      variationType: 'NONE'
    } as any);
    
    alert("🚀 ¡Producto y Variación creados!");
    await fetchData();
  } catch (error: any) {
    console.error("Detalle del error 400:", error.response?.data);
    alert("Error 400: Revisa la consola para ver qué campo falló.");
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
      {/* Botón de acción Senior */}
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
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Procesando...
            </>
          ) : (
            "⚡ Simular Creación (Evento asíncrono)"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Catálogo */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-indigo-700 flex justify-between items-center">
            Catálogo de Productos
            <span className="text-xs font-normal text-slate-400">PostgreSQL</span>
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {products.length > 0 ? products.map((p) => (
              <div key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center hover:border-indigo-300 transition-colors">
                <div>
                  <p className="font-medium text-slate-800">Producto #{p.id}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">UUID/Code: {p.code || 'N/A'}</p>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded font-bold uppercase">
                   Draft
                </span>
              </div>
            )) : <p className="text-center py-10 text-slate-400 italic">No hay productos en la base de datos.</p>}
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 text-green-700 flex justify-between items-center">
            Stock (BullMQ + Redis)
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-slate-600">Variation ID</th>
                  <th className="p-3 text-slate-600">Stock</th>
                  <th className="p-3 text-right text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.length > 0 ? inventory.map((i) => (
                  <tr key={i.id} className="hover:bg-green-50 transition-colors">
                    <td className="p-3 font-mono text-slate-500">#{i.productVariationId}</td>
                    <td className="p-3">
                      <span className="font-bold text-green-600">{i.quantity}</span>
                      <span className="text-[10px] text-slate-400 ml-1">unidades</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase">
                        Sync
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-slate-400 italic">
                      Esperando que BullMQ procese nuevos productos...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 italic">
            * El inventario se inicializa automáticamente en 0 cuando se detecta un nuevo producto vía Redis.
          </p>
        </div>
      </div>
    </div>
  );
};