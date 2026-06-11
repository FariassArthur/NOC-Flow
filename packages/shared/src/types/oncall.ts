export type WeekDay = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export interface OnCallShift {
  _id?: string;
  name: string;
  description?: string;
  department: string;
  weekDays: WeekDay[];
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  userIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
