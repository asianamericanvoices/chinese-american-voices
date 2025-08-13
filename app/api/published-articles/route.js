// app/api/published-articles/route.js
import { NextResponse } from 'next/server';

// Optional Supabase integration - connects to your existing dashboard database
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    console.log('✅ Supabase connected to Chinese American Voices');
  } else {
    console.log('📁 No Supabase credentials - using mock data');
  }
} catch (error) {
  console.log('📁 Supabase not available, using mock data');
  supabase = null;
}

export async function GET(request) {
  const url = new URL(request.url);
  const language = url.searchParams.get('language') || 'chinese';
  const category = url.searchParams.get('category') || 'all';
  const limit = parseInt(url.searchParams.get('limit')) || 20;

  try {
    let articles = [];

    if (supabase) {
      // Fetch from your actual dashboard database
      console.log('📊 Fetching published articles from Supabase...');
      
      let query = supabase
        .from('articles')
        .select(`
          id,
          original_title,
          ai_title,
          display_title,
          ai_summary,
          translations,
          translated_titles,
          source,
          author,
          scraped_date,
          topic,
          priority,
          relevance_score,
          image_url,
          original_url,
          status
        `)
        .eq('status', 'published')
        .order('scraped_date', { ascending: false });

      if (category !== 'all') {
        query = query.eq('topic', category);
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      // Transform to frontend format
      articles = data.map(article => ({
        id: article.id,
        originalTitle: article.original_title,
        aiTitle: article.ai_title,
        displayTitle: article.display_title,
        aiSummary: article.ai_summary,
        translations: article.translations || { chinese: null, korean: null },
        translatedTitles: article.translated_titles || { chinese: null, korean: null },
        source: article.source,
        author: article.author,
        scrapedDate: article.scraped_date,
        topic: article.topic,
        priority: article.priority,
        relevanceScore: article.relevance_score,
        imageUrl: article.image_url,
        originalUrl: article.original_url
      }));

      console.log(`✅ Fetched ${articles.length} published articles from Supabase`);
    } else {
      // Mock data for demo/development
      console.log('📋 Using mock data for development');
      articles = getMockArticles();
    }

    // Filter articles that have translations in the requested language
    const filteredArticles = articles.filter(article => {
      if (language === 'chinese') {
        return article.translations?.chinese || article.translatedTitles?.chinese;
      } else if (language === 'korean') {
        return article.translations?.korean || article.translatedTitles?.korean;
      }
      return true; // For English or no language preference
    });

    return NextResponse.json({
      articles: filteredArticles,
      total: filteredArticles.length,
      language,
      category,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching published articles:', error);
    
    // Fallback to mock data on error
    const mockArticles = getMockArticles();
    
    return NextResponse.json({
      articles: mockArticles,
      total: mockArticles.length,
      language,
      category,
      error: 'Using fallback data',
      timestamp: new Date().toISOString()
    });
  }
}

function getMockArticles() {
  return [
    {
      id: 1,
      originalTitle: "Trump calls for U.S. census to exclude for the first time people with no legal status",
      displayTitle: "New Census Rules Target Undocumented Immigrants",
      aiTitle: "Trump Proposes Historic Change to Census Counting",
      aiSummary: "President Trump announced plans for a 'new' census that would exclude people without legal status, renewing controversial efforts from his first administration. The 14th Amendment requires counting the 'whole number of persons in each state' for congressional representation, making this proposal constitutionally challenging.",
      translations: {
        chinese: "特朗普总统宣布了一项\"新\"人口普查计划，该计划将排除没有合法身份的人员，重新启动了他第一届政府的争议性努力。第十四修正案要求对\"每个州的全部人数\"进行计算，以确定国会代表权，这使得该提案在宪法上面临挑战。",
        korean: null
      },
      translatedTitles: {
        chinese: "特朗普呼吁美国人口普查首次排除无合法身份人员",
        korean: null
      },
      source: "NPR",
      author: "NPR Staff",
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
      aiTitle: "Crime Victims With Pending Visas Targeted for Deportation",
      aiSummary: "Some immigrants who've applied for U visas as crime victims are being detained as part of the Trump administration's mass deportation campaign. The U visa program was designed to help victims of crimes cooperate with law enforcement, but new policies no longer protect applicants from removal proceedings.",
      translations: {
        chinese: "一些申请U签证的犯罪受害者移民正在被拘留，这是特朗普政府大规模驱逐行动的一部分。U签证项目旨在帮助犯罪受害者与执法部门合作，但新政策不再保护申请人免于驱逐程序。",
        korean: null
      },
      translatedTitles: {
        chinese: "等待签证的犯罪受害者移民现在面临驱逐",
        korean: null
      },
      source: "NBC News",
      author: "NBC News Staff",
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
      aiTitle: "Federal Funding Frozen at Duke Over Discrimination Claims",
      aiSummary: "The Trump administration froze $108 million in research funding to Duke University, accusing the school of racial discrimination through affirmative action policies. This follows similar actions against Harvard, Columbia, and Cornell as part of a broader campaign against diversity, equity and inclusion programs.",
      translations: {
        chinese: "特朗普政府冻结了杜克大学1.08亿美元的研究资金，指控该校通过平权行动政策进行种族歧视。这是继对哈佛、哥伦比亚和康奈尔采取类似行动之后，作为反对多元化、公平和包容项目的更广泛运动的一部分。",
        korean: null
      },
      translatedTitles: {
        chinese: "特朗普政府因调查涉嫌种族偏好冻结杜克大学1.08亿美元资金",
        korean: null
      },
      source: "AP News",
      author: "AP Staff",
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
      aiTitle: "Ichiro Breaks Barriers as First Asian MLB Hall of Famer",
      aiSummary: "Ichiro Suzuki becomes the first Asian player inducted into the Baseball Hall of Fame, with Asian American players crediting him for paving the way. His 19-year MLB career included 10 All-Star selections and 10 Gold Glove awards, inspiring a generation of players who saw someone who looked like them succeed at the highest level.",
      translations: {
        chinese: "铃木一朗成为首位入选棒球名人堂的亚洲球员，亚裔美国球员称赞他为后来者铺平了道路。他19年的大联盟职业生涯包括10次全明星入选和10个金手套奖，激励了一代看到像他们一样的人在最高水平上取得成功的球员。",
        korean: null
      },
      translatedTitles: {
        chinese: "随着铃木一朗成为首位亚洲MLB名人堂成员，亚洲球员分享他如何为他们铺平道路",
        korean: null
      },
      source: "NBC News",
      author: "NBC News Staff",
      scrapedDate: "2025-08-07",
      topic: "Culture",
      priority: "medium",
      relevanceScore: 8.0,
      imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop",
      originalUrl: "https://www.nbcnews.com/news/asian-america/ichiro-suzuki-becomes-1st-asian-mlb-hall-famer-asian-players-rcna220513"
    },
    {
      id: 5,
      originalTitle: "'Voting rights gave you power:' The Voting Rights Act turns 60. Will its promise endure?",
      displayTitle: "Voting Rights Act at 60: Promise Under Threat",
      aiTitle: "60 Years Later, Voting Rights Act Faces New Challenges",
      aiSummary: "On the 60th anniversary of the Voting Rights Act, civil rights lawyers and scholars warn those rights are in danger again. The Trump administration and some Republican-led state legislatures are working to change voting right protections that have stood for decades, while advocates say they're undermining the promises of the Act.",
      translations: {
        chinese: "在《投票权法》60周年之际，民权律师和学者警告这些权利再次面临危险。特朗普政府和一些共和党主导的州立法机构正在努力改变已经存在数十年的投票权保护，而倡导者说他们正在破坏该法案的承诺。",
        korean: null
      },
      translatedTitles: {
        chinese: "\"投票权给了你力量\"：《投票权法》迎来60周年，其承诺能否持续？",
        korean: null
      },
      source: "USA Today",
      author: "USA Today Staff",
      scrapedDate: "2025-08-07",
      topic: "Politics",
      priority: "medium",
      relevanceScore: 7.0,
      imageUrl: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?w=800&h=400&fit=crop",
      originalUrl: "https://www.usatoday.com/story/news/politics/2025/08/06/voting-right-act-turns-60-protections-risk/85519564007/"
    }
  ];
}
