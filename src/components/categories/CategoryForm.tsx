import { memo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../types';
import { useCategoryStore } from '../../stores/category.store';
import { Input, Button } from '../ui';
import { ColorPicker, PRESET_COLORS } from './ColorPicker';
import { IconPicker } from './IconPicker';

const categorySchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해주세요')
    .max(100, '이름은 100자 이하로 입력해주세요'),
  description: z.string().max(500, '설명은 500자 이하로 입력해주세요').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 형식이 아닙니다'),
  icon: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CategoryForm = memo(function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
}: CategoryFormProps) {
  const allCategories = useCategoryStore((state) => state.categories);
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      color: category?.color || PRESET_COLORS[11],
      icon: category?.icon || 'folder',
      parentId: category?.parentId || '',
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon || 'folder',
        parentId: category.parentId || '',
      });
    }
  }, [category, reset]);

  const selectedColor = useWatch({ control, name: 'color' });
  const selectedIcon = useWatch({ control, name: 'icon' });

  const handleFormSubmit = async (data: CategoryFormData) => {
    const submitData: CreateCategoryInput | UpdateCategoryInput = {
      name: data.name,
      description: data.description || undefined,
      color: data.color,
      icon: data.icon || undefined,
      parentId: data.parentId || undefined,
    };
    await onSubmit(submitData);
  };

  const availableParents = allCategories.filter(
    (cat) => !category || cat.id !== category.id
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="이름"
        placeholder="카테고리 이름"
        error={errors.name?.message}
        {...register('name')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명 (선택)
        </label>
        <textarea
          className={`
            block w-full rounded-lg border transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            px-3 py-2 text-sm
            ${
              errors.description
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }
          `}
          rows={3}
          placeholder="카테고리에 대한 설명"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <ColorPicker
        value={selectedColor}
        onChange={(color) => setValue('color', color)}
      />

      <IconPicker
        value={selectedIcon || 'folder'}
        onChange={(icon) => setValue('icon', icon)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          상위 카테고리 (선택)
        </label>
        <select
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          {...register('parentId')}
        >
          <option value="">없음</option>
          {availableParents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          {isEdit ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  );
});

export { CategoryForm };
export type { CategoryFormProps };
