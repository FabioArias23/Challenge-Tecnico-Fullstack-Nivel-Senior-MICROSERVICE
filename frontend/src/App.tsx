import React, { useState, useEffect } from 'react';
import { Dashboard } from './views/Dashboard';

const App: React.FC = () => {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // Verificamos si ya hay un token
    const token = localStorage.getItem('token');
    if (token === 'nexus_token_v1') setIsLogged(true);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('token', 'nexus_token_v1');
    setIsLogged(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLogged(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-gray-200 py-4 px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-xl font-bold text-indigo-600">
            Nexus <span className="text-gray-400 font-light">E-commerce</span>
          </span>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium">Status: 
              <span className={isLogged ? "text-green-500" : "text-red-500"}>
                {isLogged ? " ● Online" : " ● Offline"}
              </span>
            </span>
            
            {isLogged ? (
              <button onClick={handleLogout} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-md hover:bg-red-100 transition">
                Cerrar Sesión
              </button>
            ) : (
              <button onClick={handleLogin} className="text-xs bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 transition">
                Simular Login Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4">
        {isLogged ? (
          <Dashboard />
        ) : (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-slate-400">Por favor, inicia sesión para gestionar el catálogo</h1>
            <p className="text-slate-400 mb-6">Usa el botón de arriba para entrar como Administrador</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;