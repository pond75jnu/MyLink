import { useCallback, lazy, Suspense } from 'react';
import type { Link, UpdateLinkInput } from '../../types';
import type { Category } from '../../types/category';
import type { Tag } from '../../types/tag';
import { Modal, Spinner } from '../ui';

const LinkForm = lazy(() =>
  import('./LinkForm').then((m) => ({ default: m.LinkForm }))
);

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: Link | null;
  categories: Category[];
  tags: Tag[];
  linkTags: Tag[];
  onSubmit: (linkId: string, data: UpdateLinkInput) => Promise<void>;
  onAddTag?: (tagName: string) => Promise<Tag | undefined>;
  onToggleLinkTag?: (linkId: string, tagId: string) => void;
}

function EditLinkModal({
  isOpen,
  onClose,
  link,
  categories,
  tags,
  linkTags,
  onSubmit,
  onAddTag,
  onToggleLinkTag,
}: EditLinkModalProps) {
  const handleSubmit = useCallback(
    async (data: UpdateLinkInput) => {
      if (!link) return;
      await onSubmit(link.id, data);
      onClose();
    },
    [link, onSubmit, onClose]
  );

  const handleToggleLinkTag = useCallback(
    (tagId: string) => {
      if (link && onToggleLinkTag) {
        onToggleLinkTag(link.id, tagId);
      }
    },
    [link, onToggleLinkTag]
  );

  if (!link) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="링크 수정" size="lg">
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        }
      >
        <LinkForm
          mode="edit"
          link={link}
          categories={categories}
          tags={tags}
          linkTags={linkTags}
          onSubmit={handleSubmit}
          onCancel={onClose}
          onAddTag={onAddTag}
          onToggleLinkTag={handleToggleLinkTag}
        />
      </Suspense>
    </Modal>
  );
}

export { EditLinkModal };
export type { EditLinkModalProps };
