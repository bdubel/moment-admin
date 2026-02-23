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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

    // Auto-select first user
    if (data.length > 0) {
      await loadUserDetail(data[0]);
    }

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

  if (loading) {
    return (
      <div className="flex gap-6">
        <Skeleton className="h-96 w-1/3" />
        <Skeleton className="h-96 flex-1" />
      </div>
    );
  }

  // Split view: user list on left, selected user details on right
  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Left side: User list */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="space-y-1">
            {users.map(user => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                  selectedUser?.id === user.id ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
                onClick={() => loadUserDetail(user)}
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium">
                      {user.first_name[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {user.first_name} {user.last_name || ''}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{user.post_count} posts</span>
                    <span>·</span>
                    <span>{user.friend_count} friends</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right side: Selected user details */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {selectedUser ? (
          <>
            {/* User header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-medium">
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
              </CardContent>
            </Card>

            {loadingDetail ? (
              <>
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </>
            ) : (
              <>
                {/* Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Posts ({userPosts.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userPosts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No posts yet</p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
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

                {/* Friends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Friends ({userFriends.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userFriends.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No friends yet</p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
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

                {/* Groups */}
                <Card>
                  <CardHeader>
                    <CardTitle>Groups ({userGroups.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No groups yet</p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
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
              </>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Select a user to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
