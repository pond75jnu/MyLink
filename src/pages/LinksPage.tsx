import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLinkStore } from '../stores/link.store';
import { useCategoryStore } from '../stores/category.store';
import { useTagStore } from '../stores/tag.store';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import * as linkService from '../services/link.service';
import * as categoryService from '../services/category.service';
import * as tagService from '../services/tag.service';
import type { Link, UpdateLinkInput, LinkSort } from '../types';
import type { Tag } from '../types/tag';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Dropdown } from '../components/ui/Dropdown';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EditLinkModal } from '../components/links/EditLinkModal';
import { LinkCard } from '../components/links/LinkCard';
import { LinkDetail } from '../components/links/LinkDetail';

export function LinksPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [selectedLinkTags, setSelectedLinkTags] = useState<Tag[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuthStore();
  const {
    links: allLinks,
    isLoading,
    filter,
    sort,
    setLinks,
    updateLink: updateLinkInStore,
    removeLink,
    setFilter,
    setSort,
    setLoading,
  } = useLinkStore();

  const { categories, setCategories } = useCategoryStore();
  const { tags, setTags, addTag } = useTagStore();
  const { linkViewMode, setLinkViewMode } = useUIStore();

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setLoading(true);
      setIsPageLoading(true);

      const [linksResult, categoriesResult, tagsResult] = await Promise.all([
        linkService.getLinks(user.id, { isArchived: false }),
        categoryService.getCategories(user.id),
        tagService.getTags(user.id),
      ]);

      if (linksResult.success && linksResult.data) {
        setLinks(linksResult.data.data);
      }

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (tagsResult.success && tagsResult.data) {
        setTags(tagsResult.data);
      }

      setLoading(false);
      setIsPageLoading(false);
    };

    loadData();
  }, [user?.id, setLinks, setCategories, setTags, setLoading]);

  const links = useMemo(() => {
    const filtered = allLinks.filter((link: Link) => {
      if (filter.categoryId && link.categoryId !== filter.categoryId) return false;
      if (filter.isFavorite !== undefined && link.isFavorite !== filter.isFavorite) return false;
      if (filter.isArchived !== undefined && link.isArchived !== filter.isArchived) return false;
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

    return [...filtered].sort((a, b) => {
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
  }, [allLinks, filter, sort]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter({ search: e.target.value });
    },
    [setFilter]
  );

  const handleSortChange = useCallback(
    (field: LinkSort['field']) => {
      setSort({
        field,
        direction: sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc',
      });
    },
    [sort, setSort]
  );

  const handleToggleFavorite = useCallback(
    async (linkId: string) => {
      const result = await linkService.toggleFavorite(linkId);
      if (result.success && result.data) {
        updateLinkInStore(linkId, { isFavorite: result.data.isFavorite });
        toast.success(result.data.isFavorite ? '즐겨찾기에 추가되었습니다.' : '즐겨찾기에서 제거되었습니다.');
      }
    },
    [updateLinkInStore]
  );

  const handleArchive = useCallback(
    async (linkId: string) => {
      const result = await linkService.toggleArchive(linkId);
      if (result.success && result.data) {
        updateLinkInStore(linkId, { isArchived: result.data.isArchived });
        toast.success(result.data.isArchived ? '아카이브되었습니다.' : '아카이브에서 복원되었습니다.');
      }
    },
    [updateLinkInStore]
  );

  const handleDeleteClick = useCallback(
    (linkId: string) => {
      const link = allLinks.find((l) => l.id === linkId);
      if (link) {
        setSelectedLink(link);
        setIsDeleteDialogOpen(true);
      }
    },
    [allLinks]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedLink) return;

    setIsDeleting(true);
    const result = await linkService.deleteLink(selectedLink.id);
    if (result.success) {
      removeLink(selectedLink.id);
      toast.success('링크가 삭제되었습니다.');
      setIsDeleteDialogOpen(false);
      setIsDetailOpen(false);
      setSelectedLink(null);
    } else {
      toast.error(result.error?.message || '링크 삭제에 실패했습니다.');
    }
    setIsDeleting(false);
  }, [selectedLink, removeLink]);

  const handleEditClick = useCallback(
    async (link: Link) => {
      setSelectedLink(link);
      const linkTagsResult = await tagService.getLinkTags(link.id);
      if (linkTagsResult.success && linkTagsResult.data) {
        setSelectedLinkTags(linkTagsResult.data);
      } else {
        setSelectedLinkTags([]);
      }
      setIsEditModalOpen(true);
    },
    []
  );

  const handleUpdateLink = useCallback(
    async (linkId: string, data: UpdateLinkInput) => {
      const result = await linkService.updateLink(linkId, data);
      if (result.success && result.data) {
        updateLinkInStore(linkId, result.data);
        toast.success('링크가 수정되었습니다.');
      } else {
        toast.error(result.error?.message || '링크 수정에 실패했습니다.');
      }
    },
    [updateLinkInStore]
  );

  const handleOpenDetail = useCallback(
    async (link: Link) => {
      setSelectedLink(link);
      const linkTagsResult = await tagService.getLinkTags(link.id);
      if (linkTagsResult.success && linkTagsResult.data) {
        setSelectedLinkTags(linkTagsResult.data);
      } else {
        setSelectedLinkTags([]);
      }
      setIsDetailOpen(true);
      linkService.incrementViewCount(link.id);
    },
    []
  );

  const handleAddTag = useCallback(
    async (tagName: string) => {
      if (!user?.id) return undefined;

      const result = await tagService.createTag(user.id, { name: tagName });
      if (result.success && result.data) {
        addTag(result.data);
        return result.data;
      }
      return undefined;
    },
    [user?.id, addTag]
  );

  const handleToggleLinkTag = useCallback(
    async (linkId: string, tagId: string) => {
      const isTagged = selectedLinkTags.some((t) => t.id === tagId);
      
      if (isTagged) {
        const result = await tagService.removeTagFromLink(linkId, tagId);
        if (result.success) {
          setSelectedLinkTags((prev) => prev.filter((t) => t.id !== tagId));
        }
      } else {
        const result = await tagService.addTagToLink(linkId, tagId);
        if (result.success) {
          const tag = tags.find((t) => t.id === tagId);
          if (tag) {
            setSelectedLinkTags((prev) => [...prev, tag]);
          }
        }
      }
    },
    [selectedLinkTags, tags]
  );

  const sortOptions = useMemo(
    () => [
      { key: 'createdAt', label: '최신순', value: 'createdAt' },
      { key: 'updatedAt', label: '수정일순', value: 'updatedAt' },
      { key: 'viewCount', label: '조회순', value: 'viewCount' },
      { key: 'title', label: '제목순', value: 'title' },
    ],
    []
  );

  const categoryById = useMemo(() => {
    const map = new Map<string, typeof categories[0]>();
    for (const c of categories) {
      map.set(c.id, c);
    }
    return map;
  }, [categories]);

  if (isPageLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">내 링크</h1>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="링크 검색..."
            leftIcon={<Search className="w-4 h-4" />}
            value={filter.search || ''}
            onChange={handleSearch}
          />
        </div>

        <div className="flex items-center gap-2">
          <Dropdown
            trigger={
              <Button variant="secondary" icon={<SlidersHorizontal className="w-4 h-4" />}>
                {sortOptions.find((opt) => opt.value === sort.field)?.label || '정렬'}
              </Button>
            }
            items={sortOptions.map((opt) => ({
              key: opt.key,
              label: opt.label,
              onClick: () => handleSortChange(opt.value as LinkSort['field']),
            }))}
          />

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setLinkViewMode('grid')}
              className={`p-2 ${
                linkViewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label="그리드 보기"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLinkViewMode('list')}
              className={`p-2 ${
                linkViewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label="리스트 보기"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {links.length === 0 ? (
        <EmptyState
          title="저장된 링크가 없습니다"
          description="상단의 '링크 추가' 버튼을 눌러 시작하세요"
        />
      ) : (
        <div
          className={
            linkViewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-2'
          }
        >
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              category={categoryById.get(link.categoryId ?? '')}
              viewMode={linkViewMode}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleEditClick}
              onArchive={handleArchive}
              onDelete={handleDeleteClick}
              onOpenLink={handleOpenDetail}
            />
          ))}
        </div>
      )}

      <EditLinkModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLink(null);
          setSelectedLinkTags([]);
        }}
        link={selectedLink}
        categories={categories}
        tags={tags}
        linkTags={selectedLinkTags}
        onSubmit={handleUpdateLink}
        onAddTag={handleAddTag}
        onToggleLinkTag={handleToggleLinkTag}
      />

      {selectedLink ? (
        <LinkDetail
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedLink(null);
            setSelectedLinkTags([]);
          }}
          link={selectedLink}
          category={categoryById.get(selectedLink.categoryId ?? '')}
          tags={selectedLinkTags}
          allCategories={categories}
          allTags={tags}
          onToggleFavorite={handleToggleFavorite}
          onUpdate={handleUpdateLink}
          onDelete={handleDeleteClick}
          onArchive={handleArchive}
          onAddTag={handleAddTag}
          onToggleLinkTag={handleToggleLinkTag}
        />
      ) : null}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          if (!isDetailOpen) {
            setSelectedLink(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="링크 삭제"
        message="이 링크를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
