import Sidebar from "./Sidebar";

function Layout({ active, children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar active={active} />

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;