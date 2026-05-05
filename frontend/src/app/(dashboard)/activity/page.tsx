'use client';

import { useEffect, useState } from 'react';
import { activityApi } from '@/services/api';
import { ActivityLog } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { timeAgo, getInitials, activityActionLabels } from '@/lib/utils';

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activityApi.getAll({ limit: 50 }).then(({ data }) => setLogs(data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Activity Feed</h1>
        <p className="text-muted-foreground">Recent team activity</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No activity yet</p>
          ) : (
            logs.map((log, i) => (
              <div key={log.id} className="flex gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={log.user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(log.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{log.user.name}</span>{' '}
                    <span className="text-muted-foreground">{activityActionLabels[log.action] || log.action}</span>
                    {log.metadata?.taskTitle && (
                      <> <span className="font-medium">"{log.metadata.taskTitle}"</span></>
                    )}
                    {log.metadata?.projectTitle && (
                      <> <span className="font-medium" style={{ color: log.project?.color }}>
                        {log.metadata.projectTitle}
                      </span></>
                    )}
                    {log.project && !log.metadata?.projectTitle && (
                      <> in <span className="font-medium" style={{ color: log.project.color }}>{log.project.title}</span></>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(log.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
