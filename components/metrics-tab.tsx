'use client';

import { useState, useEffect } from 'react';
import { getMetrics, WeeklyMetrics, UserWeeklyMetrics } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function MetricsTab() {
  const [loading, setLoading] = useState(true);
  const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetrics[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserWeeklyMetrics[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    const { weekly, users } = await getMetrics();
    setWeeklyMetrics(weekly);
    setUserMetrics(users);
    if (weekly.length > 0) {
      setSelectedWeek(weekly[0].week_start);
    }
    setLoading(false);
  };

  const filteredUserMetrics = selectedWeek
    ? userMetrics.filter(m => m.week_start === selectedWeek)
    : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (weeklyMetrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Metrics Data</CardTitle>
          <CardDescription>
            Weekly metrics data will appear here once the database functions are set up.
            The system needs get_weekly_metrics() and get_user_weekly_metrics() Postgres functions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Week-over-Week Metrics</CardTitle>
          <CardDescription>Overall activity metrics by week</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Total Posts</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Unique Users</TableHead>
                <TableHead>Avg Hours/User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyMetrics.map((week) => {
                const avgHours = week.unique_users > 0
                  ? (week.total_hours / week.unique_users).toFixed(1)
                  : '0';

                return (
                  <TableRow
                    key={week.week_start}
                    className={`cursor-pointer ${
                      selectedWeek === week.week_start ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedWeek(week.week_start)}
                  >
                    <TableCell className="font-medium">
                      {new Date(week.week_start).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{week.total_posts}</TableCell>
                    <TableCell>{week.total_hours.toFixed(1)}</TableCell>
                    <TableCell>{week.unique_users}</TableCell>
                    <TableCell>{avgHours}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedWeek && (
        <Card>
          <CardHeader>
            <CardTitle>User Breakdown</CardTitle>
            <CardDescription>
              Activity for week of {new Date(selectedWeek).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUserMetrics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No user data for this week</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUserMetrics.map((userMetric, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{userMetric.user_name}</TableCell>
                      <TableCell>{userMetric.posts}</TableCell>
                      <TableCell>{userMetric.hours.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
