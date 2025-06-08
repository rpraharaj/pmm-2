export interface PlanPhase {
  startDate: string;
  endDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  notes?: string;
  assignedTo?: string;
}

export interface PlanPhases {
  requirements?: PlanPhase;
  design?: PlanPhase;
  development: PlanPhase;
  cst: PlanPhase;
  uat: PlanPhase;
}

export interface PlanApproval {
  approvedBy: string;
  approvedAt: string;
  comments?: string;
}

export interface PlanHistory {
  id: string;
  timestamp: string;
  action: 'created' | 'updated' | 'approved' | 'status-changed';
  userId: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface Plan {
  id: string;
  capabilityId: string;
  type: 'aspirational' | 'implementation';
  version: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed';
  phases: PlanPhases;
  metadata: {
    createdBy: string;
    lastUpdatedBy: string;
  };
  approval?: PlanApproval;
  history: PlanHistory[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
}

export interface Notification {
  id: string;
  type: 'plan-created' | 'plan-updated' | 'plan-approved' | 'phase-started' | 'phase-completed';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  metadata: {
    planId?: string;
    capabilityId?: string;
    phase?: string;
  };
}
