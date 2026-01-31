import { supabase } from '../lib/supabase';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  ApiResponse,
} from '../types';

interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  link_count?: number;
}

function mapCategoryFromDb(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    userId: dbCategory.user_id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    description: dbCategory.description,
    color: dbCategory.color,
    icon: dbCategory.icon,
    parentId: dbCategory.parent_id,
    sortOrder: dbCategory.sort_order,
    isSystem: dbCategory.is_system,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
    linkCount: dbCategory.link_count,
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

export async function getCategories(userId: string): Promise<ApiResponse<Category[]>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        link_count:links(count)
      `)
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    if (error) {
      return {
        success: false,
        error: { code: 'FETCH_FAILED', message: '카테고리 목록을 불러오는데 실패했습니다.' },
      };
    }

    const categories = (data as (DbCategory & { link_count: { count: number }[] })[]).map((cat) => ({
      ...mapCategoryFromDb(cat),
      linkCount: cat.link_count?.[0]?.count ?? 0,
    }));

    return {
      success: true,
      data: categories,
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function getCategoryById(categoryId: string): Promise<ApiResponse<Category>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '카테고리를 찾을 수 없습니다.' },
      };
    }

    return {
      success: true,
      data: mapCategoryFromDb(data as DbCategory),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function createCategory(
  userId: string,
  input: CreateCategoryInput
): Promise<ApiResponse<Category>> {
  try {
    const { data: maxOrder } = await supabase
      .from('categories')
      .select('sort_order')
      .eq('user_id', userId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const sortOrder = (maxOrder?.sort_order ?? 0) + 1;
    const slug = generateSlug(input.name);

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: input.name,
        slug,
        description: input.description,
        color: input.color ?? '#6366f1',
        icon: input.icon,
        parent_id: input.parentId,
        sort_order: sortOrder,
        is_system: false,
      })
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'CREATE_FAILED', message: '카테고리 생성에 실패했습니다.' },
      };
    }

    return {
      success: true,
      data: mapCategoryFromDb(data as DbCategory),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput
): Promise<ApiResponse<Category>> {
  try {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) {
      updateData.name = input.name;
      updateData.slug = generateSlug(input.name);
    }
    if (input.description !== undefined) updateData.description = input.description;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.icon !== undefined) updateData.icon = input.icon;
    if (input.parentId !== undefined) updateData.parent_id = input.parentId;
    if (input.sortOrder !== undefined) updateData.sort_order = input.sortOrder;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: '카테고리 수정에 실패했습니다.' },
      };
    }

    return {
      success: true,
      data: mapCategoryFromDb(data as DbCategory),
    };
  } catch {
    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' },
    };
  }
}

export async function deleteCategory(categoryId: string): Promise<ApiResponse<void>> {
  try {
    const { data: category } = await supabase
      .from('categories')
      .select('is_system')
      .eq('id', categoryId)
      .single();

    if (category?.is_system) {
      return {
        success: false,
        error: { code: 'SYSTEM_CATEGORY', message: '시스템 카테고리는 삭제할 수 없습니다.' },
      };
    }

    await supabase
      .from('links')
      .update({ category_id: null })
      .eq('category_id', categoryId);

    const { error } = await supabase.from('categories').delete().eq('id', categoryId);

    if (error) {
      return {
        success: false,
        error: { code: 'DELETE_FAILED', message: '카테고리 삭제에 실패했습니다.' },
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

export async function reorderCategories(
  categoryOrders: { id: string; sortOrder: number }[]
): Promise<ApiResponse<void>> {
  try {
    const updates = categoryOrders.map(({ id, sortOrder }) =>
      supabase.from('categories').update({ sort_order: sortOrder }).eq('id', id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      return {
        success: false,
        error: { code: 'REORDER_FAILED', message: '카테고리 순서 변경에 실패했습니다.' },
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
