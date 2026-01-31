import { create } from 'zustand';
import type { Link, LinkFilter, LinkSort } from '../types';

interface LinkState {
  links: Link[];
  selectedLink: Link | null;
  filter: LinkFilter;
  sort: LinkSort;
  isLoading: boolean;
  error: string | null;

  setLinks: (links: Link[]) => void;
  addLink: (link: Link) => void;
  updateLink: (id: string, updates: Partial<Link>) => void;
  removeLink: (id: string) => void;
  setSelectedLink: (link: Link | null) => void;
  setFilter: (filter: Partial<LinkFilter>) => void;
  setSort: (sort: LinkSort) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilter: LinkFilter = {
  categoryId: undefined,
  isFavorite: undefined,
  isArchived: false,
  contentType: undefined,
  search: undefined,
  tagIds: undefined,
};

const initialSort: LinkSort = {
  field: 'createdAt',
  direction: 'desc',
};

export const useLinkStore = create<LinkState>()((set) => ({
  links: [],
  selectedLink: null,
  filter: initialFilter,
  sort: initialSort,
  isLoading: false,
  error: null,

  setLinks: (links) => set({ links }),

  addLink: (link) =>
    set((state) => ({
      links: [link, ...state.links],
    })),

  updateLink: (id, updates) =>
    set((state) => ({
      links: state.links.map((link) =>
        link.id === id ? { ...link, ...updates } : link
      ),
      selectedLink:
        state.selectedLink?.id === id
          ? { ...state.selectedLink, ...updates }
          : state.selectedLink,
    })),

  removeLink: (id) =>
    set((state) => ({
      links: state.links.filter((link) => link.id !== id),
      selectedLink: state.selectedLink?.id === id ? null : state.selectedLink,
    })),

  setSelectedLink: (selectedLink) => set({ selectedLink }),

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),

  setSort: (sort) => set({ sort }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));

export const selectFilteredLinks = (state: LinkState): Link[] => {
  const { links, filter, sort } = state;

  const filtered = links.filter((link) => {
    if (filter.categoryId && link.categoryId !== filter.categoryId) return false;
    if (filter.isFavorite !== undefined && link.isFavorite !== filter.isFavorite)
      return false;
    if (filter.isArchived !== undefined && link.isArchived !== filter.isArchived)
      return false;
    if (filter.contentType && link.contentType !== filter.contentType) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const title = link.customTitle || link.aiTitle || link.originalTitle || '';
      const summary = link.customSummary || link.aiSummary || '';
      if (
        !title.toLowerCase().includes(searchLower) &&
        !summary.toLowerCase().includes(searchLower) &&
        !link.originalUrl.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  filtered.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sort.field) {
      case 'viewCount':
        aVal = a.viewCount;
        bVal = b.viewCount;
        break;
      case 'title':
        aVal = (a.customTitle || a.aiTitle || a.originalTitle || '').toLowerCase();
        bVal = (b.customTitle || b.aiTitle || b.originalTitle || '').toLowerCase();
        break;
      case 'updatedAt':
        aVal = a.updatedAt;
        bVal = b.updatedAt;
        break;
      case 'createdAt':
      default:
        aVal = a.createdAt;
        bVal = b.createdAt;
        break;
    }

    if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
};

export const selectFavoriteLinks = (state: LinkState): Link[] =>
  state.links.filter((link) => link.isFavorite && !link.isArchived);

export const selectArchivedLinks = (state: LinkState): Link[] =>
  state.links.filter((link) => link.isArchived);

export const selectHasLinks = (state: LinkState): boolean => state.links.length > 0;

export const selectIsEmpty = (state: LinkState): boolean => state.links.length === 0;
