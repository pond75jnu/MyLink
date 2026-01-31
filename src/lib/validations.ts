import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
    email: z.string().email('유효한 이메일을 입력하세요'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다')
      .regex(/[a-z]/, '소문자를 포함해야 합니다')
      .regex(/[A-Z]/, '대문자를 포함해야 합니다')
      .regex(/[0-9]/, '숫자를 포함해야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

export const linkSchema = z.object({
  url: z.string().url('유효한 URL을 입력하세요'),
  title: z.string().min(1, '제목을 입력하세요').max(200, '제목은 200자 이하여야 합니다'),
  description: z.string().max(500, '설명은 500자 이하여야 합니다').optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, '카테고리 이름을 입력하세요').max(50, '이름은 50자 이하여야 합니다'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '유효한 색상 코드를 입력하세요')
    .optional(),
  icon: z.string().max(50).optional(),
  parentId: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LinkFormData = z.infer<typeof linkSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
