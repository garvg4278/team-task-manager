'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Search, MoreHorizontal, Calendar, Users, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { projectsApi } from '@/services/api';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuItem, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { useAuthStore } from '@/store/auth.store';

const priorityBadge: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-950/30',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuthStore();

  const fetchProjects = async () => {
    try {
      const { data } = await projectsApi.getAll();
      setProjects(data.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">{projects.length} projects total</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search projects..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
          <p className="mt-1 text-muted-foreground">Create your first project to get started</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <Link href={`/projects/${project.id}`} className="font-semibold hover:text-primary transition-colors line-clamp-1">
                        {project.title}
                      </Link>
                    </div>
                    {user?.role === 'ADMIN' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}`}>Open</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(project.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityBadge[project.priority])}>
                      {project.priority}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium',
                      project.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-950/30' :
                      project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {project.status}
                    </span>
                  </div>

                  {/* Progress */}
                  {project._count.tasks > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{project._count.tasks} tasks</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: '40%', backgroundColor: project.color }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {project._count.members}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" /> {project._count.tasks}
                      </span>
                    </div>
                    {project.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.dueDate)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(p) => { setProjects((prev) => [p, ...prev]); setShowCreate(false); }}
      />
    </div>
  );
}
