import { useAuth } from '../hooks/useAuth';

const ROLE_LABEL = {
  ADMIN: 'Administrador',
  RECEPTIONIST: 'Recepcionista',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function Topbar() {
  const { user } = useAuth();

  const displayName = user?.name ?? '—';
  const roleLabel = ROLE_LABEL[user?.role] ?? user?.role ?? '—';
  const tenantName = user?.tenant?.name ?? 'Recepção IA';
  const initials = getInitials(user?.name);

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="font-bold text-blue-950">
          Painel Administrativo
        </h2>
        <p className="text-sm text-slate-500">
          {tenantName}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-700">
          🔔 3
        </button>

        <div className="text-right">
          <p className="font-bold text-blue-950">{displayName}</p>
          <p className="text-sm text-slate-500">{roleLabel}</p>
        </div>

        <div className="w-11 h-11 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold">
          {initials || '?'}
        </div>
      </div>
    </div>
  );
}

export default Topbar;
