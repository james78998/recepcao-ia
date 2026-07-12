import { useAuth } from "../hooks/useAuth";

// Renderiza `children` somente se o tenant logado tiver o módulo habilitado.
// Não exibe placeholder nem mensagem — o módulo simplesmente não existe
// visualmente para tenants sem acesso.
function ModuleGate({ moduleKey, children }) {
  const { hasModule } = useAuth();
  if (!hasModule(moduleKey)) return null;
  return children;
}

export default ModuleGate;
