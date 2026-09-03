import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Meeting',
  '/transcripts': 'Transcripts',
  '/intelligence': 'Meeting Intelligence',
  '/action-items': 'Action Items',
  '/participants': 'Participants',
  '/sentiment': 'Sentiment Analysis',
  '/reports': 'Reports',
  '/validation': 'Validation',
  '/settings': 'Settings',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = ROUTE_TITLES[location.pathname] || '';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
