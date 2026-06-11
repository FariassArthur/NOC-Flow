export interface ReportSchedule {
  _id?: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'csv' | 'pdf';
  filters?: Record<string, string>;
  recipients: string[];
  createdBy: string;
  active: boolean;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
