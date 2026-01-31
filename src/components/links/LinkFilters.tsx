import { memo } from 'react';
import { Filter, ArrowUpDown, Grid3X3, List } from 'lucide-react';
import type { Category } from '../../types/category';
import type { LinkFilter, LinkSort } from '../../types/link';
import { Dropdown } from '../ui';

interface LinkFiltersProps {
  categories: Category[];
  filter: LinkFilter;
  sort: LinkSort;
  viewMode: 'grid' | 'list';
  onFilterChange: (filter: LinkFilter) => void;
  onSortChange: (sort: LinkSort) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const CONTENT_TYPES = [
  { value: '', label: '전체' },
  { value: 'article', label: '아티클' },
  { value: 'video', label: '비디오' },
  { value: 'image', label: '이미지' },
  { value: 'document', label: '문서' },
  { value: 'product', label: '상품' },
  { value: 'blog', label: '블로그' },
  { value: 'news', label: '뉴스' },
];

const SORT_OPTIONS: { field: LinkSort['field']; direction: LinkSort['direction']; label: string }[] = [
  { field: 'createdAt', direction: 'desc', label: '최신순' },
  { field: 'createdAt', direction: 'asc', label: '오래된순' },
  { field: 'viewCount', direction: 'desc', label: '조회순' },
  { field: 'updatedAt', direction: 'desc', label: '수정일순' },
  { field: 'title', direction: 'asc', label: '제목순' },
];

const LinkFilters = memo(function LinkFilters({
  categories,
  filter,
  sort,
  viewMode,
  onFilterChange,
  onSortChange,
  onViewModeChange,
}: LinkFiltersProps) {
  const categoryItems = [
    {
      key: 'all',
      label: '전체 카테고리',
      onClick: () => onFilterChange({ ...filter, categoryId: undefined }),
    },
    ...categories.map((cat) => ({
      key: cat.id,
      label: (
        <span className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: cat.color }}
          />
          {cat.name}
          {cat.linkCount !== undefined ? (
            <span className="text-xs text-gray-400 ml-auto">({cat.linkCount})</span>
          ) : null}
        </span>
      ),
      onClick: () => onFilterChange({ ...filter, categoryId: cat.id }),
    })),
  ];

  const contentTypeItems = CONTENT_TYPES.map((type) => ({
    key: type.value || 'all',
    label: type.label,
    onClick: () =>
      onFilterChange({ ...filter, contentType: type.value || undefined }),
  }));

  const sortItems = SORT_OPTIONS.map((option) => ({
    key: `${option.field}-${option.direction}`,
    label: option.label,
    onClick: () => onSortChange({ field: option.field, direction: option.direction }),
  }));

  const selectedCategory = categories.find((c) => c.id === filter.categoryId);
  const selectedContentType = CONTENT_TYPES.find((t) => t.value === filter.contentType);
  const selectedSort = SORT_OPTIONS.find(
    (s) => s.field === sort.field && s.direction === sort.direction
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dropdown
        trigger={
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>{selectedCategory?.name || '전체 카테고리'}</span>
          </button>
        }
        items={categoryItems}
      />

      <Dropdown
        trigger={
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span>{selectedContentType?.label || '콘텐츠 타입'}</span>
          </button>
        }
        items={contentTypeItems}
      />

      <Dropdown
        trigger={
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowUpDown className="w-4 h-4" />
            <span>{selectedSort?.label || '정렬'}</span>
          </button>
        }
        items={sortItems}
      />

      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-auto">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 transition-colors ${
            viewMode === 'grid'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-400 hover:bg-gray-50'
          }`}
          aria-label="그리드 뷰"
        >
          <Grid3X3 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 transition-colors ${
            viewMode === 'list'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-400 hover:bg-gray-50'
          }`}
          aria-label="리스트 뷰"
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

export { LinkFilters };
export type { LinkFiltersProps };
