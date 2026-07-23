import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MotionBackdrop from '../components/MotionBackdrop';

export default function DashboardLayout({ title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell min-h-screen text-[var(--color-text-primary)]">
      <MotionBackdrop />
      <Sidebar isOpen={sidebarOpen} />
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <Navbar title={title} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="relative flex-1 overflow-y-auto p-5 md:p-8">
          <div className="app-orb app-orb-one" aria-hidden="true" />
          <div className="app-orb app-orb-two" aria-hidden="true" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
