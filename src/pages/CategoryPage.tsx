import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Folder, ArrowLeft } from 'lucide-react';
import { useLinkStore } from '../stores/link.store';
import { useCategoryStore } from '../stores/category.store';
import { useUIStore } from '../stores/ui.store';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { links, isLoading, setFilter } = useLinkStore();
  const { categories } = useCategoryStore();
  const { linkViewMode } = useUIStore();

  const category = useMemo(
    () => categories.find((cat) => cat.id === categoryId),
    [categories, categoryId]
  );

  const categoryLinks = useMemo(
    () => links.filter((link) => link.categoryId === categoryId && !link.isArchived),
    [links, categoryId]
  );

  useEffect(() => {
    if (categoryId) {
      setFilter({ categoryId });
    }
    return () => {
      setFilter({ categoryId: undefined });
    };
  }, [categoryId, setFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <EmptyState
        icon={<Folder className="w-12 h-12 text-gray-400" />}
        title="카테고리를 찾을 수 없습니다"
        description="요청하신 카테고리가 존재하지 않거나 삭제되었습니다"
        action={
          <Link to="/">
            <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
              돌아가기
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: category.color }}
        >
          <Folder className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h1>
          {category.description ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.description}
            </p>
          ) : null}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
          {categoryLinks.length}개
        </span>
      </div>

      {categoryLinks.length === 0 ? (
        <EmptyState
          icon={<Folder className="w-12 h-12 text-gray-400" />}
          title="이 카테고리에 링크가 없습니다"
          description="링크를 이 카테고리에 추가해 보세요"
          action={
            <Link to="/">
              <Button variant="secondary">링크 추가하기</Button>
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
          {categoryLinks.map((link) => (
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
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {link.customTitle || link.aiTitle || link.originalTitle || link.originalUrl}
                </h3>
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
