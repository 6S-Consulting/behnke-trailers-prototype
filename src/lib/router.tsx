import React, { createContext, useContext } from 'react';
import { useLocation, useNavigate, Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';

// Type definitions compatible with previous usage
type Route = string;

interface RouterContextType {
  route: Route;
  navigate: (path: string) => void;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// This component is now just a context provider that wraps react-router-dom hooks
// It assumes it is rendered INSIDE a BrowserRouter (which will be in App.tsx)
export function RouterProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigateInternal = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Map location.pathname to 'route' for compatibility
  // The old router used hash, e.g. #/catalog
  // The new one uses path, e.g. /catalog
  const route = location.pathname;

  const navigate = (path: string) => {
    navigateInternal(path);
  };

  // Convert useParams result to Record<string, string> (it's already compatible mostly)
  const safeParams = params as Record<string, string>;

  return (
    <RouterContext.Provider value={{ route, navigate, params: safeParams, searchParams }}>
      {children}
    </RouterContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRouter() {
  const context = useContext(RouterContext);
  // If we utilize this hook outside of our RouterProvider shim but inside BrowserRouter,
  // we could potentially fallback to direct react-router hooks, but for now strict shim.
  if (context === undefined) {
     // If used without RouterProvider, try to gracefully fallback? 
     // But App.tsx will wrap everything.
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function Link({ to, children, className, onClick }: { to: string, children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <RouterLink 
      to={to} 
      className={className}
      onClick={onClick}
    >
      {children}
    </RouterLink>
  );
}
