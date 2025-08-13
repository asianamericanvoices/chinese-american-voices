// app/page.js - Chinese American Voices Homepage
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, ChevronRight, Globe, TrendingUp, Users, Building2 } from 'lucide-react';

export default function ChineseAmericanVoices() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Stories', icon: Globe },
    { id: 'Politics', name: 'Politics', icon: Building2 },
    { id: 'Healthcare', name: 'Healthcare', icon: Users },
    { id: 'Education', name: 'Education', icon: TrendingUp },
    { id: 'Immigration', name: 'Immigration', icon: Globe },
    { id: 'Economy', name: 'Economy', icon: TrendingUp }
  ];

  useEffect(() => {
    // In production, this would connect to your Supabase API
    // For demo, using sample data structure matching your dashboard
    const fetchArticles = async () => {
      try {
        // This would be: const response = await fetch('/api/published-articles');
        // For now, using mock data with your actual article structure
        const mockArticles = [
          {
            id: 1,
            originalTitle: "Trump calls for U.S. census to exclude for the first time people with no legal status",
            displayTitle: "New Census Rules Target Undocumented Immigrants",
            aiSummary: "President Trump announced plans for a 'new' census that would exclude people without legal status, renewing controversial efforts from his first administration. The 14th Amendment requires counting the 'whole number of persons in each state' for congressional representation.",
            translations: {
              chinese: "特朗普总统宣布了一项"新"人口普查计划，该计划将排除没有合法身份的人员，重新启动了他第一届政府的争议性努力。第十四修正案要求对"每个州的全部人数"进行计算，以确定国会代表权。"
            },
            source: "NPR",
            scrapedDate: "2025-08-07",
            topic: "Immigration",
            priority: "high",
            relevanceScore: 8.5,
            imageUrl: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=400&fit=crop",
            originalUrl: "https://www.npr.org/2025/08/07/nx-s1-5265650/new-census-trump-immigrants-counted"
          },
          {
            id: 2,
            originalTitle: "Immigrants who are crime victims and waiting for visas now face deportation",
            displayTitle: "U-Visa Recipients Face New Deportation Threats",
            aiSummary: "Some immigrants who've applied for U visas as crime victims are being detained as part of the Trump administration's mass deportation campaign. The U visa program was designed to help victims of crimes cooperate with law enforcement.",
            translations: {
              chinese: "一些申请U签证的犯罪受害者移民正在被拘留，这是特朗普政府大规模驱逐行动的一部分。U签证项目旨在帮助犯罪受害者与执法部门合作。"
            },
            source: "NBC News",
            scrapedDate: "2025-08-07",
            topic: "Immigration",
            priority: "high",
            relevanceScore: 9.0,
            imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
            originalUrl: "https://www.nbcnews.com/news/latino/immigrants-u-visas-deportation-new-trump-rules-ice-rcna223480"
          },
          {
            id: 3,
            originalTitle: "Trump administration freezes $108M at Duke amid inquiry into alleged racial preferences",
            displayTitle: "Duke University Loses Federal Funding Over DEI Policies",
            aiSummary: "The Trump administration frozen $108 million in research funding to Duke University, accusing the school of racial discrimination through affirmative action policies. This follows similar actions against Harvard, Columbia, and Cornell.",
            translations: {
              chinese: "特朗普政府冻结了杜克大学1.08亿美元的研究资金，指控该校通过平权行动政策进行种族歧视。这是继对哈佛、哥伦比亚和康奈尔采取类似行动之后。"
            },
            source: "AP News",
            scrapedDate: "2025-08-07",
            topic: "Education",
            priority: "medium",
            relevanceScore: 7.5,
            imageUrl: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=400&fit=crop",
            originalUrl: "https://apnews.com/article/duke-university-funding-freeze-trump-dei-23a70359ee44a21fdc55bef6dfe52413"
          },
          {
            id: 4,
            originalTitle: "As Ichiro Suzuki becomes 1st Asian MLB Hall of Famer, Asian players share how he paved the way for them",
            displayTitle: "Ichiro's Historic Hall of Fame Induction Inspires Asian Athletes",
            aiSummary: "Ichiro Suzuki becomes the first Asian player inducted into the Baseball Hall of Fame, with Asian American players crediting him for paving the way. His 19-year MLB career included 10 All-Star selections and 10 Gold Glove awards.",
            translations: {
              chinese: "铃木一朗成为首位入选棒球名人堂的亚洲球员，亚裔美国球员称赞他为后来者铺平了道路。他19年的大联盟职业生涯包括10次全明星入选和10个金手套奖。"
            },
            source: "NBC News",
            scrapedDate: "2025-08-07",
            topic: "Culture",
            priority: "medium",
            relevanceScore: 8.0,
            imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop",
            originalUrl: "https://www.nbcnews.com/news/asian-america/ichiro-suzuki-becomes-1st-asian-mlb-hall-famer-asian-players-rcna220513"
          }
        ];
        
        setArticles(mockArticles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Chinese American Voices</h1>
                <p className="text-xs text-gray-500">华裔美国人之声</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Latest</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Politics</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Community</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Business</a>
              <a href="#" className="text-gray-700 hover:text-red-600 font-medium">Culture</a>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-red-600 text-sm font-medium">
                English
              </button>
              <div className="w-px h-4 bg-gray-300"></div>
              <button className="text-red-600 text-sm font-medium">
                中文
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center">
            <span className="bg-white text-red-600 px-2 py-1 text-xs font-bold rounded mr-4">
              BREAKING
            </span>
            <div className="overflow-hidden flex-1">
              <div className="animate-scroll whitespace-nowrap text-sm">
                New census rules proposed • Federal funding frozen at major universities • Immigration enforcement increases
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
                <div className="relative">
                  <img 
                    src={featuredArticle.imageUrl} 
                    alt={featuredArticle.displayTitle}
                    className="w-full h-64 lg:h-80 object-cover rounded-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(featuredArticle.priority)}`}>
                      {featuredArticle.topic}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                    {featuredArticle.displayTitle || featuredArticle.originalTitle}
                  </h1>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-600 space-x-4">
                    <span>{featuredArticle.source}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(featuredArticle.scrapedDate)}</span>
                    </div>
                    <span>•</span>
                    <span>Relevance: {featuredArticle.relevanceScore}/10</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {featuredArticle.aiSummary}
                    </p>
                    
                    {featuredArticle.translations?.chinese && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">中文翻译:</h3>
                        <p className="text-gray-700 leading-relaxed" style={{fontFamily: 'SimSun, serif'}}>
                          {featuredArticle.translations.chinese}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <a 
                      href={featuredArticle.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
                    >
                      <span>Read Full Article</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    <div className="flex items-center space-x-4">
                      <button className="text-gray-500 hover:text-red-600">Share</button>
                      <button className="text-gray-500 hover:text-red-600">Save</button>
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                Trending Stories
              </h2>
              
              <div className="space-y-4">
                {otherArticles.slice(0, 3).map((article, index) => (
                  <article key={article.id} className="group cursor-pointer">
                    <div className="flex space-x-3">
                      <span className="text-2xl font-bold text-red-600 mt-1">
                        {index + 2}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors leading-tight">
                          {article.displayTitle || article.originalTitle}
                        </h3>
                        <div className="mt-2 flex items-center text-xs text-gray-500 space-x-2">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{formatDate(article.scrapedDate)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-red-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Stay Informed
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Get the latest news affecting the Chinese American community delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Articles Grid */}
        {otherArticles.length > 3 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">More Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherArticles.slice(3).map((article) => (
                <article key={article.id} className="group cursor-pointer">
                  <div className="relative">
                    <img 
                      src={article.imageUrl} 
                      alt={article.displayTitle}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(article.priority)}`}>
                        {article.topic}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors leading-tight">
                      {article.displayTitle || article.originalTitle}
                    </h3>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-600 space-x-3">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{formatDate(article.scrapedDate)}</span>
                    </div>

                    <p className="mt-3 text-gray-700 text-sm leading-relaxed line-clamp-3">
                      {article.aiSummary}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <a 
                        href={article.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <span>Read More</span>
                        <ChevronRight className="w-4 h-4" />
                      </a>
                      <span className="text-xs text-gray-500">
                        Score: {article.relevanceScore}
                      </span>
                    </div>
                  </div>
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
                  <h3 className="text-lg font-bold">Chinese American Voices</h3>
                  <p className="text-sm text-gray-400">华裔美国人之声</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Amplifying stories that matter to the Chinese American community. 
                Independent journalism focused on the issues affecting our community.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sections</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Politics</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Healthcare</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Education</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Immigration</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Our Mission</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Chinese American Voices. All rights reserved.</p>
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
      `}</style>
    </div>
  );
}
