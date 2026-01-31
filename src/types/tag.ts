export interface Tag {
  id: string;
  userId: string;
  name: string;
  slug: string;
  color: string;
  usageCount: number;
  createdAt: string;
}

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface LinkTag {
  linkId: string;
  tagId: string;
  createdAt: string;
}
