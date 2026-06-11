export interface OccurrenceTemplate {
  _id?: string;
  name: string;
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  service?: string;
  equipment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
