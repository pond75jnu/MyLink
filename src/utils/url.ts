export interface UrlMetadata {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  favicon?: string;
  siteName?: string;
}

export async function extractMetadata(url: string): Promise<UrlMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SmartLink/1.0)',
      },
    });

    if (!response.ok) {
      return getDefaultMetadata(url);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMetaContent = (selectors: string[]): string | undefined => {
      for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element) {
          return element.getAttribute('content') || undefined;
        }
      }
      return undefined;
    };

    const ogTitle = getMetaContent([
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ]) || doc.querySelector('title')?.textContent || undefined;

    const ogDescription = getMetaContent([
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]);

    const ogImage = getMetaContent([
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ]);

    const siteName = getMetaContent([
      'meta[property="og:site_name"]',
    ]);

    const favicon = getFaviconUrl(url);

    return {
      ogTitle,
      ogDescription,
      ogImage,
      favicon,
      siteName,
    };
  } catch {
    return getDefaultMetadata(url);
  }
}

function getDefaultMetadata(url: string): UrlMetadata {
  return {
    favicon: getFaviconUrl(url),
  };
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
}

export function getFaviconUrl(url: string): string {
  const domain = getDomain(url);
  if (!domain) {
    return '';
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}
