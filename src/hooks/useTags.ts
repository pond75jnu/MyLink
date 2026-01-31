import { useCallback } from 'react';
import { useTagStore, useAuthStore } from '../stores';
import * as tagService from '../services/tag.service';
import type { CreateTagInput } from '../types';
import toast from 'react-hot-toast';

export function useTags() {
  const { user } = useAuthStore();
  const {
    tags,
    isLoading,
    setTags,
    addTag,
    removeTag,
    setLoading,
  } = useTagStore();

  const fetchTags = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    const result = await tagService.getTags(user.id);

    if (result.success && result.data) {
      setTags(result.data);
    } else {
      toast.error(result.error?.message ?? '태그를 불러오는데 실패했습니다.');
    }

    setLoading(false);
  }, [user, setTags, setLoading]);

  const createTag = useCallback(
    async (input: CreateTagInput) => {
      if (!user?.id) return null;

      setLoading(true);
      const result = await tagService.createTag(user.id, input);

      if (result.success && result.data) {
        addTag(result.data);
        toast.success('태그가 생성되었습니다.');
        setLoading(false);
        return result.data;
      } else {
        toast.error(result.error?.message ?? '태그 생성에 실패했습니다.');
        setLoading(false);
        return null;
      }
    },
    [user, addTag, setLoading]
  );

  const deleteTag = useCallback(
    async (tagId: string) => {
      const result = await tagService.deleteTag(tagId);

      if (result.success) {
        removeTag(tagId);
        toast.success('태그가 삭제되었습니다.');
        return true;
      } else {
        toast.error(result.error?.message ?? '태그 삭제에 실패했습니다.');
        return false;
      }
    },
    [removeTag]
  );

  const addTagToLink = useCallback(async (linkId: string, tagId: string) => {
    const result = await tagService.addTagToLink(linkId, tagId);

    if (result.success) {
      return result.data;
    } else {
      toast.error(result.error?.message ?? '태그 추가에 실패했습니다.');
      return null;
    }
  }, []);

  const removeTagFromLink = useCallback(async (linkId: string, tagId: string) => {
    const result = await tagService.removeTagFromLink(linkId, tagId);

    if (result.success) {
      return true;
    } else {
      toast.error(result.error?.message ?? '태그 제거에 실패했습니다.');
      return false;
    }
  }, []);

  const getLinkTags = useCallback(async (linkId: string) => {
    const result = await tagService.getLinkTags(linkId);

    if (result.success && result.data) {
      return result.data;
    }
    return [];
  }, []);

  const getTagById = useCallback(
    (tagId: string) => {
      return tags.find((tag) => tag.id === tagId);
    },
    [tags]
  );

  const getTagsByIds = useCallback(
    (tagIds: string[]) => {
      return tags.filter((tag) => tagIds.includes(tag.id));
    },
    [tags]
  );

  const getPopularTags = useCallback(
    (limit = 10) => {
      return [...tags].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
    },
    [tags]
  );

  return {
    tags,
    isLoading,
    fetchTags,
    createTag,
    deleteTag,
    addTagToLink,
    removeTagFromLink,
    getLinkTags,
    getTagById,
    getTagsByIds,
    getPopularTags,
  };
}
