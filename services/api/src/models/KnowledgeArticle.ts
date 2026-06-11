import mongoose, { Document, Schema } from 'mongoose';

export interface IKnowledgeArticle extends Document {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  relatedEquipmentTypes: string[];
  author: string;
  published: boolean;
}

const KnowledgeArticleSchema = new Schema<IKnowledgeArticle>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    relatedEquipmentTypes: [{ type: String, trim: true }],
    author: { type: String, required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

KnowledgeArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const KnowledgeArticle = mongoose.model<IKnowledgeArticle>(
  'KnowledgeArticle',
  KnowledgeArticleSchema
);
