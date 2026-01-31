import { useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../../lib/validations';
import { login } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth.store';

export function LoginForm() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(
    (data: LoginFormData) => {
      startTransition(async () => {
        const result = await login(data);

        if (result.success && result.data) {
          loginStore(result.data.user, result.data.session);
          toast.success('로그인되었습니다.');
          navigate('/');
        } else {
          const errorMessage = result.error?.message ?? '로그인에 실패했습니다.';
          setError('root', { message: errorMessage });
          toast.error(errorMessage);
        }
      });
    },
    [loginStore, navigate, setError]
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">로그인</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          계정에 로그인하세요
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이메일
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="이메일을 입력하세요"
            />
          </div>
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            비밀번호
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

        {errors.root ? (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          {isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="text-center space-y-2">
        <Link to="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          비밀번호를 잊으셨나요?
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
