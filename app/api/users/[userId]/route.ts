import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get posts
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get friends
    const { data: friendRequests } = await supabaseAdmin
      .from('friend_requests')
      .select('id, status, created_at, from_user_id, to_user_id')
      .eq('status', 'accepted')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    let friends: any[] = [];
    if (friendRequests && friendRequests.length > 0) {
      const friendIds = friendRequests.map((fr) =>
        fr.from_user_id === userId ? fr.to_user_id : fr.from_user_id
      );

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', friendIds);

      friends = (profiles || []).map((profile) => ({
        ...profile,
        status: 'accepted',
        created_at: friendRequests.find((fr) =>
          fr.from_user_id === profile.id || fr.to_user_id === profile.id
        )?.created_at || '',
      }));
    }

    // Get groups
    const { data: groupMembers } = await supabaseAdmin
      .from('group_members')
      .select(`
        group_id,
        groups (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', userId);

    let groups: any[] = [];
    if (groupMembers) {
      groups = await Promise.all(
        groupMembers
          .filter((item) => item.groups)
          .map(async (item) => {
            const group = item.groups as any;
            const { count } = await supabaseAdmin
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);

            return {
              id: group.id,
              name: group.name,
              created_at: group.created_at,
              member_count: count || 0,
            };
          })
      );
    }

    return NextResponse.json({
      posts: posts || [],
      friends,
      groups,
    });
  } catch (error) {
    console.error('Error fetching user detail:', error);
    return NextResponse.json({ error: 'Failed to fetch user detail' }, { status: 500 });
  }
}
