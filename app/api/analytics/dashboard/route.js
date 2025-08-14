// app/api/analytics/dashboard/route.js - Real-time analytics API
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

// Helper function to get time range
function getTimeRange(period) {
  const now = new Date();
  const ranges = {
    '1h': new Date(now.getTime() - 60 * 60 * 1000),
    '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    'all': new Date('2025-01-01')
  };
  return ranges[period] || ranges['24h'];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const cutoffTime = getTimeRange(timeframe);

    // 1. REAL-TIME METRICS
    const realTimeMetrics = await Promise.all([
      // Total page views
      supabase
        .from('analytics_events')
        .select('id', { count: 'exact' })
        .eq('event_type', 'page_view')
        .gte('timestamp', cutoffTime.toISOString()),

      // Unique visitors (sessions)
      supabase
        .from('analytics_events')
        .select('session_id')
        .eq('event_type', 'page_view')
        .gte('timestamp', cutoffTime.toISOString()),

      // Total shares
      supabase
        .from('social_shares')
        .select('id', { count: 'exact' })
        .gte('timestamp', cutoffTime.toISOString()),

      // Active readers (last 5 minutes)
      supabase
        .from('analytics_events')
        .select('session_id')
        .in('event_type', ['page_view', 'reading_progress'])
        .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    ]);

    const [pageViewsResult, sessionsResult, sharesResult, activeResult] = realTimeMetrics;

    // Calculate unique visitors
    const uniqueVisitors = new Set(
      sessionsResult.data?.map(row => row.session_id) || []
    ).size;

    // Calculate active readers
    const activeReaders = new Set(
      activeResult.data?.map(row => row.session_id) || []
    ).size;

    // 2. TOP ARTICLES PERFORMANCE
    const { data: topArticles } = await supabase
      .from('analytics_events')
      .select(`
        article_id,
        metadata
      `)
      .eq('event_type', 'page_view')
      .not('article_id', 'is', null)
      .gte('timestamp', cutoffTime.toISOString());

    // Group by article and count views
    const articleViews = {};
    topArticles?.forEach(event => {
      if (event.article_id) {
        if (!articleViews[event.article_id]) {
          articleViews[event.article_id] = {
            article_id: event.article_id,
            views: 0,
            title: 'Unknown Article',
            topic: 'General'
          };
        }
        articleViews[event.article_id].views++;
        
        // Extract title from metadata if available
        try {
          const metadata = typeof event.metadata === 'string' 
            ? JSON.parse(event.metadata) 
            : event.metadata;
          if (metadata?.article_title) {
            articleViews[event.article_id].title = metadata.article_title;
          }
          if (metadata?.article_topic) {
            articleViews[event.article_id].topic = metadata.article_topic;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    const topArticlesList = Object.values(articleViews)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // 3. PLATFORM BREAKDOWN
    const { data: platformData } = await supabase
      .from('analytics_events')
      .select('platform')
      .eq('event_type', 'page_view')
      .gte('timestamp', cutoffTime.toISOString());

    const platformStats = {};
    platformData?.forEach(event => {
      const platform = event.platform || 'unknown';
      platformStats[platform] = (platformStats[platform] || 0) + 1;
    });

    const platformBreakdown = Object.entries(platformStats)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);

    // 4. SOCIAL SHARING BREAKDOWN
    const { data: shareData } = await supabase
      .from('social_shares')
      .select('platform')
      .gte('timestamp', cutoffTime.toISOString());

    const shareStats = {};
    shareData?.forEach(share => {
      const platform = share.platform || 'unknown';
      shareStats[platform] = (shareStats[platform] || 0) + 1;
    });

    const shareBreakdown = Object.entries(shareStats)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);

    // 5. HOURLY ACTIVITY (for charts)
    const { data: hourlyData } = await supabase
      .from('analytics_events')
      .select('timestamp, event_type')
      .eq('event_type', 'page_view')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    // Group by hour
    const hourlyActivity = {};
    hourlyData?.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    const hourlyChart = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      views: hourlyActivity[hour] || 0
    }));

    // 6. READING ENGAGEMENT
    const { data: readingData } = await supabase
      .from('reading_sessions')
      .select('reading_time_seconds, scroll_depth_percent, completed')
      .gte('started_at', cutoffTime.toISOString());

    const avgReadingTime = readingData?.length > 0 
      ? Math.round(readingData.reduce((sum, session) => sum + (session.reading_time_seconds || 0), 0) / readingData.length)
      : 0;

    const avgScrollDepth = readingData?.length > 0
      ? Math.round(readingData.reduce((sum, session) => sum + (session.scroll_depth_percent || 0), 0) / readingData.length)
      : 0;

    const completionRate = readingData?.length > 0
      ? Math.round((readingData.filter(session => session.completed).length / readingData.length) * 100)
      : 0;

    // 7. REAL-TIME EVENTS (last 10 events)
    const { data: recentEvents } = await supabase
      .from('analytics_events')
      .select('timestamp, event_type, platform, metadata, page_title')
      .order('timestamp', { ascending: false })
      .limit(10);

    const formattedEvents = recentEvents?.map(event => {
      let title = event.page_title || 'Unknown Page';
      let action = event.event_type;
      
      try {
        const metadata = typeof event.metadata === 'string' 
          ? JSON.parse(event.metadata) 
          : event.metadata;
        if (metadata?.article_title) {
          title = metadata.article_title;
        }
      } catch (e) {
        // Ignore parsing errors
      }

      return {
        timestamp: event.timestamp,
        action: action,
        platform: event.platform,
        title: title.length > 50 ? title.substring(0, 47) + '...' : title
      };
    }) || [];

    // Response data
    const dashboardData = {
      realTimeMetrics: {
        pageViews: pageViewsResult.count || 0,
        uniqueVisitors: uniqueVisitors,
        totalShares: sharesResult.count || 0,
        activeReaders: activeReaders,
        avgReadingTime: avgReadingTime,
        avgScrollDepth: avgScrollDepth,
        completionRate: completionRate
      },
      topArticles: topArticlesList,
      platformBreakdown: platformBreakdown,
      shareBreakdown: shareBreakdown,
      hourlyActivity: hourlyChart,
      recentEvents: formattedEvents,
      timeframe: timeframe,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint for dashboard actions (like refreshing data)
export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'refresh') {
      // Could trigger data refresh, cleanup, etc.
      return NextResponse.json({ success: true, message: 'Data refreshed' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Dashboard POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
