import { create } from 'zustand';
import type { Tag } from '../types';

interface TagState {
  tags: Tag[];
  isLoading: boolean;

  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  removeTag: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTagStore = create<TagState>()((set) => ({
  tags: [],
  isLoading: false,

  setTags: (tags) => set({ tags }),

  addTag: (tag) =>
    set((state) => ({
      tags: [...state.tags, tag],
    })),

  updateTag: (id, updates) =>
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id ? { ...tag, ...updates } : tag
      ),
    })),

  removeTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));

export const selectTagById = (state: TagState, id: string): Tag | undefined =>
  state.tags.find((tag) => tag.id === id);

export const selectTagsByIds = (state: TagState, ids: string[]): Tag[] =>
  state.tags.filter((tag) => ids.includes(tag.id));

export const selectPopularTags = (state: TagState, limit = 10): Tag[] =>
  [...state.tags].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);

export const selectHasTags = (state: TagState): boolean => state.tags.length > 0;
