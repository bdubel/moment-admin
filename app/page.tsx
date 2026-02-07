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
import './admin.css';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [betaGroups, setBetaGroups] = useState<BetaGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [members, setMembers] = useState<BetaGroupMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<BetaGroupPendingMember[]>([]);

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadBetaGroups();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        sessionStorage.setItem('admin_auth', 'true');
        setIsAuthenticated(true);
        loadBetaGroups();
      } else {
        setError('Invalid password');
        setPassword('');
      }
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
    setBetaGroups([]);
    setMembers([]);
    setPendingMembers([]);
    setSelectedGroup(null);
  };

  const loadBetaGroups = async () => {
    const groups = await getBetaGroups();
    setBetaGroups(groups);
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
      loadGroupData(groups[0].id);
    }
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

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <h1>Moment Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading}
              autoFocus
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const selectedGroupData = betaGroups.find(g => g.id === selectedGroup);

  return (
    <div className="admin-container">
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Beta Groups Admin</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        <div className="admin-content">
          <div className="groups-section">
            <h2>Beta Groups ({betaGroups.length})</h2>
            {betaGroups.length === 0 ? (
              <p className="empty-state">No beta groups found</p>
            ) : (
              <div className="groups-list">
                {betaGroups.map(group => (
                  <button
                    key={group.id}
                    className={`group-item ${selectedGroup === group.id ? 'active' : ''}`}
                    onClick={() => handleGroupChange(group.id)}
                  >
                    <div className="group-name">{group.name}</div>
                    <div className="group-date">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedGroupData && (
            <div className="data-section">
              <div className="members-section">
                <h2>Active Members ({members.length})</h2>
                {members.length === 0 ? (
                  <p className="empty-state">No active members yet</p>
                ) : (
                  <div className="members-list">
                    {members.map(member => (
                      <div key={member.user_id} className="member-item">
                        <div className="member-avatar">
                          {member.profile?.avatar_url ? (
                            <img src={member.profile.avatar_url} alt="Avatar" />
                          ) : (
                            <div className="avatar-placeholder">
                              {member.profile?.first_name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="member-info">
                          <div className="member-name">
                            {member.profile?.first_name}{' '}
                            {member.profile?.last_name || ''}
                          </div>
                          <div className="member-joined">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pending-section">
                <h2>Pending Members ({pendingMembers.length})</h2>
                <p className="section-description">
                  Phone numbers awaiting signup. When users create accounts with these numbers,
                  they'll be automatically enrolled and become friends with all group members.
                </p>
                {pendingMembers.length === 0 ? (
                  <p className="empty-state">No pending members</p>
                ) : (
                  <div className="pending-list">
                    {pendingMembers.map((pending, idx) => (
                      <div key={idx} className="pending-item">
                        <div className="pending-phone">{pending.phone}</div>
                        <div className="pending-date">
                          Added {new Date(pending.added_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
