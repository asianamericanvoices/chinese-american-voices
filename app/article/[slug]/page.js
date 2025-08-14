// app/article/[slug]/page.js - Individual Article Page
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, ArrowLeft, Share2 } from 'lucide-react';
import { 
  shareToWeChat, 
  shareToWhatsApp, 
  shareToFacebook, 
  shareToTwitter, 
  shareToEmail, 
  copyToClipboard,
  nativeShare 
} from '../../../lib/sharing';
import Link from 'next/link';

export default function ArticlePage({ params }) {
  // Handle the async params in Next.js 13+ App Router
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    // Unwrap params if they're a Promise (Next.js 15+)
    const getSlug = async () => {
      const resolvedParams = await Promise.resolve(params);
      setSlug(resolvedParams.slug);
    };
    
    if (params) {
      if (typeof params === 'object' && params.slug) {
        setSlug(params.slug);
      } else {
        getSlug();
      }
    }
  }, [params]);
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    
    const fetchArticle = async () => {
      try {
        // For simplified URLs, slug is just the article ID
        const articleId = slug.toString();
        
        // Fetch all articles and find the matching one
        const response = await fetch('/api/published-articles?language=chinese&limit=50');
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        
        // Find by ID
        const foundArticle = data.articles.find(a => a.id.toString() === articleId);
        
        if (!foundArticle) {
          console.error('Article not found for ID:', articleId);
          console.log('Available articles:', data.articles.map(a => ({id: a.id, title: a.originalTitle})));
          setError('文章未找到');
          setLoading(false);
          return;
        }
        
        setArticle(foundArticle);
        
        // Get related articles from same topic
        const related = data.articles
          .filter(a => a.id !== foundArticle.id && a.topic === foundArticle.topic)
          .slice(0, 3);
        setRelatedArticles(related);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('加载文章时出错');
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // Analytics tracking useEffect - NEWLY ADDED
  useEffect(() => {
    if (article && typeof window !== 'undefined' && typeof window.trackEvent === 'function') {
      console.log('📊 Tracking article view:', article.id);
      
      // Track article page view
      window.trackEvent('page_view', {
        article_id: article.id,
        article_title: getDisplayTitle(article),
        article_topic: article.topic,
        article_source: article.source,
        article_language: 'zh',
        content_type: 'article'
      });

      // Track reading session start
      window.trackEvent('reading_start', {
        article_id: article.id,
        article_title: getDisplayTitle(article),
        article_language: 'zh'
      });
    }
  }, [article]);

  const getCategoryNameInChinese = (topic) => {
    const categoryMap = {
      'Politics': '政治',
      'Healthcare': '医疗健康', 
      'Education': '教育',
      'Immigration': '移民',
      'Economy': '经济',
      'Culture': '文化',
      'General': '综合'
    };
    return categoryMap[topic] || topic;
  };

  const getDisplayTitle = (article) => {
    return article.translatedTitles?.chinese || 
           article.displayTitle || 
           article.aiTitle || 
           article.originalTitle;
  };

  const getDisplaySummary = (article) => {
    return article.translations?.chinese || 
           article.aiSummary || 
           '暂无中文摘要';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const getAuthorDisplay = (author, source) => {
    if (author && 
        author !== 'N/A' && 
        author !== 'Unknown' && 
        author !== 'Staff' &&
        author.trim().length > 0) {
      return author;
    }
    
    switch (source?.toLowerCase()) {
      case 'npr':
        return 'NPR 记者';
      case 'ap news':
        return '美联社记者';
      case 'nbc news':
        return 'NBC 新闻记者';
      case 'abc news':
        return 'ABC 新闻记者';
      default:
        return '本站记者';
    }
  };

  // Platform-specific share handler
  const handlePlatformShare = async (platform) => {
    const title = getDisplayTitle(article);
    const summary = getDisplaySummary(article);
    
    console.log(`📤 Sharing to ${platform}:`, title);
    
    try {
      let success = false;
      
      switch (platform) {
        case 'wechat':
          success = await shareToWeChat(article.id, title, article.imageUrl);
          break;
        case 'whatsapp':
          success = await shareToWhatsApp(article.id, title);
          break;
        case 'facebook':
          success = await shareToFacebook(article.id, title);
          break;
        case 'twitter':
          success = await shareToTwitter(article.id, title);
          break;
        case 'email':
          success = await shareToEmail(article.id, title, summary);
          break;
        case 'copy':
          success = await copyToClipboard(article.id, title);
          break;
        case 'native':
        default:
          success = await nativeShare(article.id, title, summary);
          break;
      }
      
      if (success) {
        console.log(`✅ Successfully shared to ${platform}`);
      } else {
        console.log(`❌ Failed to share to ${platform}`);
      }
      
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">中</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">华裔美国人之声</h1>
                  <p className="text-xs text-gray-500">Chinese American Voices</p>
                </div>
              </Link>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载文章...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">中</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">华裔美国人之声</h1>
                  <p className="text-xs text-gray-500">Chinese American Voices</p>
                </div>
              </Link>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <p className="text-gray-600 mb-8">抱歉，我们无法找到您要查看的文章。</p>
          <Link href="/" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">中</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">华裔美国人之声</h1>
                <p className="text-xs text-gray-500">Chinese American Voices</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-red-600 font-medium">最新</Link>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">政治</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">社区</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">商业</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">文化</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600 transition-colors">首页</Link>
            <span>›</span>
            <span className="font-medium">{getCategoryNameInChinese(article.topic)}</span>
            <span>›</span>
            <span className="text-gray-900">文章详情</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
        </div>

        <article>
          {/* Article Header */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                {getCategoryNameInChinese(article.topic)}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 font-chinese">
              {getDisplayTitle(article)}
            </h1>
            
            {/* Journalistic Byline/Dateline */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="text-sm text-gray-600 leading-relaxed">
                <div className="flex flex-wrap items-center gap-1">
                  {article.dateline && (
                    <>
                      <span className="font-medium text-gray-900">
                        {article.dateline}消息
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span className="font-medium">
                    {getAuthorDisplay(article.author, article.source)}
                  </span>
                  <span>•</span>
                  <span>{formatDate(article.scrapedDate)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div></div>
              
              {/* Enhanced Share Buttons */}
              <div className="flex items-center space-x-4">
                {/* WeChat Share */}
                <button 
                  onClick={() => handlePlatformShare('wechat')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors group"
                  title="分享到微信 (Share to WeChat)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.206-1.416 5.911.003.22.183.425.384.617.597.1-.065.195-.142.29-.218.863-.693 1.83-1.26 2.926-1.26.276 0 .543.027.811.05-.857-2.578.157-4.972 1.932-6.446C20.064 2.659 22.567 2.658 24 4.076"/>
                  </svg>
                  <span className="text-sm hidden md:inline">微信</span>
                </button>

                {/* WhatsApp Share */}
                <button 
                  onClick={() => handlePlatformShare('whatsapp')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
                  title="分享到WhatsApp (Share to WhatsApp)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                  </svg>
                  <span className="text-sm hidden md:inline">WhatsApp</span>
                </button>

                {/* Facebook Share */}
                <button 
                  onClick={() => handlePlatformShare('facebook')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title="分享到Facebook (Share to Facebook)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm hidden md:inline">Facebook</span>
                </button>

                {/* Twitter Share */}
                <button 
                  onClick={() => handlePlatformShare('twitter')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-400 transition-colors"
                  title="分享到Twitter (Share to Twitter)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="text-sm hidden md:inline">Twitter</span>
                </button>

                {/* Email Share */}
                <button 
                  onClick={() => handlePlatformShare('email')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="通过邮件分享 (Share by Email)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819A1.636 1.636 0 0 1 24 5.457z"/>
                  </svg>
                  <span className="text-sm hidden md:inline">邮件</span>
                </button>

                {/* Copy Link */}
                <button 
                  onClick={() => handlePlatformShare('copy')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="复制链接 (Copy Link)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                  <span className="text-sm hidden md:inline">复制</span>
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.imageUrl && (
            <div className="mb-8">
              <img 
                src={article.imageUrl}
                alt={getDisplayTitle(article)}
                className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
              />
              <p className="text-xs text-gray-500 italic mt-2 text-center font-chinese">
                图片由 Freepik Mystic AI 生成
              </p>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="text-gray-700 font-chinese leading-relaxed text-lg">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: getDisplaySummary(article).replace(/\n/g, '<br>') 
                }}
              />
            </div>
          </div>

          {/* Original Article Link */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3 font-chinese">阅读原文</h3>
            <p className="text-gray-700 mb-4 font-chinese">
              点击下方链接阅读来自 {article.source} 的完整原文报道。
            </p>
            <a 
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>前往 {article.source}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 font-chinese">相关新闻</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link 
                  key={relatedArticle.id}
                  href={`/article/${relatedArticle.id}`}
                  className="group"
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <img 
                      src={relatedArticle.imageUrl}
                      alt={getDisplayTitle(relatedArticle)}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 font-chinese">
                        {getDisplayTitle(relatedArticle)}
                      </h3>
                      <div className="mt-2 flex items-center text-xs text-gray-500 space-x-2">
                        <span>{relatedArticle.source}</span>
                        <span>•</span>
                        <span>{formatDate(relatedArticle.scrapedDate)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">中</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-chinese">华裔美国人之声</h3>
                  <p className="text-sm text-gray-400">Chinese American Voices</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-chinese">
                放大华裔美国人社区重要故事的声音。专注于影响我们社区问题的独立新闻报道。
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 font-chinese">新闻类别</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-white font-chinese">政治</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white font-chinese">医疗健康</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white font-chinese">教育</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white font-chinese">移民</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 font-chinese">关于我们</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white font-chinese">我们的使命</a></li>
                <li><a href="mailto:contact@chineseamericanvoices.com" className="text-gray-400 hover:text-white font-chinese">联系我们</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-chinese">隐私政策</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-chinese">使用条款</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p className="font-chinese">&copy; 2025 华裔美国人之声。保留所有权利。</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
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
