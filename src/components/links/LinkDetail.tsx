import { useState, useCallback, lazy, Suspense } from 'react';
import {
  X,
  ExternalLink,
  Star,
  Edit2,
  Archive,
  Trash2,
  Globe,
  Calendar,
  Eye,
  Tag as TagIcon,
  Folder,
  FileText,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { Link, UpdateLinkInput } from '../../types';
import type { Category } from '../../types/category';
import type { Tag } from '../../types/tag';
import { Button, Badge, Spinner } from '../ui';

const LinkForm = lazy(() =>
  import('./LinkForm').then((m) => ({ default: m.LinkForm }))
);

interface LinkDetailProps {
  link: Link;
  category?: Category;
  tags?: Tag[];
  allCategories: Category[];
  allTags: Tag[];
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (linkId: string) => void;
  onUpdate?: (linkId: string, data: UpdateLinkInput) => Promise<void>;
  onDelete?: (linkId: string) => void;
  onArchive?: (linkId: string) => void;
  onAddTag?: (tagName: string) => Promise<Tag | undefined>;
  onToggleLinkTag?: (linkId: string, tagId: string) => void;
}

function LinkDetail({
  link,
  category,
  tags = [],
  allCategories,
  allTags,
  isOpen,
  onClose,
  onToggleFavorite,
  onUpdate,
  onDelete,
  onArchive,
  onAddTag,
  onToggleLinkTag,
}: LinkDetailProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const title = link.customTitle || link.aiTitle || link.originalTitle || link.originalUrl;
  const summary = link.customSummary || link.aiSummary || link.ogDescription;
  const siteName = link.siteName || new URL(link.originalUrl).hostname;

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite?.(link.id);
  }, [link.id, onToggleFavorite]);

  const handleUpdate = async (data: UpdateLinkInput) => {
    await onUpdate?.(link.id, data);
    setIsEditMode(false);
  };

  const handleToggleLinkTag = (tagId: string) => {
    onToggleLinkTag?.(link.id, tagId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">
            {isEditMode ? '링크 수정' : '링크 상세'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isEditMode ? (
            <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
              <LinkForm
                mode="edit"
                link={link}
                categories={allCategories}
                tags={allTags}
                linkTags={tags}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditMode(false)}
                onAddTag={onAddTag}
                onToggleLinkTag={handleToggleLinkTag}
              />
            </Suspense>
          ) : (
            <>
              {link.ogImageUrl ? (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <img
                    src={link.ogImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}

              <div className="flex items-start gap-3 mb-4">
                {link.faviconUrl ? (
                  <img src={link.faviconUrl} alt="" className="w-6 h-6 mt-1" />
                ) : (
                  <Globe className="w-6 h-6 text-gray-400 mt-1" />
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">{title}</h1>
                  <p className="text-sm text-gray-500">{siteName}</p>
                </div>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    link.isFavorite
                      ? 'text-yellow-500 hover:bg-yellow-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <Star className={`w-5 h-5 ${link.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <a
                href={link.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors mb-6"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.originalUrl}</span>
              </a>

              {summary ? (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    요약
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>
                </div>
              ) : null}

              {link.customMemo ? (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">메모</h3>
                  <p className="text-gray-600 text-sm leading-relaxed bg-yellow-50 p-3 rounded-lg">
                    {link.customMemo}
                  </p>
                </div>
              ) : null}

              <div className="space-y-4 mb-6">
                {category ? (
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">카테고리:</span>
                    <Badge
                      size="sm"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.name}
                    </Badge>
                  </div>
                ) : null}

                {tags.length > 0 ? (
                  <div className="flex items-start gap-2">
                    <TagIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-500">태그:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          size="sm"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                {link.aiKeywords && link.aiKeywords.length > 0 ? (
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-500">키워드:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {link.aiKeywords.map((keyword, i) => (
                        <Badge key={i} size="sm" color="gray">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">조회수:</span>
                  <span className="text-sm text-gray-700">{link.viewCount}회</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">추가일:</span>
                  <span className="text-sm text-gray-700">
                    {dayjs(link.createdAt).format('YYYY년 MM월 DD일')}
                  </span>
                </div>

                {link.contentType ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">콘텐츠 타입:</span>
                    <Badge size="sm" color="blue">{link.contentType}</Badge>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  icon={<Edit2 className="w-4 h-4" />}
                  onClick={() => setIsEditMode(true)}
                >
                  수정
                </Button>
                <Button
                  variant="ghost"
                  icon={<Archive className="w-4 h-4" />}
                  onClick={() => onArchive?.(link.id)}
                >
                  {link.isArchived ? '아카이브 해제' : '아카이브'}
                </Button>
                <Button
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => onDelete?.(link.id)}
                >
                  삭제
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { LinkDetail };
export type { LinkDetailProps };
