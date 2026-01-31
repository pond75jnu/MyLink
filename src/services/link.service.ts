import { supabase } from '../lib/supabase';
import type {
  Link,
  CreateLinkInput,
  UpdateLinkInput,
  LinkFilter,
  LinkSort,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '../types';

interface DbLink {
  id: string;
  user_id: string;
  category_id?: string;
  original_url: string;
  original_title?: string;
  ai_title?: string;
  ai_summary?: string;
  ai_keywords?: string[];
  ai_category_suggestion?: string;
  custom_title?: string;
  custom_summary?: string;
  custom_memo?: string;
  favicon_url?: string;
  og_image_url?: string;
  og_description?: string;
  site_name?: string;
  content_type?: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_analyzed: boolean;
  analysis_error?: string;
  view_count: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

function mapLinkFromDb(dbLink: DbLink): Link {
  return {
    id: dbLink.id,
    userId: dbLink.user_id,
    categoryId: dbLink.category_id,
    originalUrl: dbLink.original_url,
    originalTitle: dbLink.original_title,
    aiTitle: dbLink.ai_title,
    aiSummary: dbLink.ai_summary,
    aiKeywords: dbLink.ai_keywords,
    aiCategorySuggestion: dbLink.ai_category_suggestion,
    customTitle: dbLink.custom_title,
    customSummary: dbLink.custom_summary,
    customMemo: dbLink.custom_memo,
    faviconUrl: dbLink.favicon_url,
    ogImageUrl: dbLink.og_image_url,
    ogDescription: dbLink.og_description,
    siteName: dbLink.site_name,
    contentType: dbLink.content_type,
    isFavorite: dbLink.is_favorite,
    isArchived: dbLink.is_archived,
    isAnalyzed: dbLink.is_analyzed,
    analysisError: dbLink.analysis_error,
    viewCount: dbLink.view_count,
    lastViewedAt: dbLink.last_viewed_at,
    createdAt: dbLink.created_at,
    updatedAt: dbLink.updated_at,
  };
}

export async function getLinks(
  userId: string,
  filter?: LinkFilter,
  sort?: LinkSort,
  pagination?: PaginationParams
): Promise<ApiResponse<PaginatedResponse<Link>>> {
  try {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('links')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (filter?.categoryId) {
      query = query.eq('category_id', filter.categoryId);
    }
    if (filter?.isFavorite !== undefined) {
      query = query.eq('is_favorite', filter.isFavorite);
    }
    if (filter?.isArchived !== undefined) {
      query = query.eq('is_archived', filter.isArchived);
    }
    if (filter?.contentType) {
      query = query.eq('content_type', filter.contentType);
    }
    if (filter?.search) {
      query = query.or(
        `original_title.ilike.%${filter.search}%,ai_title.ilike.%${filter.search}%,custom_title.ilike.%${filter.search}%,original_url.ilike.%${filter.search}%`
      );
    }

    const sortField = sort?.field ?? 'createdAt';
    const sortDirection = sort?.direction ?? 'desc';
    const dbSortField = sortField === 'createdAt' ? 'created_at' 
      : sortField === 'updatedAt' ? 'updated_at'
      : sortField === 'viewCount' ? 'view_count'
      : 'original_title';
    
    query = query.order(dbSortField, { ascending: sortDirection === 'asc' });
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        error: { code: 'FETCH_FAILED', message: '링크 목록을 불러오는데 실패했습니다.' },
      };
    }

    const total = count ?? 0;
    const links = (data as DbLink[]).map(mapLinkFromDb);

    return {
      success: true,
      data: {
        data: links,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function getLinkById(linkId: string): Promise<ApiResponse<Link>> {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', linkId)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '링크를 찾을 수 없습니다.' },
      };
    }

    return {
      success: true,
      data: mapLinkFromDb(data as DbLink),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function checkDuplicateUrl(
  userId: string,
  url: string
): Promise<ApiResponse<{ isDuplicate: boolean }>> {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('id')
      .eq('user_id', userId)
      .eq('original_url', url)
      .limit(1);

    if (error) {
      return {
        success: false,
        error: { code: 'CHECK_FAILED', message: 'URL 중복 확인에 실패했습니다.' },
      };
    }

    return {
      success: true,
      data: { isDuplicate: data.length > 0 },
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function createLink(
  userId: string,
  input: CreateLinkInput
): Promise<ApiResponse<Link>> {
  try {
    const duplicateCheck = await checkDuplicateUrl(userId, input.url);
    if (!duplicateCheck.success) {
      return {
        success: false,
        error: duplicateCheck.error!,
      };
    }
    if (duplicateCheck.data?.isDuplicate) {
      return {
        success: false,
        error: { code: 'DUPLICATE_URL', message: '이미 등록된 URL입니다.' },
      };
    }

    const { data, error } = await supabase
      .from('links')
      .insert({
        user_id: userId,
        original_url: input.url,
        ai_category_suggestion: input.category,
        custom_title: input.customTitle,
        custom_memo: input.customMemo,
        is_favorite: false,
        is_archived: false,
        is_analyzed: false,
        view_count: 0,
      })
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'CREATE_FAILED', message: '링크 생성에 실패했습니다.' },
      };
    }

    return {
      success: true,
      data: mapLinkFromDb(data as DbLink),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function updateLink(
  linkId: string,
  input: UpdateLinkInput
): Promise<ApiResponse<Link>> {
  try {
    const updateData: Record<string, unknown> = {};
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
    if (input.customTitle !== undefined) updateData.custom_title = input.customTitle;
    if (input.customSummary !== undefined) updateData.custom_summary = input.customSummary;
    if (input.customMemo !== undefined) updateData.custom_memo = input.customMemo;
    if (input.isFavorite !== undefined) updateData.is_favorite = input.isFavorite;
    if (input.isArchived !== undefined) updateData.is_archived = input.isArchived;

    const { data, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', linkId)
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: '링크 수정에 실패했습니다.' },
      };
    }

    return {
      success: true,
      data: mapLinkFromDb(data as DbLink),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function deleteLink(linkId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase.from('links').delete().eq('id', linkId);

    if (error) {
      return {
        success: false,
        error: { code: 'DELETE_FAILED', message: '링크 삭제에 실패했습니다.' },
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function toggleFavorite(linkId: string): Promise<ApiResponse<Link>> {
  try {
    const { data: link } = await supabase
      .from('links')
      .select('is_favorite')
      .eq('id', linkId)
      .single();

    if (!link) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '링크를 찾을 수 없습니다.' },
      };
    }

    const { data, error } = await supabase
      .from('links')
      .update({ is_favorite: !link.is_favorite })
      .eq('id', linkId)
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: '즐겨찾기 변경에 실패했습니다.' },
      };
    }

    return {
      success: true,
      data: mapLinkFromDb(data as DbLink),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function toggleArchive(linkId: string): Promise<ApiResponse<Link>> {
  try {
    const { data: link } = await supabase
      .from('links')
      .select('is_archived')
      .eq('id', linkId)
      .single();

    if (!link) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '링크를 찾을 수 없습니다.' },
      };
    }

    const { data, error } = await supabase
      .from('links')
      .update({ is_archived: !link.is_archived })
      .eq('id', linkId)
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: '아카이브 변경에 실패했습니다.' },
      };
    }

    return {
      success: true,
      data: mapLinkFromDb(data as DbLink),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function incrementViewCount(linkId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase.rpc('increment_view_count', { link_id: linkId });

    if (error) {
      const { error: updateError } = await supabase
        .from('links')
        .update({ 
          view_count: supabase.rpc('increment_view_count', { link_id: linkId }),
          last_viewed_at: new Date().toISOString() 
        })
        .eq('id', linkId);

      if (updateError) {
        return {
          success: false,
          error: { code: 'UPDATE_FAILED', message: '조회수 증가에 실패했습니다.' },
        };
      }
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function searchLinks(
  userId: string,
  query: string,
  pagination?: PaginationParams
): Promise<ApiResponse<PaginatedResponse<Link>>> {
  return getLinks(userId, { search: query }, { field: 'createdAt', direction: 'desc' }, pagination);
}
