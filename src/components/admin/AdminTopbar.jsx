import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import Button from '../Button';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function AdminTopbar() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const displayName = admin?.name ?? '—';
  const initials = getInitials(admin?.name);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="font-bold text-slate-900">
          Painel Super Admin
        </h2>
        <p className="text-sm text-slate-500">
          Recepção IA
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-bold text-slate-900">{displayName}</p>
          <p className="text-sm text-slate-500">Super Admin</p>
        </div>

        <div className="w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
          {initials || '?'}
        </div>

        <Button color="gray" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </div>
  );
}

export default AdminTopbar;
