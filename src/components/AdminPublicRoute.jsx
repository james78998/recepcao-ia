import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

function AdminPublicRoute() {
  const { admin } = useAdminAuth();
  if (admin) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

export default AdminPublicRoute;
