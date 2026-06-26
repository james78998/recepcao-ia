import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

function PrivateRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading text="Verificando sessão…" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default PrivateRoute;
