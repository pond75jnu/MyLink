export interface Link {
  id: string;
  userId: string;
  categoryId?: string;
  originalUrl: string;
  originalTitle?: string;
  aiTitle?: string;
  aiSummary?: string;
  aiKeywords?: string[];
  aiCategorySuggestion?: string;
  customTitle?: string;
  customSummary?: string;
  customMemo?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  ogDescription?: string;
  siteName?: string;
  contentType?: string;
  isFavorite: boolean;
  isArchived: boolean;
  isAnalyzed: boolean;
  analysisError?: string;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLinkInput {
  url: string;
  category: string;
  customTitle: string;
  customMemo: string;
}

export interface UpdateLinkInput {
  categoryId?: string;
  customTitle?: string;
  customSummary?: string;
  customMemo?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
}

export interface LinkFilter {
  categoryId?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  contentType?: string;
  search?: string;
  tagIds?: string[];
}

export interface LinkSort {
  field: 'createdAt' | 'updatedAt' | 'viewCount' | 'title';
  direction: 'asc' | 'desc';
}
