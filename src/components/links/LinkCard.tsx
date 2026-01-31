import { memo, useCallback, useMemo } from 'react';
import {
  Star,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Archive,
  Globe,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import type { Link } from '../../types';
import type { Category } from '../../types/category';
import type { Tag } from '../../types/tag';
import { Badge } from '../ui/Badge';
import { Dropdown } from '../ui/Dropdown';

dayjs.extend(relativeTime);
dayjs.locale('ko');

interface LinkCardProps {
  link: Link;
  category?: Category;
  tags?: Tag[];
  viewMode?: 'grid' | 'list';
  onToggleFavorite?: (linkId: string) => void;
  onEdit?: (link: Link) => void;
  onDelete?: (linkId: string) => void;
  onArchive?: (linkId: string) => void;
  onOpenLink?: (link: Link) => void;
}

const LinkCard = memo(function LinkCard({
  link,
  category,
  tags = [],
  viewMode = 'grid',
  onToggleFavorite,
  onEdit,
  onDelete,
  onArchive,
  onOpenLink,
}: LinkCardProps) {
  const title = link.customTitle || link.aiTitle || link.originalTitle || link.originalUrl;
  const summary = link.customSummary || link.aiSummary || link.ogDescription;
  const memo = link.customMemo;
  const faviconUrl = link.faviconUrl;
  const siteName = link.siteName || new URL(link.originalUrl).hostname;

  const handleCardClick = useCallback(() => {
    onOpenLink?.(link);
  }, [link, onOpenLink]);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite?.(link.id);
    },
    [link.id, onToggleFavorite]
  );

  const dropdownItems = useMemo(() => [
    {
      key: 'edit',
      label: (
        <span className="flex items-center gap-2">
          <Edit2 className="w-4 h-4" /> 수정
        </span>
      ),
      onClick: () => onEdit?.(link),
    },
    {
      key: 'archive',
      label: (
        <span className="flex items-center gap-2">
          <Archive className="w-4 h-4" /> {link.isArchived ? '아카이브 해제' : '아카이브'}
        </span>
      ),
      onClick: () => onArchive?.(link.id),
    },
    {
      key: 'delete',
      label: (
        <span className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> 삭제
        </span>
      ),
      onClick: () => onDelete?.(link.id),
      danger: true,
    },
  ], [link, onEdit, onArchive, onDelete]);

  const categoryColor = category?.color || '#6b7280';

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 88px' }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" className="w-6 h-6" />
            ) : (
              <Globe className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{title}</h3>
              {category ? (
                <Badge
                  size="sm"
                  className="!bg-opacity-20 flex-shrink-0"
                  style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                >
                  {category.name}
                </Badge>
              ) : link.aiCategorySuggestion ? (
                <Badge size="sm" color="purple" className="flex-shrink-0">
                  {link.aiCategorySuggestion}
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1">{siteName}</p>
            {memo ? (
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate italic">
                💬 {memo}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-lg transition-colors ${
                link.isFavorite
                  ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Star className={`w-5 h-5 ${link.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <Dropdown
              trigger={
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              }
              items={dropdownItems}
              align="right"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleCardClick}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 280px' }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{siteName}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-lg transition-colors ${
                link.isFavorite
                  ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Star className={`w-4 h-4 ${link.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 leading-snug">{title}</h3>

        {summary ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{summary}</p>
        ) : null}

        {memo ? (
          <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mb-3 italic bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1">
            💬 {memo}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {category ? (
            <Badge
              size="sm"
              className="!bg-opacity-20"
              style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
            >
              {category.name}
            </Badge>
          ) : link.aiCategorySuggestion ? (
            <Badge size="sm" color="purple">
              {link.aiCategorySuggestion}
            </Badge>
          ) : null}
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} size="sm" color="gray">
              {tag.name}
            </Badge>
          ))}
          {tags.length > 3 ? (
            <Badge size="sm" color="gray">
              +{tags.length - 3}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-400">{dayjs(link.createdAt).fromNow()}</span>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
              items={dropdownItems}
              align="right"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export { LinkCard };
export type { LinkCardProps };
