import { supabase } from '../lib/supabase';
import type { Tag, CreateTagInput, LinkTag, ApiResponse } from '../types';

interface DbTag {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
  created_at: string;
}

interface DbLinkTag {
  link_id: string;
  tag_id: string;
  created_at: string;
}

function mapTagFromDb(dbTag: DbTag): Tag {
  return {
    id: dbTag.id,
    userId: dbTag.user_id,
    name: dbTag.name,
    slug: dbTag.slug,
    color: dbTag.color,
    usageCount: dbTag.usage_count,
    createdAt: dbTag.created_at,
  };
}

function mapLinkTagFromDb(dbLinkTag: DbLinkTag): LinkTag {
  return {
    linkId: dbLinkTag.link_id,
    tagId: dbLinkTag.tag_id,
    createdAt: dbLinkTag.created_at,
  };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36);
}

export async function getTags(userId: string): Promise<ApiResponse<Tag[]>> {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('usage_count', { ascending: false });

    if (error) {
      return {
        success: false,
        error: { code: 'FETCH_FAILED', message: '태그 목록을 불러오는데 실패했습니다.' },
      };
    }

    return {
      success: true,
      data: (data as DbTag[]).map(mapTagFromDb),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function createTag(
  userId: string,
  input: CreateTagInput
): Promise<ApiResponse<Tag>> {
  try {
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', userId)
      .eq('name', input.name)
      .single();

    if (existingTag) {
      return {
        success: false,
        error: { code: 'TAG_EXISTS', message: '이미 존재하는 태그입니다.' },
      };
    }

    const slug = generateSlug(input.name);

    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_id: userId,
        name: input.name,
        slug,
        color: input.color ?? '#6366f1',
        usage_count: 0,
      })
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'CREATE_FAILED', message: '태그 생성에 실패했습니다.' },
      };
    }

    return {
      success: true,
      data: mapTagFromDb(data as DbTag),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function deleteTag(tagId: string): Promise<ApiResponse<void>> {
  try {
    await supabase.from('link_tags').delete().eq('tag_id', tagId);

    const { error } = await supabase.from('tags').delete().eq('id', tagId);

    if (error) {
      return {
        success: false,
        error: { code: 'DELETE_FAILED', message: '태그 삭제에 실패했습니다.' },
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

export async function addTagToLink(
  linkId: string,
  tagId: string
): Promise<ApiResponse<LinkTag>> {
  try {
    const { data: existing } = await supabase
      .from('link_tags')
      .select('*')
      .eq('link_id', linkId)
      .eq('tag_id', tagId)
      .single();

    if (existing) {
      return {
        success: true,
        data: mapLinkTagFromDb(existing as DbLinkTag),
      };
    }

    const { data, error } = await supabase
      .from('link_tags')
      .insert({
        link_id: linkId,
        tag_id: tagId,
      })
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'ADD_TAG_FAILED', message: '태그 추가에 실패했습니다.' },
      };
    }

    await supabase.rpc('increment_tag_usage', { tag_id: tagId });

    return {
      success: true,
      data: mapLinkTagFromDb(data as DbLinkTag),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function removeTagFromLink(
  linkId: string,
  tagId: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('link_tags')
      .delete()
      .eq('link_id', linkId)
      .eq('tag_id', tagId);

    if (error) {
      return {
        success: false,
        error: { code: 'REMOVE_TAG_FAILED', message: '태그 제거에 실패했습니다.' },
      };
    }

    await supabase.rpc('decrement_tag_usage', { tag_id: tagId });

    return { success: true };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function getLinkTags(linkId: string): Promise<ApiResponse<Tag[]>> {
  try {
    const { data, error } = await supabase
      .from('link_tags')
      .select('tags(*)')
      .eq('link_id', linkId);

    if (error) {
      return {
        success: false,
        error: { code: 'FETCH_FAILED', message: '링크 태그를 불러오는데 실패했습니다.' },
      };
    }

    const tags = (data as unknown as { tags: DbTag }[])
      .map((item) => item.tags)
      .filter(Boolean)
      .map(mapTagFromDb);

    return {
      success: true,
      data: tags,
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}
