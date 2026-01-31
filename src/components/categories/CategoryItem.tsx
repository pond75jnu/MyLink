import { memo } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '../../types';
import { Dropdown } from '../ui';
import { ICON_MAP } from './IconPicker';

interface CategoryItemProps {
  category: Category;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CategoryItem = memo(function CategoryItem({
  category,
  isSelected = false,
  onClick,
  onEdit,
  onDelete,
}: CategoryItemProps) {
  const iconName = category.icon || 'folder';
  const Icon = ICON_MAP[iconName] || ICON_MAP.folder;

  const dropdownItems = [
    {
      key: 'edit',
      label: (
        <span className="flex items-center gap-2">
          <Pencil className="w-4 h-4" />
          수정
        </span>
      ),
      onClick: onEdit,
    },
    {
      key: 'delete',
      label: (
        <span className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          삭제
        </span>
      ),
      onClick: onDelete,
      danger: true,
    },
  ];

  return (
    <div
      className={`
        group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
        transition-colors
        ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-pressed={isSelected}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: category.color }} />
        </div>
        <span className="font-medium truncate">{category.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {typeof category.linkCount === 'number' && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {category.linkCount}
          </span>
        )}
        {(onEdit || onDelete) && (
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-200 text-gray-500"
                  aria-label="더보기"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              }
              items={dropdownItems}
              align="right"
            />
          </div>
        )}
      </div>
    </div>
  );
});

export { CategoryItem };
export type { CategoryItemProps };
