import { ObjectId } from 'mongodb';
import type { TimeTracking, RCA, CommLogEntry } from './noc';

export type OccurrenceStatus = 'aberta' | 'em_execucao' | 'finalizada';
export type Priority = 'baixa' | 'média' | 'alta' | 'crítica';

export interface Comment {
  _id?: ObjectId | string;
  author: string;
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
  changedBy: string;
  changedAt: Date;
}

export interface Occurrence {
  _id?: ObjectId | string;

  title: string;
  description: string;
  status: OccurrenceStatus;
  createdAt: Date;

  assignedTo?: string;
  priority: Priority;
  tags: string[];

  dueDate?: Date;
  timeSpentMinutes: number;
  createdBy: string;

  resolucao?: string;
  resolvidoPor?: string;
  resolvidoEm?: Date;

  // NOC fields
  category?: string;
  equipment?: string;
  service?: string;
  timeTracking?: TimeTracking;
  rca?: RCA;
  commLog?: CommLogEntry[];

  slaStatus?: 'dentro' | 'atrasado' | 'violado';
  slaBreachedAt?: Date;

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
