export interface Category {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  linkCount?: number;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
}
