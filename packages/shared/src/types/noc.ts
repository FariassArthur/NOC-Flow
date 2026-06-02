export interface Category {
  _id?: string;
  name: string;
  description?: string;
  slaResponseMinutes?: number;
  slaResolutionMinutes?: number;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Equipment {
  _id?: string;
  name: string;
  type: 'roteador' | 'switch' | 'firewall' | 'link' | 'servidor' | 'outro';
  ip?: string;
  brand?: string;
  model?: string;
  location?: string;
  department?: string;
  status: 'ativo' | 'inativo' | 'manutencao';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Service {
  _id?: string;
  name: string;
  type: 'internet' | 'mpls' | 'voip' | 'vpn' | 'datacenter' | 'outro';
  provider?: string;
  contract?: string;
  bandwidth?: string;
  status: 'ativo' | 'inativo';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Runbook {
  _id?: string;
  title: string;
  category?: string;
  priority?: string;
  steps: { order: number; description: string }[];
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EscalationRule {
  _id?: string;
  name: string;
  priority: string;
  triggerType: 'sla_breach' | 'time_passed';
  triggerMinutes: number;
  targetRole?: string;
  targetDepartment?: string;
  notifyAlso?: string[];
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimeTracking {
  startTime?: Date;
  endTime?: Date;
  pausedMinutes: number;
  status: 'stopped' | 'running' | 'paused';
}

export interface RCA {
  causaRaiz: string;
  tipo: 'hardware' | 'software' | 'provedor' | 'humano' | 'outro';
  impacto: string;
  acoesPreventivas?: string;
}

export interface CommLogEntry {
  _id?: string;
  contactName: string;
  contactType: 'provedor' | 'cliente' | 'fornecedor' | 'interno';
  description: string;
  createdAt?: Date;
}
