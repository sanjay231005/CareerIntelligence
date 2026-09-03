import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Upload, FileText, Brain, CheckSquare, Users,
  BarChart2, FileBarChart, ShieldCheck, Settings, ChevronDown,
  ChevronRight, Bot, X, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMeetings } from '@/lib/storage';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function NavItem({ to, icon, label, onClick }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={cn('sidebar-nav-item', isActive && 'active')}
    >
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [meetingsOpen, setMeetingsOpen] = useState(true);
  const [intelligenceOpen, setIntelligenceOpen] = useState(true);
  const meetings = getMeetings();
  const hasProcessed = meetings.some(m => m.status === 'processed');
  const hasTranscribed = meetings.some(m => m.status === 'transcribed' || m.status === 'processed');

  const baseClass = cn(
    'fixed inset-y-0 left-0 z-50 w-64 flex flex-col',
    'bg-sidebar text-sidebar-foreground border-r border-sidebar-border',
    'transition-transform duration-300 ease-in-out',
    open ? 'translate-x-0' : '-translate-x-full',
    'lg:translate-x-0 lg:static lg:z-auto'
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}
      <aside className={baseClass}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-sidebar-primary-foreground leading-none">AI Career</p>
              <p className="text-[10px] text-sidebar-foreground/60 leading-none mt-0.5">Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-sidebar-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <NavItem to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" onClick={onClose} />

          {/* Meetings Group */}
          <div className="pt-3 pb-1">
            <button
              onClick={() => setMeetingsOpen(v => !v)}
              className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
            >
              <span>Meetings</span>
              {meetingsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
          {meetingsOpen && (
            <div className="space-y-0.5 pl-2">
              <NavItem to="/upload" icon={<Upload />} label="Upload Meeting" onClick={onClose} />
              <NavItem to="/transcripts" icon={<FileText />} label="Transcripts" onClick={onClose} />
              <NavItem to="/intelligence" icon={<Brain />} label="Meeting Intelligence" onClick={onClose} />
            </div>
          )}

          {/* Intelligence Group */}
          <div className="pt-3 pb-1">
            <button
              onClick={() => setIntelligenceOpen(v => !v)}
              className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
            >
              <span>Intelligence</span>
              {intelligenceOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
          {intelligenceOpen && (
            <div className="space-y-0.5 pl-2">
              <NavItem to="/sentiment" icon={<BarChart2 />} label="Sentiment" onClick={onClose} />
              <NavItem to="/action-items" icon={<CheckSquare />} label="Action Items" onClick={onClose} />
              <NavItem to="/participants" icon={<Users />} label="Participants" onClick={onClose} />
              <NavItem to="/reports" icon={<FileBarChart />} label="Reports" onClick={onClose} />
            </div>
          )}

          <div className="pt-3 space-y-0.5">
            <NavItem to="/validation" icon={<ShieldCheck />} label="Validation" onClick={onClose} />
            <NavItem to="/settings" icon={<Settings />} label="Settings" onClick={onClose} />
          </div>
        </nav>

        {/* Milestone Status */}
        <div className="px-4 py-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-sidebar-foreground/50">Milestone 1</span>
            <span className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded',
              hasTranscribed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sidebar-accent text-sidebar-foreground/40'
            )}>
              {hasTranscribed ? '✓ Active' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-sidebar-foreground/50">Milestone 2</span>
            <span className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded',
              hasProcessed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sidebar-accent text-sidebar-foreground/40'
            )}>
              {hasProcessed ? '✓ Active' : 'Pending'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
