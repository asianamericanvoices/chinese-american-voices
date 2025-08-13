// app/page.js - Updated Chinese American Voices Homepage
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, ChevronRight, Globe, TrendingUp, Users, Building2 } from 'lucide-react';

export default function ChineseAmericanVoices() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories in Chinese
  const categories = [
    { id: 'all', name: '全部新闻', icon: Globe },
    { id: 'Politics', name: '政治', icon: Building2 },
    { id: 'Healthcare', name: '医疗健康', icon: Users },
    { id: 'Education', name: '教育', icon: TrendingUp },
    { id: 'Immigration', name: '移民', icon: Globe },
    { id: 'Economy', name: '经济', icon: TrendingUp },
    { id: 'Culture', name: '文化', icon: Users }
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        console.log('🔍 获取已发布文章...');
        
        const response = await fetch('/api/published-articles?language=chinese&limit=20');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API Response:', data);
        
        if (data.articles && data.articles.length > 0) {
          console.log(`📰 已加载 ${data.articles.length} 篇已发布文章`);
          setArticles(data.articles);
        } else {
          console.log('📋 未找到已发布文章，使用备用数据');
          setArticles(getMockArticles());
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ 获取文章时出错:', error);
        console.log('📋 使用备用数据');
        
        setArticles(getMockArticles());
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Mock data function for fallback
  const getMockArticles = () => {
    return [
      {
        id: 1,
        originalTitle: "Trump calls for U.S. census to exclude for the first time people with no legal status",
        displayTitle: "特朗普呼吁美国人口普查首次排除无合法身份人员",
        aiSummary: "特朗普总统宣布了一项\"新\"人口普查计划，该计划将排除没有合法身份的人员，重新启动了他第一届政府的争议性努力。第十四修正案要求对\"每个州的全部人数\"进行计算，以确定国会代表权。",
        source: "NPR",
        scrapedDate: "2025-08-07",
        topic: "Immigration",
        priority: "high",
        relevanceScore: 8.5,
        imageUrl: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=400&fit=crop",
        originalUrl: "https://www.npr.org/2025/08/07/nx-s1-5265650/new-census-trump-immigrants-counted",
        slug: "trump-census-immigration-policy"
      },
      {
        id: 2,
        originalTitle: "Immigrants who are crime victims and waiting for visas now face deportation",
        displayTitle: "等待签证的犯罪受害者移民现在面临驱逐",
        aiSummary: "一些申请U签证的犯罪受害者移民正在被拘留，这是特朗普政府大规模驱逐行动的一部分。U签证项目旨在帮助犯罪受害者与执法部门合作，但新政策不再保护申请人免于驱逐程序。",
        source: "NBC News",
        scrapedDate: "2025-08-07",
        topic: "Immigration",
        priority: "high",
        relevanceScore: 9.0,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
        originalUrl: "https://www.nbcnews.com/news/latino/immigrants-u-visas-deportation-new-trump-rules-ice-rcna223480",
        slug: "u-visa-deportation-changes"
      },
      {
        id: 3,
        originalTitle: "Trump administration freezes $108M at Duke amid inquiry into alleged racial preferences",
        displayTitle: "特朗普政府因调查涉嫌种族偏好冻结杜克大学1.08亿美元资金",
        aiSummary: "特朗普政府冻结了杜克大学1.08亿美元的研究资金，指控该校通过平权行动政策进行种族歧视。这是继对哈佛、哥伦比亚和康奈尔采取类似行动之后，作为反对多元化、公平和包容项目的更广泛运动的一部分。",
        source: "AP News",
        scrapedDate: "2025-08-07",
        topic: "Education",
        priority: "medium",
        relevanceScore: 7.5,
        imageUrl: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=400&fit=crop",
        originalUrl: "https://apnews.com/article/duke-university-funding-freeze-trump-dei-23a70359ee44a21fdc55bef6dfe52413",
        slug: "duke-university-funding-freeze"
      }
    ];
  };

  // Generate dynamic breaking news ticker from latest articles
  const getBreakingNews = () => {
    if (articles.length === 0) return "新人口普查规则提议 • 主要大学联邦资金被冻结 • 移民执法加强";
    
    const latestNews = articles
      .filter(article => article.priority === 'high' || article.relevanceScore >= 7)
      .slice(0, 5)
      .map(article => {
        const title = article.translatedTitles?.chinese || 
                     article.displayTitle || 
                     article.aiTitle || 
                     article.originalTitle;
        return title.length > 50 ? title.substring(0, 47) + '...' : title;
      })
      .join(' • ');
    
    return latestNews || "最新新闻更新 • 关注华裔美国人社区重要议题";
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.topic === selectedCategory);

  const featuredArticle = filteredArticles[0];
  const otherArticles = filteredArticles.slice(1);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';  
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Helper function to get display content in Chinese
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

  // Generate article URL slug
  const getArticleUrl = (article) => {
    if (article.slug) return `/article/${article.slug}`;
    
    // Generate slug from title
    const title = getDisplayTitle(article);
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .substring(0, 50);        // Limit length
    
    return `/article/${article.id}-${slug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
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
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">中</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">华裔美国人之声</h1>
                <p className="text-xs text-gray-500">Chinese American Voices</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">最新</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">政治</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">社区</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">商业</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">文化</a>
            </nav>

            <div className="flex items-center space-x-4">
              <a 
                href="mailto:contact@chineseamericanvoices.com" 
                className="text-gray-700 hover:text-red-600 text-sm font-medium"
              >
                联系我们
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Breaking News Ticker - Now Dynamic */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center">
            <span className="bg-white text-red-600 px-2 py-1 text-xs font-bold rounded mr-4">
              突发新闻
            </span>
            <div className="overflow-hidden flex-1">
              <div className="animate-scroll whitespace-nowrap text-sm">
                {getBreakingNews()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center py-4 space-x-8 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Article */}
          <div className="lg:col-span-2">
            {featuredArticle && (
              <article className="group cursor-pointer">
                <a href={getArticleUrl(featuredArticle)} className="block">
                  <div className="relative">
                    <img 
                      src={featuredArticle.imageUrl} 
                      alt={getDisplayTitle(featuredArticle)}
                      className="w-full h-64 lg:h-80 object-cover rounded-lg"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(featuredArticle.priority)}`}>
                        {categories.find(cat => cat.id === featuredArticle.topic)?.name || featuredArticle.topic}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors font-chinese">
                      {getDisplayTitle(featuredArticle)}
                    </h1>
                    
                    <div className="mt-4 flex items-center text-sm text-gray-600 space-x-4">
                      <span>{featuredArticle.source}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(featuredArticle.scrapedDate)}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <p className="text-lg text-gray-700 leading-relaxed font-chinese">
                        {getDisplaySummary(featuredArticle)}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium">
                        <span>阅读全文</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                      
                      <a 
                        href={featuredArticle.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>原文链接</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </a>
              </article>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center font-chinese">
                <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                热门新闻
              </h2>
              
              <div className="space-y-4">
                {otherArticles.slice(0, 3).map((article, index) => (
                  <article key={article.id} className="group cursor-pointer">
                    <a href={getArticleUrl(article)} className="block">
                      <div className="flex space-x-3">
                        <span className="text-2xl font-bold text-red-600 mt-1">
                          {index + 2}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors leading-tight font-chinese">
                            {getDisplayTitle(article)}
                          </h3>
                          <div className="mt-2 flex items-center text-xs text-gray-500 space-x-2">
                            <span>{article.source}</span>
                            <span>•</span>
                            <span>{formatDate(article.scrapedDate)}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-red-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2 font-chinese">
                订阅新闻
              </h2>
              <p className="text-sm text-gray-600 mb-4 font-chinese">
                获取影响华裔美国人社区的最新新闻，直接发送到您的收件箱。
              </p>
              <div className="space-y-3">
                <input 
                  type="email" 
                  placeholder="输入您的邮箱"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  订阅
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Articles Grid */}
        {otherArticles.length > 3 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 font-chinese">更多新闻</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherArticles.slice(3).map((article) => (
                <article key={article.id} className="group cursor-pointer">
                  <a href={getArticleUrl(article)} className="block">
                    <div className="relative">
                      <img 
                        src={article.imageUrl} 
                        alt={getDisplayTitle(article)}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(article.priority)}`}>
                          {categories.find(cat => cat.id === article.topic)?.name || article.topic}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors leading-tight font-chinese">
                        {getDisplayTitle(article)}
                      </h3>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-600 space-x-3">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{formatDate(article.scrapedDate)}</span>
                      </div>

                      <p className="mt-3 text-gray-700 text-sm leading-relaxed line-clamp-3 font-chinese">
                        {getDisplaySummary(article).substring(0, 150)}...
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium">
                          <span>阅读更多</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                        <a 
                          href={article.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-gray-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          原文
                        </a>
                      </div>
                    </div>
                  </a>
                </article>
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
                <li><a href="#" className="text-gray-400 hover:text-white font-chinese">政治</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-chinese">医疗健康</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-chinese">教育</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-chinese">移民</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 font-chinese">关于我们</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white font-chinese">我们的使命</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-chinese">联系我们</a></li>
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
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .font-chinese {
          font-family: 'Noto Sans SC', 'SimSun', serif;
        }
      `}</style>
    </div>
  );
}
