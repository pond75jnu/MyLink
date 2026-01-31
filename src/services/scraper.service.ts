export interface PageData {
  url: string;
  title: string;
  description: string;
  ogImage: string;
  favicon: string;
  siteName: string;
  content: string;
  metaKeywords?: string[];
  video?: {
    title: string;
    channel: string;
  };
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch|shorts)|youtu\.be\/)/.test(url);
}

function extractYouTubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return '';
}

async function fetchYouTubeOEmbed(url: string): Promise<{ title: string; channel: string } | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      title: data.title || '',
      channel: data.author_name || '',
    };
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchPageContent(url: string): Promise<PageData> {
  try {
    let videoData: { title: string; channel: string } | undefined;
    
    if (isYouTubeUrl(url)) {
      const oembed = await fetchYouTubeOEmbed(url);
      if (oembed) {
        videoData = oembed;
        return {
          url,
          title: videoData.title,
          description: '',
          ogImage: `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg`,
          favicon: 'https://www.youtube.com/favicon.ico',
          siteName: videoData.channel,
          content: '',
          video: videoData,
        };
      }
    }

    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetchWithTimeout(proxyUrl, 8000);
    if (!response.ok) {
      throw new Error('페이지를 가져오는데 실패했습니다.');
    }
    
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error('페이지 콘텐츠가 비어있습니다.');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');

    const getMetaContent = (selectors: string[]): string => {
      for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element) {
          const content = element.getAttribute('content') || element.getAttribute('href') || element.textContent;
          if (content) return content.trim();
        }
      }
      return '';
    };

    const title = getMetaContent([
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title',
    ]);

    const description = getMetaContent([
      'meta[property="og:description"]',
      'meta[name="description"]',
      'meta[name="twitter:description"]',
    ]);

    const ogImage = getMetaContent([
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ]);

    const siteName = getMetaContent([
      'meta[property="og:site_name"]',
      'meta[name="application-name"]',
    ]);

    let favicon = getMetaContent([
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ]);

    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      favicon = favicon.startsWith('/')
        ? `${urlObj.origin}${favicon}`
        : `${urlObj.origin}/${favicon}`;
    }

    if (!favicon) {
      const urlObj = new URL(url);
      favicon = `${urlObj.origin}/favicon.ico`;
    }

    const keywordsStr = getMetaContent([
      'meta[name="keywords"]',
      'meta[property="article:tag"]',
    ]);
    const metaKeywords = keywordsStr
      ? keywordsStr.split(',').map((k) => k.trim()).filter(Boolean)
      : undefined;

    const bodyText = doc.body?.textContent || '';
    const cleanedContent = bodyText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
      .slice(0, 5000);

    return {
      url,
      title: videoData?.title || title || new URL(url).hostname,
      description,
      ogImage: ogImage.startsWith('http') ? ogImage : '',
      favicon,
      siteName: videoData?.channel || siteName || new URL(url).hostname,
      content: cleanedContent,
      metaKeywords,
      video: videoData,
    };
  } catch (error) {
    console.error('Scraper error:', error);
    
    if (isYouTubeUrl(url)) {
      const videoData = await fetchYouTubeOEmbed(url);
      if (videoData) {
        const urlObj = new URL(url);
        return {
          url,
          title: videoData.title,
          description: '',
          ogImage: '',
          favicon: `${urlObj.origin}/favicon.ico`,
          siteName: videoData.channel,
          content: '',
          video: videoData,
        };
      }
    }
    
    const urlObj = new URL(url);
    return {
      url,
      title: urlObj.hostname,
      description: '',
      ogImage: '',
      favicon: `${urlObj.origin}/favicon.ico`,
      siteName: urlObj.hostname,
      content: '',
    };
  }
}
