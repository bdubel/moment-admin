'use client';

import { useState, useEffect } from 'react';
import {
  getUsers,
  getUserDetail,
  UserWithStats,
  Post,
  Friend,
  Group
} from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export function UsersTab() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userFriends, setUserFriends] = useState<Friend[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  const loadUserDetail = async (user: UserWithStats) => {
    setSelectedUser(user);
    setLoadingDetail(true);

    const { posts, friends, groups } = await getUserDetail(user.id);

    setUserPosts(posts);
    setUserFriends(friends);
    setUserGroups(groups);
    setLoadingDetail(false);
  };

  const handleBack = () => {
    setSelectedUser(null);
    setUserPosts([]);
    setUserFriends([]);
    setUserGroups([]);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Detail view
  if (selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {selectedUser.avatar_url ? (
                <img src={selectedUser.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-medium">
                  {selectedUser.first_name[0]}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {selectedUser.first_name} {selectedUser.last_name || ''}
              </h2>
              <p className="text-sm text-muted-foreground">
                Joined {new Date(selectedUser.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {loadingDetail ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Posts ({userPosts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {userPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No posts yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userPosts.map(post => (
                      <div key={post.id} className="border-b border-border pb-3 last:border-0">
                        {post.caption && (
                          <p className="text-sm mb-1">{post.caption}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{Math.floor(post.duration_seconds / 60)}m</span>
                          {post.is_private && <Badge variant="secondary" className="text-xs">Private</Badge>}
                          {post.thread_id && <Badge variant="secondary" className="text-xs">Thread</Badge>}
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Friends ({userFriends.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {userFriends.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No friends yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userFriends.map(friend => (
                      <div key={friend.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {friend.avatar_url ? (
                            <img src={friend.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium">
                              {friend.first_name[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {friend.first_name} {friend.last_name || ''}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(friend.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Groups ({userGroups.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {userGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No groups yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userGroups.map(group => (
                      <div key={group.id} className="border-b border-border pb-2 last:border-0">
                        <div className="text-sm font-medium">{group.name || 'Unnamed Group'}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{group.member_count} members</span>
                          <span>{new Date(group.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
        <CardDescription>Click on a user to view their details</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Friends</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow
                key={user.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => loadUserDetail(user)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-medium">
                          {user.first_name[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {user.first_name} {user.last_name || ''}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.post_count}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.friend_count}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.group_count}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
