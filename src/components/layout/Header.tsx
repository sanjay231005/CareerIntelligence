import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { theme, toggle } = useTheme();

  return (
    <header className="h-14 border-b bg-card/80 glass flex items-center justify-between px-4 lg:px-6 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <span className="text-sm font-medium text-muted-foreground hidden sm:block">{title}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="w-9 h-9 rounded-lg"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg" aria-label="Notifications">
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
