import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { useLinkStore } from '../stores/link.store';
import { useUIStore } from '../stores/ui.store';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export function FavoritesPage() {
  const { links: allLinks, isLoading } = useLinkStore();
  const { linkViewMode } = useUIStore();

  const links = useMemo(
    () => allLinks.filter((link) => link.isFavorite && !link.isArchived),
    [allLinks]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="w-6 h-6 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          즐겨찾기
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {links.length}개
        </span>
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon={<Star className="w-12 h-12 text-gray-400" />}
          title="즐겨찾기가 없습니다"
          description="링크를 즐겨찾기에 추가하면 여기에 표시됩니다"
          action={
            <Link to="/">
              <Button variant="secondary">링크 둘러보기</Button>
            </Link>
          }
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
            <div
              key={link.id}
              className={`
                bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4
                hover:shadow-md transition-shadow cursor-pointer
                ${linkViewMode === 'list' ? 'flex items-center gap-4' : ''}
              `}
            >
              {link.faviconUrl ? (
                <img
                  src={link.faviconUrl}
                  alt=""
                  className="w-6 h-6 rounded"
                />
              ) : (
                <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700" />
              )}
              <div className="flex-1 min-w-0 mt-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {link.customTitle || link.aiTitle || link.originalTitle || link.originalUrl}
                  </h3>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {link.customSummary || link.aiSummary || link.ogDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
