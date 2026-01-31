import { useState, useCallback } from 'react';
import {
  Settings,
  User,
  Palette,
  FolderOpen,
  Tags,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Plus,
  Pencil,
  X,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useCategoryStore } from '../stores/category.store';
import { useTagStore } from '../stores/tag.store';
import { useUIStore } from '../stores/ui.store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

type SettingsTab = 'profile' | 'theme' | 'categories' | 'tags' | 'account';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  const { user, logout } = useAuthStore();
  const { categories, addCategory, removeCategory } = useCategoryStore();
  const { tags, addTag, removeTag } = useTagStore();
  const { theme, setTheme } = useUIStore();

  const tabs = [
    { id: 'profile' as const, label: '프로필', icon: User },
    { id: 'theme' as const, label: '테마', icon: Palette },
    { id: 'categories' as const, label: '카테고리', icon: FolderOpen },
    { id: 'tags' as const, label: '태그', icon: Tags },
    { id: 'account' as const, label: '계정', icon: Settings },
  ];

  const handleAddCategory = useCallback(() => {
    if (!newCategoryName.trim()) return;
    // TODO: Call API to create category
    addCategory({
      id: crypto.randomUUID(),
      userId: user?.id || '',
      name: newCategoryName,
      slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      color: '#6366f1',
      sortOrder: categories.length,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  }, [newCategoryName, addCategory, user, categories.length]);

  const handleAddTag = useCallback(() => {
    if (!newTagName.trim()) return;
    // TODO: Call API to create tag
    addTag({
      id: crypto.randomUUID(),
      userId: user?.id || '',
      name: newTagName,
      slug: newTagName.toLowerCase().replace(/\s+/g, '-'),
      color: '#10b981',
      usageCount: 0,
      createdAt: new Date().toISOString(),
    });
    setNewTagName('');
    setIsTagModalOpen(false);
  }, [newTagName, addTag, user]);

  const handleDeleteAccount = useCallback(() => {
    // TODO: Call API to delete account
    logout();
  }, [logout]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-gray-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">설정</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-48 flex-shrink-0">
          <ul className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors
                      ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                프로필 설정
              </h2>
              <div className="space-y-4 max-w-md">
                <Input label="이름" defaultValue={user?.name || ''} />
                <Input label="이메일" defaultValue={user?.email || ''} disabled />
                <Button>저장</Button>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                테마 설정
              </h2>
              <div className="grid grid-cols-3 gap-4 max-w-md">
                {[
                  { value: 'light' as const, label: '라이트', icon: Sun },
                  { value: 'dark' as const, label: '다크', icon: Moon },
                  { value: 'system' as const, label: '시스템', icon: Monitor },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors
                        ${
                          theme === option.value
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  카테고리 관리
                </h2>
                <Button
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  추가
                </Button>
              </div>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                      {category.linkCount !== undefined && (
                        <span className="text-sm text-gray-500">
                          {category.linkCount}개
                        </span>
                      )}
                    </div>
                    {!category.isSystem && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCategory(category.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    카테고리가 없습니다
                  </p>
                )}
              </ul>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  태그 관리
                </h2>
                <Button
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsTagModalOpen(true)}
                >
                  추가
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-gray-500">태그가 없습니다</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                계정 설정
              </h2>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-medium text-red-800 dark:text-red-300">
                  위험 구역
                </h3>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </p>
                <Button
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setIsDeleteAccountOpen(true)}
                  className="mt-4"
                >
                  계정 삭제
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="카테고리 추가"
      >
        <div className="space-y-4">
          <Input
            label="카테고리 이름"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="새 카테고리"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddCategory}>추가</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        title="태그 추가"
      >
        <div className="space-y-4">
          <Input
            label="태그 이름"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="새 태그"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsTagModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddTag}>추가</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
        title="계정 삭제"
        message="정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
}
