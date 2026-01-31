import { memo } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import type { Category } from '../../types';
import { useCategoryStore, selectRootCategories, selectChildCategories } from '../../stores/category.store';
import { CategoryItem } from './CategoryItem';
import { Button, Spinner, EmptyState } from '../ui';

interface CategoryListProps {
  onCategorySelect?: (category: Category | null) => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  selectedCategoryId?: string | null;
  showAddButton?: boolean;
}

interface CategoryTreeItemProps {
  category: Category;
  level: number;
  selectedCategoryId?: string | null;
  onSelect?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

const CategoryTreeItem = memo(function CategoryTreeItem({
  category,
  level,
  selectedCategoryId,
  onSelect,
  onEdit,
  onDelete,
}: CategoryTreeItemProps) {
  const children = useCategoryStore((state) => selectChildCategories(state, category.id));

  return (
    <div style={{ marginLeft: level > 0 ? `${level * 12}px` : 0 }}>
      <CategoryItem
        category={category}
        isSelected={selectedCategoryId === category.id}
        onClick={() => onSelect?.(category)}
        onEdit={() => onEdit?.(category)}
        onDelete={() => onDelete?.(category)}
      />
      {children.map((child) => (
        <CategoryTreeItem
          key={child.id}
          category={child}
          level={level + 1}
          selectedCategoryId={selectedCategoryId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

const CategoryList = memo(function CategoryList({
  onCategorySelect,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  selectedCategoryId,
  showAddButton = true,
}: CategoryListProps) {
  const rootCategories = useCategoryStore(selectRootCategories);
  const isLoading = useCategoryStore((state) => state.isLoading);

  const handleSelectAll = () => {
    onCategorySelect?.(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-3 mb-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          카테고리
        </h3>
        {showAddButton && (
          <button
            type="button"
            onClick={onAddCategory}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="카테고리 추가"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
          ${selectedCategoryId === null ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}
        `}
        onClick={handleSelectAll}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectAll();
          }
        }}
        aria-pressed={selectedCategoryId === null}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
          <FolderOpen className="w-4 h-4 text-gray-600" />
        </div>
        <span className="font-medium">전체</span>
      </div>

      {rootCategories.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-8 h-8" />}
          title="카테고리 없음"
          description="새 카테고리를 추가해보세요"
          action={
            showAddButton ? (
              <Button variant="secondary" size="sm" onClick={onAddCategory}>
                카테고리 추가
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-1">
          {rootCategories.map((category) => (
            <CategoryTreeItem
              key={category.id}
              category={category}
              level={0}
              selectedCategoryId={selectedCategoryId}
              onSelect={onCategorySelect}
              onEdit={onEditCategory}
              onDelete={onDeleteCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export { CategoryList };
export type { CategoryListProps };
