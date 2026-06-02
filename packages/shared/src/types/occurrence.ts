import { ObjectId } from 'mongodb';

export type OccurrenceStatus = 'aberta' | 'em_execucao' | 'finalizada';
export type Priority = 'baixa' | 'média' | 'alta' | 'crítica';

export interface Comment {
  _id?: ObjectId | string;
  author: string; // user ID
  text: string;
  createdAt: Date;
}

export interface Attachment {
  _id?: ObjectId | string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface HistoryEntry {
  _id?: ObjectId | string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string; // user ID
  changedAt: Date;
}

export interface Occurrence {
  _id?: ObjectId | string;

  // BÁSICO
  title: string;
  description: string;
  status: OccurrenceStatus;
  createdAt: Date;

  // ATRIBUIÇÃO
  assignedTo?: string; // user ID
  priority: Priority;
  tags: string[];

  // SLA & HISTÓRICO
  dueDate?: Date;
  timeSpentMinutes: number;
  createdBy: string; // user ID

  // CORRETIVAS (preenchido pelo NOC)
  resolucao?: string;
  resolvidoPor?: string; // user ID
  resolvidoEm?: Date;

  // COMPLETO
  comments: Comment[];
  attachments: Attachment[];
  history: HistoryEntry[];

  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
