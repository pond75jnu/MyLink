import { useCallback } from 'react';
import { useCategoryStore, useAuthStore } from '../stores';
import * as categoryService from '../services/category.service';
import type { CreateCategoryInput, UpdateCategoryInput } from '../types';
import toast from 'react-hot-toast';

export function useCategories() {
  const { user } = useAuthStore();
  const {
    categories,
    selectedCategory,
    isLoading,
    setCategories,
    addCategory,
    updateCategory: updateCategoryInStore,
    removeCategory,
    setSelectedCategory,
    setLoading,
  } = useCategoryStore();

  const fetchCategories = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    const result = await categoryService.getCategories(user.id);

    if (result.success && result.data) {
      setCategories(result.data);
    } else {
      toast.error(result.error?.message ?? '카테고리를 불러오는데 실패했습니다.');
    }

    setLoading(false);
  }, [user, setCategories, setLoading]);

  const createCategory = useCallback(
    async (input: CreateCategoryInput) => {
      if (!user?.id) return null;

      setLoading(true);
      const result = await categoryService.createCategory(user.id, input);

      if (result.success && result.data) {
        addCategory(result.data);
        toast.success('카테고리가 생성되었습니다.');
        setLoading(false);
        return result.data;
      } else {
        toast.error(result.error?.message ?? '카테고리 생성에 실패했습니다.');
        setLoading(false);
        return null;
      }
    },
    [user, addCategory, setLoading]
  );

  const updateCategory = useCallback(
    async (categoryId: string, input: UpdateCategoryInput) => {
      const result = await categoryService.updateCategory(categoryId, input);

      if (result.success && result.data) {
        updateCategoryInStore(categoryId, result.data);
        toast.success('카테고리가 수정되었습니다.');
        return result.data;
      } else {
        toast.error(result.error?.message ?? '카테고리 수정에 실패했습니다.');
        return null;
      }
    },
    [updateCategoryInStore]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      const result = await categoryService.deleteCategory(categoryId);

      if (result.success) {
        removeCategory(categoryId);
        toast.success('카테고리가 삭제되었습니다.');
        return true;
      } else {
        toast.error(result.error?.message ?? '카테고리 삭제에 실패했습니다.');
        return false;
      }
    },
    [removeCategory]
  );

  const reorderCategories = useCallback(
    async (categoryOrders: { id: string; sortOrder: number }[]) => {
      const result = await categoryService.reorderCategories(categoryOrders);

      if (result.success) {
        categoryOrders.forEach(({ id, sortOrder }) => {
          updateCategoryInStore(id, { sortOrder });
        });
        return true;
      } else {
        toast.error(result.error?.message ?? '카테고리 순서 변경에 실패했습니다.');
        return false;
      }
    },
    [updateCategoryInStore]
  );

  const getCategoryById = useCallback(
    (categoryId: string) => {
      return categories.find((cat) => cat.id === categoryId);
    },
    [categories]
  );

  const getRootCategories = useCallback(() => {
    return categories.filter((cat) => !cat.parentId);
  }, [categories]);

  const getChildCategories = useCallback(
    (parentId: string) => {
      return categories.filter((cat) => cat.parentId === parentId);
    },
    [categories]
  );

  return {
    categories,
    selectedCategory,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    setSelectedCategory,
    getCategoryById,
    getRootCategories,
    getChildCategories,
  };
}
