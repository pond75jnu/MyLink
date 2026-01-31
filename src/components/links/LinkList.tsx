import { useCallback, useEffect, useRef } from 'react';
import { Link2 } from 'lucide-react';
import type { Link } from '../../types';
import type { Category } from '../../types/category';
import type { Tag } from '../../types/tag';
import { LinkCard } from './LinkCard';
import { LinkSkeleton } from './LinkSkeleton';
import { EmptyState, Button, Spinner } from '../ui';

interface LinkListProps {
  links: Link[];
  categories?: Category[];
  tagsByLinkId?: Record<string, Tag[]>;
  viewMode?: 'grid' | 'list';
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: () => void;
  emptyActionLabel?: string;
  onToggleFavorite?: (linkId: string) => void;
  onEdit?: (link: Link) => void;
  onDelete?: (linkId: string) => void;
  onArchive?: (linkId: string) => void;
  onOpenLink?: (link: Link) => void;
  onLoadMore?: () => void;
}

function LinkList({
  links,
  categories = [],
  tagsByLinkId = {},
  viewMode = 'grid',
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  emptyTitle = '링크가 없습니다',
  emptyDescription = '새로운 링크를 추가해보세요.',
  emptyAction,
  emptyActionLabel = '링크 추가',
  onToggleFavorite,
  onEdit,
  onDelete,
  onArchive,
  onOpenLink,
  onLoadMore,
}: LinkListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const getCategoryForLink = useCallback(
    (link: Link) => {
      return categories.find((c) => c.id === link.categoryId);
    },
    [categories]
  );

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (isLoading) {
    return (
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        }
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <LinkSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <EmptyState
        icon={<Link2 className="w-12 h-12 text-gray-400" />}
        title={emptyTitle}
        description={emptyDescription}
        action={
          emptyAction ? (
            <Button onClick={emptyAction}>{emptyActionLabel}</Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        }
      >
        {links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            category={getCategoryForLink(link)}
            tags={tagsByLinkId[link.id]}
            viewMode={viewMode}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onOpenLink={onOpenLink}
          />
        ))}
      </div>

      {hasMore ? (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-8"
        >
          {isLoadingMore ? (
            <Spinner size="lg" />
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export { LinkList };
export type { LinkListProps };
