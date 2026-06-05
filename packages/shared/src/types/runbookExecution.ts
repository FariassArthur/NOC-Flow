export interface StepExecution {
  order: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

export interface RunbookExecution {
  _id?: string;
  runbookId: string;
  runbookTitle: string;
  occurrenceId?: string;
  startedBy: string;
  startedByName?: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'cancelled';
  steps: StepExecution[];
  currentStep: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
