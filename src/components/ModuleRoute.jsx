import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Mesmo papel de PrivateRoute, mas também exige que o módulo esteja
// habilitado para o tenant logado — redireciona para /dashboard quando não está.
function ModuleRoute({ moduleKey }) {
  const { hasModule } = useAuth();
  if (!hasModule(moduleKey)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default ModuleRoute;
