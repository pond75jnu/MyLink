import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import type { Category } from '../../types';
import { useCategoryStore } from '../../stores/category.store';
import { ICON_MAP } from './IconPicker';

interface CategorySelectProps {
  value?: string | null;
  onChange: (categoryId: string | null) => void;
  onAddNew?: () => void;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
}

const CategorySelect = memo(function CategorySelect({
  value,
  onChange,
  onAddNew,
  placeholder = '카테고리 선택',
  className = '',
  allowClear = true,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const categories = useCategoryStore((state) => state.categories);

  const selectedCategory = value
    ? categories.find((cat) => cat.id === value)
    : null;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleSelect = (categoryId: string | null) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2
          border rounded-lg text-left text-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {selectedCategory ? (
          <CategoryOption category={selectedCategory} />
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {allowClear && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-left text-sm
                hover:bg-gray-100 transition-colors
                ${!value ? 'bg-indigo-50 text-indigo-700' : ''}
              `}
              role="option"
              aria-selected={!value}
            >
              <span className="text-gray-500">선택 안함</span>
              {!value && <Check className="w-4 h-4 ml-auto" />}
            </button>
          )}

          {categories.map((category) => {
            const isSelected = value === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-left text-sm
                  hover:bg-gray-100 transition-colors
                  ${isSelected ? 'bg-indigo-50 text-indigo-700' : ''}
                `}
                role="option"
                aria-selected={isSelected}
              >
                <CategoryOption category={category} />
                {isSelected && <Check className="w-4 h-4 ml-auto flex-shrink-0" />}
              </button>
            );
          })}

          {onAddNew && (
            <>
              <div className="border-t border-gray-200" />
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>새 카테고리 추가</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

interface CategoryOptionProps {
  category: Category;
}

const CategoryOption = memo(function CategoryOption({ category }: CategoryOptionProps) {
  const iconName = category.icon || 'folder';
  const Icon = ICON_MAP[iconName] || ICON_MAP.folder;

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div
        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: category.color }} />
      </div>
      <span className="truncate">{category.name}</span>
    </div>
  );
});

export { CategorySelect };
export type { CategorySelectProps };
