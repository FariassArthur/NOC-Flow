import type { TimeTracking, RCA, CommLogEntry } from './noc';

export type OccurrenceStatus = 'aberta' | 'em_execucao' | 'finalizada';
export type Priority = 'baixa' | 'média' | 'alta' | 'crítica';

export interface Comment {
  _id?: string;
  author: string;
  text: string;
  createdAt: Date;
}

export interface Attachment {
  _id?: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface HistoryEntry {
  _id?: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: Date;
}

export interface ChecklistItem {
  _id?: string;
  text: string;
  done: boolean;
  doneBy?: string;
  doneAt?: Date;
}

export interface Occurrence {
  _id?: string;

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
  checklist?: ChecklistItem[];
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
