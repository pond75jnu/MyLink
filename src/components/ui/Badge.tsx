import { memo, type ReactNode, type CSSProperties } from 'react';

type BadgeColor = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
  style?: CSSProperties;
}

const colorStyles: Record<BadgeColor, string> = {
  gray: 'bg-gray-100 text-gray-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

const Badge = memo(function Badge({
  children,
  color = 'gray',
  size = 'md',
  className = '',
  style,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${colorStyles[color]}
        ${sizeStyles[size]}
        ${className}
      `}
      style={style}
    >
      {children}
    </span>
  );
});

export { Badge };
export type { BadgeProps, BadgeColor, BadgeSize };
