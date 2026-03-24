import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/types';

interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  company: string;
}

const roleUsers: Record<UserRole, AuthUser> = {
  admin: { id: 'admin', name: 'Admin User', role: 'admin', company: 'Behnke Enterprises' },
  dealer: { id: 'd1', name: 'Mike Johnson', role: 'dealer', company: 'Midwest Trailer Sales' },
  customer: { id: 'c1', name: 'John Hartmann', role: 'customer', company: 'Hartmann Farms' },
};

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem('auth_role');
    return saved && saved in roleUsers ? roleUsers[saved as UserRole] : null;
  });

  const login = (role: UserRole) => {
    sessionStorage.setItem('auth_role', role);
    setUser(roleUsers[role]);
  };

  const logout = () => {
    sessionStorage.removeItem('auth_role');
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    sessionStorage.setItem('auth_role', role);
    setUser(roleUsers[role]);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
