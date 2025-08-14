// app/dashboard/page.js - Real-time analytics dashboard
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Users, 
  Share2, 
  Clock, 
  TrendingUp, 
  Smartphone, 
  Globe, 
  RefreshCw,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch dashboard data
  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const response = await fetch(`/api/analytics/dashboard?timeframe=${timeframe}`);
      const result = await response.json();
      
      if (response.ok) {
        setData(result);
      } else {
        console.error('Dashboard API error:', result);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial load and timeframe changes
  useEffect(() => {
    fetchData();
  }, [timeframe]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData(false); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, timeframe]);

  // Get platform display info
  const getPlatformInfo = (platform) => {
    const platformMap = {
      'wechat': { name: '微信 WeChat', color: 'text-green-600', emoji: '💬' },
      'whatsapp': { name: 'WhatsApp', color: 'text-green-500', emoji: '📱' },
      'facebook': { name: 'Facebook', color: 'text-blue-600', emoji: '👥' },
      'twitter': { name: 'Twitter/X', color: 'text-blue-400', emoji: '🐦' },
      'direct': { name: '直接访问 Direct', color: 'text-gray-600', emoji: '🌐' },
      'referral': { name: '推荐链接 Referral', color: 'text-purple-600', emoji: '🔗' },
      'unknown': { name: '未知 Unknown', color: 'text-gray-400', emoji: '❓' }
    };
    return platformMap[platform] || platformMap['unknown'];
  };

  // Get timeframe display
  const getTimeframeDisplay = (tf) => {
    const map = {
      '1h': '过去1小时',
      '24h': '过去24小时', 
      '7d': '过去7天',
      '30d': '过去30天'
    };
    return map[tf] || map['24h'];
  };

  // Format time for recent events
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}小时前`;
    return time.toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-chinese">正在加载分析数据...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-chinese">无法加载数据</p>
          <button 
            onClick={() => fetchData()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const { realTimeMetrics, topArticles, platformBreakdown, shareBreakdown, hourlyActivity, recentEvents } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-chinese">
                华裔美国人之声 - 实时分析
              </h1>
              <p className="text-sm text-gray-500">Chinese American Voices Analytics</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="1h">过去1小时</option>
                <option value="24h">过去24小时</option>
                <option value="7d">过去7天</option>
                <option value="30d">过去30天</option>
              </select>

              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{autoRefresh ? '实时更新' : '手动刷新'}</span>
              </button>

              {/* Manual Refresh */}
              <button
                onClick={() => fetchData()}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>刷新</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">页面浏览量</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.pageViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">独立访客</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.uniqueVisitors.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">社交分享</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.totalShares.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-chinese">活跃读者</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.activeReaders.toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-chinese">过去5分钟</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Reading Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 font-chinese">平均阅读时间</p>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-900">{Math.floor(realTimeMetrics.avgReadingTime / 60)}分{realTimeMetrics.avgReadingTime % 60}秒</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 font-chinese">平均滚动深度</p>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-900">{realTimeMetrics.avgScrollDepth}%</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 font-chinese">完成阅读率</p>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-900">{realTimeMetrics.completionRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Articles */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-chinese">热门文章</h3>
            <div className="space-y-3">
              {topArticles.length > 0 ? topArticles.map((article, index) => (
                <div key={article.article_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-red-600">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm line-clamp-2 font-chinese">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500">{article.topic}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-600">{article.views}次</span>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4 font-chinese">暂无数据</p>
              )}
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-chinese">访问平台分布</h3>
            <div className="space-y-3">
              {platformBreakdown.length > 0 ? platformBreakdown.map((platform) => {
                const info = getPlatformInfo(platform.platform);
                const percentage = Math.round((platform.count / realTimeMetrics.pageViews) * 100);
                
                return (
                  <div key={platform.platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{info.emoji}</span>
                      <span className={`font-medium ${info.color} font-chinese`}>{info.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {platform.count}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-gray-500 text-center py-4 font-chinese">暂无数据</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Social Sharing Breakdown */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-chinese">社交分享统计</h3>
            <div className="space-y-3">
              {shareBreakdown.length > 0 ? shareBreakdown.map((share) => {
                const info = getPlatformInfo(share.platform);
                const percentage = realTimeMetrics.totalShares > 0 
                  ? Math.round((share.count / realTimeMetrics.totalShares) * 100)
                  : 0;
                
                return (
                  <div key={share.platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{info.emoji}</span>
                      <span className={`font-medium ${info.color} font-chinese`}>{info.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {share.count}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-gray-500 text-center py-4 font-chinese">暂无分享数据</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-chinese">实时活动</h3>
            <div className="space-y-3">
              {recentEvents.length > 0 ? recentEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-chinese line-clamp-1">
                      {event.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{formatTime(event.timestamp)}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{getPlatformInfo(event.platform).name}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4 font-chinese">暂无活动</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="font-chinese">
            最后更新: {new Date(data.lastUpdated).toLocaleString('zh-CN')} | 
            时间范围: {getTimeframeDisplay(timeframe)}
          </p>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .font-chinese {
          font-family: 'Noto Sans SC', 'SimSun', serif;
        }
      `}</style>
    </div>
  );
}
