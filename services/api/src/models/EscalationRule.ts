import mongoose, { Document, Schema } from 'mongoose';

export interface IEscalationRule extends Document {
  name: string;
  priority: string;
  triggerType: 'sla_breach' | 'time_passed';
  triggerMinutes: number;
  targetRole?: string;
  targetDepartment?: string;
  notifyAlso?: string[];
  active: boolean;
}

const EscalationRuleSchema = new Schema<IEscalationRule>(
  {
    name: { type: String, required: true, trim: true },
    priority: { type: String, required: true },
    triggerType: {
      type: String,
      enum: ['sla_breach', 'time_passed'],
      required: true,
    },
    triggerMinutes: { type: Number, required: true },
    targetRole: { type: String, trim: true },
    targetDepartment: { type: String, trim: true },
    notifyAlso: [{ type: String, trim: true }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEscalationRule>(
  'EscalationRule',
  EscalationRuleSchema
);
