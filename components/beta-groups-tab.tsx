'use client';

import { useState, useEffect } from 'react';
import {
  getBetaGroups,
  getBetaGroupMembers,
  getBetaGroupPendingMembers,
  BetaGroup,
  BetaGroupMember,
  BetaGroupPendingMember
} from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BetaGroupsTab() {
  const [loading, setLoading] = useState(true);
  const [betaGroups, setBetaGroups] = useState<BetaGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [members, setMembers] = useState<BetaGroupMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<BetaGroupPendingMember[]>([]);

  useEffect(() => {
    loadBetaGroups();
  }, []);

  const loadBetaGroups = async () => {
    setLoading(true);
    const groups = await getBetaGroups();
    setBetaGroups(groups);
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
      loadGroupData(groups[0].id);
    }
    setLoading(false);
  };

  const loadGroupData = async (groupId: string) => {
    const [groupMembers, pending] = await Promise.all([
      getBetaGroupMembers(groupId),
      getBetaGroupPendingMembers(groupId),
    ]);
    setMembers(groupMembers);
    setPendingMembers(pending);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    loadGroupData(groupId);
  };

  const selectedGroupData = betaGroups.find(g => g.id === selectedGroup);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Beta Groups ({betaGroups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {betaGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No beta groups found</p>
          ) : (
            <div className="space-y-2">
              {betaGroups.map(group => (
                <button
                  key={group.id}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedGroup === group.id
                      ? 'border-primary bg-accent'
                      : 'border-border hover:bg-accent/50'
                  }`}
                  onClick={() => handleGroupChange(group.id)}
                >
                  <div className="font-medium text-sm">{group.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGroupData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Active Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active members yet</p>
              ) : (
                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.user_id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {member.profile?.avatar_url ? (
                          <img src={member.profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium">
                            {member.profile?.first_name?.[0] || '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {member.profile?.first_name} {member.profile?.last_name || ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
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
              <CardTitle>Pending Members ({pendingMembers.length})</CardTitle>
              <CardDescription>
                Phone numbers awaiting signup. When users create accounts with these numbers,
                they'll be automatically enrolled and become friends with all group members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending members</p>
              ) : (
                <div className="space-y-3">
                  {pendingMembers.map((pending, idx) => (
                    <div key={idx} className="border-b border-border pb-2 last:border-0">
                      {pending.name && (
                        <div className="text-sm font-medium">{pending.name}</div>
                      )}
                      <div className="text-sm text-muted-foreground">{pending.phone}</div>
                      <div className="text-xs text-muted-foreground">
                        Added {new Date(pending.added_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
