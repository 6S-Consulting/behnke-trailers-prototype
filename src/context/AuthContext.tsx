import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  role: 'customer' | 'admin' | null;
  login: (role?: 'customer' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [role, setRole] = useState<'customer' | 'admin' | null>(() => {
    return localStorage.getItem('role') as 'customer' | 'admin' | null;
  });

  const login = (role: 'customer' | 'admin' = 'customer') => {
    setIsLoggedIn(true);
    setRole(role);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('role', role);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setRole(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
