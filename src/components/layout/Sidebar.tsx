import { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Link2,
  Star,
  Archive,
  FolderOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Tag,
  Hash,
} from 'lucide-react';
import { useUIStore } from '../../stores/ui.store';
import { useCategoryStore } from '../../stores/category.store';
import { useTagStore } from '../../stores/tag.store';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  collapsed: boolean;
}

function NavItem({ to, icon, label, count, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`
      }
    >
      {icon}
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {count !== undefined && (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { categories } = useCategoryStore();
  const tags = useTagStore((state) => state.tags);
  const popularTags = useMemo(
    () => [...tags].sort((a, b) => b.usageCount - a.usageCount).slice(0, 8),
    [tags]
  );

  const navItems = [
    { to: '/links', icon: <Link2 className="h-5 w-5" />, label: '모든 링크' },
    { to: '/favorites', icon: <Star className="h-5 w-5" />, label: '즐겨찾기' },
    { to: '/archive', icon: <Archive className="h-5 w-5" />, label: '아카이브' },
  ];

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 lg:static lg:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {!collapsed && (
            <>
              <div className="mt-6">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    카테고리
                  </span>
                  <button
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    title="카테고리 추가"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-1 space-y-1">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <NavLink
                        key={category.id}
                        to={`/categories/${category.slug}`}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          }`
                        }
                      >
                        <FolderOpen
                          className="h-4 w-4"
                          style={{ color: category.color }}
                        />
                        <span className="flex-1 truncate">{category.name}</span>
                        {category.linkCount !== undefined && (
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            {category.linkCount}
                          </span>
                        )}
                      </NavLink>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      카테고리가 없습니다
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center px-3 py-2">
                  <Tag className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    태그
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap gap-2 px-3">
                  {popularTags.length > 0 ? (
                    popularTags.map((tag) => (
                      <NavLink
                        key={tag.id}
                        to={`/tags/${tag.slug}`}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          location.pathname === `/tags/${tag.slug}`
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        style={{
                          borderLeft: `3px solid ${tag.color}`,
                        }}
                      >
                        <Hash className="h-3 w-3" />
                        {tag.name}
                      </NavLink>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      태그가 없습니다
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="hidden border-t border-gray-200 p-2 dark:border-gray-800 lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
