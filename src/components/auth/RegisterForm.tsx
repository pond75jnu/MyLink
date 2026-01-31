import { useTransition, useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '../../lib/validations';
import { register as registerUser } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth.store';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: '약함', color: 'bg-red-500' };
  if (score <= 4) return { score, label: '보통', color: 'bg-yellow-500' };
  return { score, label: '강함', color: 'bg-green-500' };
}

export function RegisterForm() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = useWatch({ control, name: 'password' });
  const passwordStrength = useMemo(() => getPasswordStrength(password || ''), [password]);

  const onSubmit = useCallback(
    (data: RegisterFormData) => {
      startTransition(async () => {
        const result = await registerUser({
          email: data.email,
          password: data.password,
          name: data.name,
        });

        if (result.success && result.data) {
          loginStore(result.data.user, result.data.session);
          toast.success('회원가입이 완료되었습니다.');
          navigate('/');
        } else if (result.error?.code === 'PENDING_APPROVAL') {
          toast.success(result.error.message, { duration: 5000 });
          navigate('/login');
        } else {
          const errorMessage = result.error?.message ?? '회원가입에 실패했습니다.';
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">회원가입</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          새 계정을 만들어 시작하세요
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이름
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="이름을 입력하세요"
            />
          </div>
          {errors.name ? (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          ) : null}
        </div>

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

          {password ? (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{passwordStrength.label}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                8자 이상, 대소문자, 숫자 포함
              </p>
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            비밀번호 확인
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
            <UserPlus className="w-5 h-5" />
          )}
          {isPending ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          로그인
        </Link>
      </p>
    </div>
  );
}
