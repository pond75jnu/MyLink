import { memo } from 'react';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const Spinner = memo(function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin text-indigo-600 ${sizeStyles[size]} ${className}`}
      aria-label="로딩 중"
    />
  );
});

export { Spinner };
export type { SpinnerProps, SpinnerSize };
