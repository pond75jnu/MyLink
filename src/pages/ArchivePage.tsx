import { useMemo } from 'react';
import { Archive, RotateCcw } from 'lucide-react';
import { useLinkStore } from '../stores/link.store';
import { useUIStore } from '../stores/ui.store';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export function ArchivePage() {
  const { links: allLinks, isLoading, updateLink } = useLinkStore();
  const { linkViewMode } = useUIStore();

  const links = useMemo(
    () => allLinks.filter((link) => link.isArchived),
    [allLinks]
  );

  const handleRestore = (linkId: string) => {
    updateLink(linkId, { isArchived: false });
    // TODO: Call API to restore link
  };

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
        <Archive className="w-6 h-6 text-gray-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          아카이브
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {links.length}개
        </span>
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon={<Archive className="w-12 h-12 text-gray-400" />}
          title="아카이브된 링크가 없습니다"
          description="링크를 아카이브하면 여기에 표시됩니다"
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
                hover:shadow-md transition-shadow
                ${linkViewMode === 'list' ? 'flex items-center gap-4' : ''}
              `}
            >
              {link.faviconUrl ? (
                <img
                  src={link.faviconUrl}
                  alt=""
                  className="w-6 h-6 rounded opacity-50"
                />
              ) : (
                <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700" />
              )}
              <div className="flex-1 min-w-0 mt-2">
                <h3 className="font-medium text-gray-600 dark:text-gray-400 truncate">
                  {link.customTitle || link.aiTitle || link.originalTitle || link.originalUrl}
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 truncate">
                  {link.customSummary || link.aiSummary || link.ogDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRestore(link.id)}
                className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <RotateCcw className="w-4 h-4" />
                복원
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
