import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: weeklyMetrics } = await supabaseAdmin.rpc('get_weekly_metrics');
    const { data: userMetrics } = await supabaseAdmin.rpc('get_user_weekly_metrics');

    return NextResponse.json({
      weekly: weeklyMetrics || [],
      users: userMetrics || [],
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
