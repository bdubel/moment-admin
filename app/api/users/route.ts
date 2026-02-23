import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, created_at, avatar_url')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!users) {
      return NextResponse.json([]);
    }

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const { count: postCount } = await supabaseAdmin
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: friendCount } = await supabaseAdmin
          .from('friend_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'accepted')
          .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);

        const { count: groupCount } = await supabaseAdmin
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          ...user,
          post_count: postCount || 0,
          friend_count: friendCount || 0,
          group_count: groupCount || 0,
        };
      })
    );

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
