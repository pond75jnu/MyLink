import { useState, useEffect, useMemo, useCallback } from 'react';
import { Shield, Users, Check, X, Trash2, Search } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export function AdminPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, email_verified, is_active, created_at, last_login_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('사용자 목록을 불러오는데 실패했습니다.');
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(query) ||
        u.name.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from('users')
      .update({ is_active: true, email_verified: true })
      .eq('id', userId);

    if (error) {
      toast.error('승인에 실패했습니다.');
    } else {
      toast.success('사용자가 승인되었습니다.');
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: true, email_verified: true } : u
        )
      );
    }
    setActionLoading(null);
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId);

    if (error) {
      toast.error('거부에 실패했습니다.');
    } else {
      toast.success('사용자가 거부되었습니다.');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u))
      );
    }
    setActionLoading(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setActionLoading(userId);
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      toast.error('삭제에 실패했습니다.');
    } else {
      toast.success('사용자가 삭제되었습니다.');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setActionLoading(null);
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionLoading(userId);
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error('권한 변경에 실패했습니다.');
    } else {
      toast.success(`사용자 권한이 ${newRole === 'admin' ? '관리자' : '일반'}로 변경되었습니다.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as 'user' | 'admin' } : u))
      );
    }
    setActionLoading(null);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <EmptyState
          icon={<Shield className="w-12 h-12 text-red-400" />}
          title="접근 권한이 없습니다"
          description="관리자만 이 페이지에 접근할 수 있습니다."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          관리자 대시보드
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">전체 사용자</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <Check className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u) => u.is_active).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">활성 사용자</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u) => u.role === 'admin').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">관리자</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              사용자 관리
            </h2>
            <div className="w-64">
              <Input
                placeholder="이름 또는 이메일 검색..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  권한
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {u.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {u.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {u.role === 'admin' ? '관리자' : '사용자'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      }`}
                    >
                      {u.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {u.id !== currentUser?.id && (
                        <>
                          {!u.is_active && (
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={<Check className="w-3 h-3" />}
                              onClick={() => handleApprove(u.id)}
                              loading={actionLoading === u.id}
                            >
                              승인
                            </Button>
                          )}
                          {u.is_active && (
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={<X className="w-3 h-3" />}
                              onClick={() => handleReject(u.id)}
                              loading={actionLoading === u.id}
                            >
                              거부
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<Shield className="w-3 h-3" />}
                            onClick={() => handleToggleAdmin(u.id, u.role)}
                            loading={actionLoading === u.id}
                          >
                            {u.role === 'admin' ? '관리자 해제' : '관리자 지정'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<Trash2 className="w-3 h-3" />}
                            onClick={() => handleDelete(u.id)}
                            loading={actionLoading === u.id}
                          >
                            삭제
                          </Button>
                        </>
                      )}
                      {u.id === currentUser?.id && (
                        <span className="text-xs text-gray-400">현재 사용자</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
}
