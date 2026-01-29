export const authSvc = {
  login: (password: string) => {
    // Simulación sencilla: si la pass es 'admin123', guardamos un token
    if (password === 'admin123') {
      localStorage.setItem('token', 'nexus_token_v1');
      return true;
    }
    return false;
  },
  logout: () => localStorage.removeItem('token'),
  getToken: () => localStorage.getItem('token')
};