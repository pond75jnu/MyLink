import { memo } from 'react';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../types';
import { Modal } from '../ui';
import { CategoryForm } from './CategoryForm';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  isLoading?: boolean;
}

const CategoryModal = memo(function CategoryModal({
  isOpen,
  onClose,
  category,
  onSubmit,
  isLoading = false,
}: CategoryModalProps) {
  const isEdit = Boolean(category);

  const handleSubmit = async (data: CreateCategoryInput | UpdateCategoryInput) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '카테고리 수정' : '새 카테고리'}
      size="md"
    >
      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </Modal>
  );
});

export { CategoryModal };
export type { CategoryModalProps };
