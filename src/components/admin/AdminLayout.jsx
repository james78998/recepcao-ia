import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

function AdminLayout({ active, children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar active={active} />

      <div className="flex-1">
        <AdminTopbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
