// app/article/[slug]/page.js - Individual Article Page
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, ArrowLeft, Share2 } from 'lucide-react';
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getDisplayTitle(article),
          text: getDisplaySummary(article).substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
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
            <span className="font-medium">{article.topic}</span>
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
                {article.topic}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 font-chinese">
              {getDisplayTitle(article)}
            </h1>
            
            {article.originalTitle !== getDisplayTitle(article) && (
              <p className="text-lg text-gray-600 mb-6 italic">
                原标题：{article.originalTitle}
              </p>
            )}
            
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="font-medium">{getAuthorDisplay(article.author, article.source)}</span>
                <span>•</span>
                <span>{article.source}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(article.scrapedDate)}</span>
                </div>
              </div>
              
              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">分享</span>
              </button>
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
            </div>
          )}

          {/* Article Summary */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-600">
              <h2 className="text-lg font-bold text-gray-900 mb-3 font-chinese">文章摘要</h2>
              <div 
                className="text-gray-700 font-chinese leading-relaxed"
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
                  href={`/article/${relatedArticle.id}-${getDisplayTitle(relatedArticle).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50)}`}
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
