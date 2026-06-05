import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  type: 'internet' | 'mpls' | 'voip' | 'vpn' | 'datacenter' | 'outro';
  provider?: string;
  contract?: string;
  bandwidth?: string;
  status: 'ativo' | 'inativo';
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['internet', 'mpls', 'voip', 'vpn', 'datacenter', 'outro'],
      required: true,
    },
    provider: { type: String, trim: true },
    contract: { type: String, trim: true },
    bandwidth: { type: String, trim: true },
    status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
  },
  { timestamps: true }
);

export const Service = mongoose.model<IService>('Service', ServiceSchema);
