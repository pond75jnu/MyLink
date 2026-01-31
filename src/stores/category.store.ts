import { create } from 'zustand';
import type { Category } from '../types';

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;

  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  setSelectedCategory: (category: Category | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCategoryStore = create<CategoryState>()((set) => ({
  categories: [],
  selectedCategory: null,
  isLoading: false,

  setCategories: (categories) => set({ categories }),

  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
      selectedCategory:
        state.selectedCategory?.id === id
          ? { ...state.selectedCategory, ...updates }
          : state.selectedCategory,
    })),

  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
      selectedCategory:
        state.selectedCategory?.id === id ? null : state.selectedCategory,
    })),

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  setLoading: (isLoading) => set({ isLoading }),
}));

export const selectCategoryById = (
  state: CategoryState,
  id: string
): Category | undefined => state.categories.find((cat) => cat.id === id);

export const selectRootCategories = (state: CategoryState): Category[] =>
  state.categories.filter((cat) => !cat.parentId);

export const selectChildCategories = (
  state: CategoryState,
  parentId: string
): Category[] => state.categories.filter((cat) => cat.parentId === parentId);

export const selectHasCategories = (state: CategoryState): boolean =>
  state.categories.length > 0;
