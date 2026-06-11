export interface KnowledgeArticle {
  _id?: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  relatedEquipmentTypes: string[];
  author: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
