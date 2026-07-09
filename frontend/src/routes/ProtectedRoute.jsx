import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

export function OrgAdminRoute() {
  const { isAuthenticated, isOrgAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isOrgAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
