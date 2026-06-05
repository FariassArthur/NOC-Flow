import mongoose, { Document, Schema } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  type: 'roteador' | 'switch' | 'firewall' | 'link' | 'servidor' | 'outro';
  ip?: string;
  brand?: string;
  equipmentModel?: string;
  location?: string;
  department?: string;
  status: 'ativo' | 'inativo' | 'manutencao';
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['roteador', 'switch', 'firewall', 'link', 'servidor', 'outro'],
      required: true,
    },
    ip: { type: String, trim: true },
    brand: { type: String, trim: true },
    equipmentModel: { type: String, trim: true },
    location: { type: String, trim: true },
    department: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'manutencao'],
      default: 'ativo',
    },
  },
  { timestamps: true }
);

export const Equipment = mongoose.model<IEquipment>('Equipment', EquipmentSchema);
