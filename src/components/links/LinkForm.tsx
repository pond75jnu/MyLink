import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Check, X, Plus } from 'lucide-react';
import type { Link, CreateLinkInput, UpdateLinkInput } from '../../types';
import type { Category } from '../../types/category';
import type { Tag } from '../../types/tag';
import type { LinkAnalysis } from '../../services/ai.service';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';

const createLinkSchema = z.object({
  url: z.string().url('유효한 URL을 입력해주세요'),
  category: z.string().min(1, '카테고리를 입력해주세요').max(100, '카테고리는 100자 이내로 입력해주세요'),
  customTitle: z.string().min(1, '주제를 입력해주세요').max(200, '주제는 200자 이내로 입력해주세요'),
  customMemo: z.string().min(1, '메모를 입력해주세요').max(1000, '메모는 1000자 이내로 입력해주세요'),
});

const updateLinkSchema = z.object({
  customTitle: z.string().max(200, '제목은 200자 이내로 입력해주세요').optional(),
  customSummary: z.string().max(500, '요약은 500자 이내로 입력해주세요').optional(),
  customMemo: z.string().max(1000, '메모는 1000자 이내로 입력해주세요').optional(),
  categoryId: z.string().optional(),
});

type CreateFormData = z.infer<typeof createLinkSchema>;
type UpdateFormData = z.infer<typeof updateLinkSchema>;

interface LinkFormBaseProps {
  categories: Category[];
  tags: Tag[];
  linkTags?: Tag[];
  analysis?: LinkAnalysis | null;
  isAnalyzing?: boolean;
  onCancel: () => void;
  onAddTag?: (tagName: string) => Promise<Tag | undefined>;
  onToggleLinkTag?: (tagId: string) => void;
}

interface CreateLinkFormProps extends LinkFormBaseProps {
  mode: 'create';
  link?: never;
  onAnalyze?: (url: string) => Promise<void>;
  onSubmit: (data: CreateLinkInput) => Promise<void>;
}

interface EditLinkFormProps extends LinkFormBaseProps {
  mode: 'edit';
  link: Link;
  onAnalyze?: never;
  onSubmit: (data: UpdateLinkInput) => Promise<void>;
}

type LinkFormProps = CreateLinkFormProps | EditLinkFormProps;

function CreateLinkForm({
  analysis,
  isAnalyzing = false,
  onAnalyze,
  onSubmit,
  onCancel,
}: Omit<CreateLinkFormProps, 'mode' | 'tags' | 'linkTags' | 'onAddTag' | 'onToggleLinkTag' | 'categories'>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<CreateFormData>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      url: '',
      category: '',
      customTitle: '',
      customMemo: '',
    },
  });

  const url = watch('url');
  const canAnalyze = url && z.string().url().safeParse(url).success;

  useEffect(() => {
    if (analysis) {
      const currentTitle = getValues('customTitle');
      const currentMemo = getValues('customMemo');
      const currentCategory = getValues('category');
      
      if (!currentTitle) {
        setValue('customTitle', analysis.title);
      }
      
      if (!currentMemo) {
        setValue('customMemo', analysis.summary);
      }
      
      if (!currentCategory) {
        setValue('category', analysis.categorySuggestion);
      }
    }
  }, [analysis, setValue, getValues]);

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze || !onAnalyze) return;
    await onAnalyze(url);
  }, [canAnalyze, url, onAnalyze]);

  const handleFormSubmit = async (data: CreateFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        url: data.url,
        category: data.category,
        customTitle: data.customTitle,
        customMemo: data.customMemo,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="URL"
              placeholder="https://example.com/article"
              {...register('url')}
              error={errors.url?.message}
            />
          </div>
          <div className="pt-6">
            <Button
              type="button"
              variant="secondary"
              icon={isAnalyzing ? <Spinner size="sm" /> : <Sparkles className="w-4 h-4" />}
              disabled={!canAnalyze || isAnalyzing}
              onClick={handleAnalyze}
            >
              AI 분석
            </Button>
          </div>
        </div>
      </div>

      {analysis ? (
        <div className="bg-indigo-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-medium">
            <Sparkles className="w-4 h-4" />
            AI 분석 결과
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">제목:</span>{' '}
              <span className="text-gray-900">{analysis.title}</span>
            </div>
            <div>
              <span className="text-gray-500">요약:</span>{' '}
              <span className="text-gray-900">{analysis.summary}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-gray-500">키워드:</span>
              {analysis.keywords.map((keyword, i) => (
                <Badge key={i} size="sm" color="indigo">
                  {keyword}
                </Badge>
              ))}
            </div>
            <div>
              <span className="text-gray-500">추천 카테고리:</span>{' '}
              <Badge size="sm" color="purple">{analysis.categorySuggestion}</Badge>
            </div>
          </div>
        </div>
      ) : null}

      <Input
        label="주제"
        placeholder="링크의 주제를 입력하세요"
        {...register('customTitle')}
        error={errors.customTitle?.message}
        helperText="AI 분석 시 자동으로 입력됩니다 (필수)"
        required
      />

      <Input
        label="카테고리"
        placeholder="카테고리를 입력하세요"
        {...register('category')}
        error={errors.category?.message}
        helperText="AI 분석 시 자동으로 입력됩니다 (필수)"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메모 <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          rows={3}
          placeholder="개인 메모를 입력하세요"
          required
          {...register('customMemo')}
        />
        {errors.customMemo?.message ? (
          <p className="mt-1 text-sm text-red-600">{errors.customMemo?.message}</p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">AI 분석 시 요약 내용이 자동으로 입력됩니다 (필수)</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          취소
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          icon={<Check className="w-4 h-4" />}
        >
          저장
        </Button>
      </div>
    </form>
  );
}

function EditLinkForm({
  link,
  categories,
  tags,
  linkTags = [],
  onSubmit,
  onCancel,
  onAddTag,
  onToggleLinkTag,
}: Omit<EditLinkFormProps, 'mode' | 'analysis' | 'isAnalyzing'>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateLinkSchema),
    defaultValues: {
      customTitle: link.customTitle || '',
      customSummary: link.customSummary || '',
      customMemo: link.customMemo || '',
      categoryId: link.categoryId || '',
    },
  });

  const handleFormSubmit = async (data: UpdateFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        customTitle: data.customTitle || undefined,
        customSummary: data.customSummary || undefined,
        customMemo: data.customMemo || undefined,
        categoryId: data.categoryId || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !linkTags.some((lt) => lt.id === tag.id)
  );

  const handleTagInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim() && onAddTag) {
        const newTag = await onAddTag(tagInput.trim());
        if (newTag && onToggleLinkTag) {
          onToggleLinkTag(newTag.id);
        }
        setTagInput('');
        setShowTagSuggestions(false);
      }
    }
  };

  const handleTagSelect = (tag: Tag) => {
    onToggleLinkTag?.(tag.id);
    setTagInput('');
    setShowTagSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <Input
        label="제목"
        placeholder={link.aiTitle || link.originalTitle || '제목 입력'}
        {...register('customTitle')}
        error={errors.customTitle?.message}
        helperText="비워두면 AI 분석 제목 또는 원본 제목이 사용됩니다"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          rows={3}
          placeholder={link.aiSummary || '요약 입력'}
          {...register('customSummary')}
        />
        {errors.customSummary?.message ? (
          <p className="mt-1 text-sm text-red-600">{errors.customSummary?.message}</p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">비워두면 AI 분석 요약이 사용됩니다</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          {...register('categoryId')}
        >
          <option value="">카테고리 없음</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          rows={3}
          placeholder="개인 메모를 입력하세요"
          {...register('customMemo')}
        />
        {errors.customMemo?.message ? (
          <p className="mt-1 text-sm text-red-600">{errors.customMemo?.message}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {linkTags.map((tag) => (
            <Badge
              key={tag.id}
              size="sm"
              className="cursor-pointer hover:opacity-80"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => onToggleLinkTag?.(tag.id)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="relative">
          <Input
            placeholder="태그 입력 후 Enter"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setShowTagSuggestions(true);
            }}
            onKeyDown={handleTagInputKeyDown}
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
            rightIcon={<Plus className="w-4 h-4" />}
          />
          {showTagSuggestions && filteredTags.length > 0 ? (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => handleTagSelect(tag)}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  <span className="text-xs text-gray-400 ml-auto">
                    ({tag.usageCount})
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          취소
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          icon={<Check className="w-4 h-4" />}
        >
          수정
        </Button>
      </div>
    </form>
  );
}

function LinkForm(props: LinkFormProps) {
  if (props.mode === 'create') {
    return (
      <CreateLinkForm
        analysis={props.analysis}
        isAnalyzing={props.isAnalyzing}
        onAnalyze={props.onAnalyze}
        onSubmit={props.onSubmit}
        onCancel={props.onCancel}
      />
    );
  }

  return (
    <EditLinkForm
      link={props.link}
      categories={props.categories}
      tags={props.tags}
      linkTags={props.linkTags}
      onSubmit={props.onSubmit}
      onCancel={props.onCancel}
      onAddTag={props.onAddTag}
      onToggleLinkTag={props.onToggleLinkTag}
    />
  );
}

export { LinkForm };
export type { LinkFormProps };
