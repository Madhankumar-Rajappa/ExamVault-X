import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('examvault_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('examvault_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch latest user profile on mount if token exists
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          localStorage.setItem('examvault_user', JSON.stringify(response.data.user));
        } catch (error) {
          console.error('Failed to verify authentication session:', error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password, expectedRole = null) => {
    const payload = { email, password };
    if (expectedRole) payload.expectedRole = expectedRole;

    const response = await api.post('/auth/login', payload);
    const { token: newToken, user: userData } = response.data;

    localStorage.setItem('examvault_token', newToken);
    localStorage.setItem('examvault_user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token: newToken, user: userData } = response.data;

    localStorage.setItem('examvault_token', newToken);
    localStorage.setItem('examvault_user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('examvault_token');
    localStorage.removeItem('examvault_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
