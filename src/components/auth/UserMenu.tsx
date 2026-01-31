import { useState, useRef, useEffect, useCallback, useTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.store';
import { logout as logoutService } from '../../services/auth.service';

export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout: logoutStore } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = useCallback(() => {
    startTransition(async () => {
      const result = await logoutService();
      if (result.success) {
        logoutStore();
        toast.success('로그아웃되었습니다.');
        navigate('/login');
      } else {
        toast.error('로그아웃에 실패했습니다.');
      }
    });
  }, [logoutStore, navigate]);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
      >
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <User className="w-4 h-4" />
              프로필
            </Link>
            <Link
              to="/settings"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <Settings className="w-4 h-4" />
              설정
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {isPending ? '로그아웃 중...' : '로그아웃'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
