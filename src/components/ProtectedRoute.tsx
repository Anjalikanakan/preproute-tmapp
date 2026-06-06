import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const hasToken = isAuthenticated || !!localStorage.getItem('token');
  return hasToken ? <>{children}</> : <Navigate to="/login" replace />;
};
