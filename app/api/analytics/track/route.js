// app/api/analytics/track/route.js - Analytics tracking endpoint
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

// Hash IP for privacy compliance
function hashIP(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'chinese-american-voices').digest('hex').substring(0, 16);
}

// Get client IP from headers
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  if (cfIP) return cfIP;
  return null;
}

// Detect language from event data or user agent
function detectLanguage(metadata) {
  if (metadata.article_language) return metadata.article_language;
  if (metadata.page_url && metadata.page_url.includes('/zh/')) return 'zh';
  if (metadata.page_url && metadata.page_url.includes('/ko/')) return 'ko';
  
  // Default to Chinese for Chinese American Voices
  return 'zh';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { event_type, metadata = {} } = body;
    
    if (!event_type) {
      return NextResponse.json({ error: 'event_type is required' }, { status: 400 });
    }

    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);
    const language = detectLanguage(metadata);
    
    // Prepare analytics event data
    const eventData = {
      event_type,
      article_id: metadata.article_id || null,
      session_id: metadata.session_id || null,
      metadata: metadata,
      ip_hash: ipHash,
      user_agent: metadata.user_agent || request.headers.get('user-agent'),
      referrer: metadata.referrer || request.headers.get('referer'),
      platform: metadata.platform || 'unknown',
      page_url: metadata.page_url || null,
      page_title: metadata.page_title || null,
      language: language
    };

    // Insert into analytics_events table
    const { data: analyticsResult, error: analyticsError } = await supabase
      .from('analytics_events')
      .insert(eventData)
      .select();

    if (analyticsError) {
      console.error('Analytics insert error:', analyticsError);
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }

    // Handle specific event types with additional tracking
    switch (event_type) {
      case 'share':
        await handleShareEvent(metadata, ipHash, language);
        break;
      
      case 'reading_start':
        await handleReadingStart(metadata);
        break;
      
      case 'reading_progress':
        await handleReadingProgress(metadata);
        break;
      
      case 'reading_complete':
        await handleReadingComplete(metadata);
        break;
    }

    return NextResponse.json({ 
      success: true, 
      event_id: analyticsResult[0]?.id,
      tracked_language: language 
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle social sharing events
async function handleShareEvent(metadata, ipHash, language) {
  try {
    const shareData = {
      article_id: metadata.article_id,
      platform: metadata.method || metadata.platform,
      article_title: metadata.content_title,
      share_url: metadata.share_url,
      session_id: metadata.session_id,
      ip_hash: ipHash,
      language: language,
      success: metadata.success !== false
    };

    const { error } = await supabase
      .from('social_shares')
      .insert(shareData);

    if (error) {
      console.error('Share tracking error:', error);
    }
  } catch (error) {
    console.error('Share event handling error:', error);
  }
}

// Handle reading session start
async function handleReadingStart(metadata) {
  try {
    const readingData = {
      session_id: metadata.session_id,
      article_id: metadata.article_id,
      platform: metadata.platform,
      language: metadata.article_language || 'zh'
    };

    const { error } = await supabase
      .from('reading_sessions')
      .insert(readingData);

    if (error) {
      console.error('Reading start tracking error:', error);
    }
  } catch (error) {
    console.error('Reading start handling error:', error);
  }
}

// Handle reading progress updates
async function handleReadingProgress(metadata) {
  try {
    const { error } = await supabase
      .from('reading_sessions')
      .update({
        reading_time_seconds: metadata.reading_time_seconds || 0,
        scroll_depth_percent: metadata.scroll_depth_percent || 0,
        ended_at: new Date().toISOString()
      })
      .eq('session_id', metadata.session_id)
      .eq('article_id', metadata.article_id);

    if (error) {
      console.error('Reading progress tracking error:', error);
    }
  } catch (error) {
    console.error('Reading progress handling error:', error);
  }
}

// Handle reading completion
async function handleReadingComplete(metadata) {
  try {
    const { error } = await supabase
      .from('reading_sessions')
      .update({
        reading_time_seconds: metadata.reading_time_seconds || 0,
        scroll_depth_percent: 100,
        completed: true,
        ended_at: new Date().toISOString()
      })
      .eq('session_id', metadata.session_id)
      .eq('article_id', metadata.article_id);

    if (error) {
      console.error('Reading completion tracking error:', error);
    }
  } catch (error) {
    console.error('Reading completion handling error:', error);
  }
}

// GET endpoint for basic health check
export async function GET() {
  return NextResponse.json({ 
    status: 'Analytics API active',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
