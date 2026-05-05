'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Activity, Settings, LogOut, Kanban, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'My Tasks', icon: CheckSquare },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/activity', label: 'Activity', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
          <Kanban className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight">TaskFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {active && (
                    <ChevronRight className="ml-auto h-3 w-3" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <Link href="/settings">
          <div className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent mb-1',
            pathname === '/settings' && 'bg-primary/10 text-primary'
          )}>
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Settings</span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(user?.name || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
