import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

function PublicRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading text="Verificando sessão…" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default PublicRoute;
