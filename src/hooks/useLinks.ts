import { useCallback, useState } from 'react';
import { useLinkStore, useAuthStore } from '../stores';
import * as linkService from '../services/link.service';
import type { CreateLinkInput, UpdateLinkInput, LinkFilter, LinkSort, PaginationParams } from '../types';
import toast from 'react-hot-toast';

export function useLinks() {
  const { user } = useAuthStore();
  const {
    links,
    filter,
    sort,
    isLoading,
    error,
    setLinks,
    addLink,
    updateLink: updateLinkInStore,
    removeLink,
    setFilter,
    setSort,
    setLoading,
    setError,
  } = useLinkStore();

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchLinks = useCallback(
    async (customFilter?: LinkFilter, customSort?: LinkSort, customPagination?: PaginationParams) => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      const result = await linkService.getLinks(
        user.id,
        customFilter ?? filter,
        customSort ?? sort,
        customPagination ?? { page: pagination.page, pageSize: pagination.pageSize }
      );

      if (result.success && result.data) {
        setLinks(result.data.data);
        setPagination({
          page: result.data.page,
          pageSize: result.data.pageSize,
          total: result.data.total,
          totalPages: result.data.totalPages,
        });
      } else {
        setError(result.error?.message ?? '링크를 불러오는데 실패했습니다.');
        toast.error(result.error?.message ?? '링크를 불러오는데 실패했습니다.');
      }

      setLoading(false);
    },
    [user, filter, sort, pagination.page, pagination.pageSize, setLinks, setLoading, setError]
  );

  const createLink = useCallback(
    async (input: CreateLinkInput) => {
      if (!user?.id) return null;

      setLoading(true);
      const result = await linkService.createLink(user.id, input);

      if (result.success && result.data) {
        addLink(result.data);
        toast.success('링크가 추가되었습니다.');
        setLoading(false);
        return result.data;
      } else {
        toast.error(result.error?.message ?? '링크 추가에 실패했습니다.');
        setLoading(false);
        return null;
      }
    },
    [user, addLink, setLoading]
  );

  const updateLink = useCallback(
    async (linkId: string, input: UpdateLinkInput) => {
      const result = await linkService.updateLink(linkId, input);

      if (result.success && result.data) {
        updateLinkInStore(linkId, result.data);
        toast.success('링크가 수정되었습니다.');
        return result.data;
      } else {
        toast.error(result.error?.message ?? '링크 수정에 실패했습니다.');
        return null;
      }
    },
    [updateLinkInStore]
  );

  const deleteLink = useCallback(
    async (linkId: string) => {
      const result = await linkService.deleteLink(linkId);

      if (result.success) {
        removeLink(linkId);
        toast.success('링크가 삭제되었습니다.');
        return true;
      } else {
        toast.error(result.error?.message ?? '링크 삭제에 실패했습니다.');
        return false;
      }
    },
    [removeLink]
  );

  const toggleFavorite = useCallback(
    async (linkId: string) => {
      const result = await linkService.toggleFavorite(linkId);

      if (result.success && result.data) {
        updateLinkInStore(linkId, { isFavorite: result.data.isFavorite });
        toast.success(result.data.isFavorite ? '즐겨찾기에 추가되었습니다.' : '즐겨찾기에서 제거되었습니다.');
        return result.data;
      } else {
        toast.error(result.error?.message ?? '즐겨찾기 변경에 실패했습니다.');
        return null;
      }
    },
    [updateLinkInStore]
  );

  const toggleArchive = useCallback(
    async (linkId: string) => {
      const result = await linkService.toggleArchive(linkId);

      if (result.success && result.data) {
        updateLinkInStore(linkId, { isArchived: result.data.isArchived });
        toast.success(result.data.isArchived ? '아카이브되었습니다.' : '아카이브에서 복원되었습니다.');
        return result.data;
      } else {
        toast.error(result.error?.message ?? '아카이브 변경에 실패했습니다.');
        return null;
      }
    },
    [updateLinkInStore]
  );

  const searchLinks = useCallback(
    async (query: string) => {
      if (!user?.id) return;

      setLoading(true);
      const result = await linkService.searchLinks(user.id, query);

      if (result.success && result.data) {
        setLinks(result.data.data);
        setPagination({
          page: result.data.page,
          pageSize: result.data.pageSize,
          total: result.data.total,
          totalPages: result.data.totalPages,
        });
      } else {
        toast.error(result.error?.message ?? '검색에 실패했습니다.');
      }

      setLoading(false);
    },
    [user, setLinks, setLoading]
  );

  const goToPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));
      fetchLinks(undefined, undefined, { page, pageSize: pagination.pageSize });
    },
    [fetchLinks, pagination.pageSize]
  );

  return {
    links,
    filter,
    sort,
    isLoading,
    error,
    pagination,
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    toggleFavorite,
    toggleArchive,
    searchLinks,
    setFilter,
    setSort,
    goToPage,
  };
}
