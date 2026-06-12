import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ active, children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar active={active} />

      <div className="flex-1">
        <Topbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;