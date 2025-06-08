import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Plan, PlanPhase, PlanHistory, User, Notification } from './types';

export interface Capability {
  id: string;
  name: string;
  workstream: string;
  workstreamLead: {
    name: string;
    avatar?: string;
  };
  sme: string;
  ba: string;
  technicalMilestone?: {
    id: string;
    name: string;
    date: string;
  };
  businessMilestone?: {
    id: string;
    name: string;
    date: string;
  };
  status: string;
  rag: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  type: 'technical' | 'business';
  description: string;
  status: string;
}

interface ProjectStore {
  capabilities: Capability[];
  milestones: Milestone[];
  plans: Plan[];
  users: User[];
  notifications: Notification[];
  currentUser: string;

  // Capability Actions
  addCapability: (capability: Omit<Capability, 'id'>) => void;
  updateCapability: (id: string, capability: Partial<Capability>) => void;
  deleteCapability: (id: string) => void;
  
  // Milestone Actions
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, milestone: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  
  // Plan Actions
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'history' | 'metadata'>) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  approvePlan: (id: string, approverUserId: string, comments?: string) => void;
  updatePlanPhase: (planId: string, phase: keyof PlanPhase, updates: Partial<PlanPhase>) => void;
  
  // Plan Queries
  getCapabilityPlans: (capabilityId: string) => Plan[];
  getLatestPlan: (capabilityId: string, type: 'aspirational' | 'implementation') => Plan | undefined;
  getPlanHistory: (planId: string) => (PlanHistory & { planName: string })[];
  comparePlans: (planId1: string, planId2: string) => { added: string[], removed: string[], changed: string[] };
  
  // User & Notification Actions
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Data Selectors
  getCapabilitiesStats: () => {
    total: number;
    inProgress: number;
    completed: number;
    atRisk: number;
  };
  getRecentActivity: () => (PlanHistory & { planName: string })[];
  getUpcomingDeliveries: () => {
    id: string;
    capability: string;
    phase: string;
    dueDate: string;
    assignedTo: string;
  }[];
  getGanttData: () => {
    id: string;
    capability: string;
    phases: {
      phase: string;
      start: string;
      end: string;
      progress: number;
      status: string;
    }[];
  }[];
  getUnreadNotifications: () => Notification[];
  getAssignedPhases: (userId: string) => {
    planId: string;
    capabilityId: string;
    phase: string;
    startDate: string;
    endDate: string;
    status: string;
  }[];
  getUsageCount: (milestoneId: string) => number;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  capabilities: [
    {
      id: '1',
      name: 'Customer Portal Enhancement',
      workstream: 'Frontend Development',
      workstreamLead: { name: 'Sarah Chen', avatar: '/avatars/sarah.jpg' },
      sme: 'Mike Johnson',
      ba: 'Lisa Wang',
      technicalMilestone: { id: '1', name: 'UI Framework Complete', date: 'Jan 20, 2025' },
      businessMilestone: { id: '1', name: 'User Acceptance', date: 'Feb 15, 2025' },
      status: 'In Progress',
      rag: 'Amber',
      notes: 'UI framework development on track'
    }
  ],
  milestones: [
    {
      id: '1',
      name: 'API Development Complete',
      date: '2025-02-15',
      type: 'technical',
      description: 'Core API endpoints development and testing completed',
      status: 'In Progress'
    }
  ],
  plans: [],
  users: [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      role: 'manager',
      avatar: '/avatars/sarah.jpg'
    },
    {
      id: '2',
      name: 'David Rodriguez',
      email: 'david.rodriguez@example.com',
      role: 'user',
      avatar: '/avatars/david.jpg'
    }
  ],
  notifications: [],
  currentUser: '1',

  // Capability Actions
  addCapability: (capability) => set((state) => ({
    capabilities: [...state.capabilities, { ...capability, id: uuidv4() }]
  })),

  updateCapability: (id, capability) => set((state) => ({
    capabilities: state.capabilities.map((c) =>
      c.id === id ? { ...c, ...capability } : c
    )
  })),

  deleteCapability: (id) => set((state) => ({
    capabilities: state.capabilities.filter((c) => c.id !== id)
  })),

  // Milestone Actions
  addMilestone: (milestone) => set((state) => ({
    milestones: [...state.milestones, { ...milestone, id: uuidv4() }]
  })),

  updateMilestone: (id, milestone) => set((state) => ({
    milestones: state.milestones.map((m) =>
      m.id === id ? { ...m, ...milestone } : m
    )
  })),

  deleteMilestone: (id) => set((state) => ({
    milestones: state.milestones.filter((m) => m.id !== id)
  })),

  // Plan Actions
  addPlan: (plan) => {
    const now = new Date().toISOString();
    const newPlan: Plan = {
      ...plan,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      status: 'draft',
      history: [],
      metadata: {
        createdBy: get().currentUser,
        lastUpdatedBy: get().currentUser
      }
    };
    set((state) => ({
      plans: [...state.plans, newPlan]
    }));
  },

  updatePlan: (id, plan) => set((state) => {
    const now = new Date().toISOString();
    const currentUser = get().currentUser;
    
    return {
      plans: state.plans.map((p) => {
        if (p.id !== id) return p;
        
        const updatedPlan = { ...p, ...plan, updatedAt: now };
        updatedPlan.metadata.lastUpdatedBy = currentUser;
        updatedPlan.history.push({
          id: uuidv4(),
          timestamp: now,
          action: 'updated',
          userId: currentUser,
          changes: Object.entries(plan).map(([field, value]) => ({
            field,
            oldValue: p[field as keyof Plan],
            newValue: value
          }))
        });
        
        return updatedPlan;
      })
    };
  }),

  deletePlan: (id) => set((state) => ({
    plans: state.plans.filter((p) => p.id !== id)
  })),

  approvePlan: (id, approverUserId, comments) => set((state) => {
    const now = new Date().toISOString();
    return {
      plans: state.plans.map((p) => {
        if (p.id !== id) return p;
        
        const updatedPlan = {
          ...p,
          status: 'active' as const,
          updatedAt: now,
          approval: {
            approvedBy: approverUserId,
            approvedAt: now,
            comments
          }
        };
        
        updatedPlan.history.push({
          id: uuidv4(),
          timestamp: now,
          action: 'approved',
          userId: approverUserId,
          changes: [{
            field: 'status',
            oldValue: p.status,
            newValue: 'active'
          }]
        });
        
        return updatedPlan;
      })
    };
  }),

  updatePlanPhase: (planId, phase, updates) => set((state) => {
    const now = new Date().toISOString();
    const currentUser = get().currentUser;
    
    return {
      plans: state.plans.map((p) => {
        if (p.id !== planId) return p;
        
        const updatedPlan = {
          ...p,
          updatedAt: now,
          phases: {
            ...p.phases,
            [phase]: { ...p.phases[phase], ...updates }
          }
        };
        
        updatedPlan.history.push({
          id: uuidv4(),
          timestamp: now,
          action: 'updated',
          userId: currentUser,
          changes: [{
            field: `phases.${phase}`,
            oldValue: p.phases[phase],
            newValue: updatedPlan.phases[phase]
          }]
        });
        
        return updatedPlan;
      })
    };
  }),

  // Plan Queries
  getCapabilityPlans: (capabilityId) => {
    const { plans } = get();
    return plans.filter((p) => p.capabilityId === capabilityId);
  },

  getLatestPlan: (capabilityId, type) => {
    const { plans } = get();
    return plans
      .filter((p) => p.capabilityId === capabilityId && p.type === type)
      .sort((a, b) => b.version - a.version)[0];
  },

  getPlanHistory: (planId) => {
    const { plans, capabilities } = get();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return [];
    
    const capability = capabilities.find(c => c.id === plan.capabilityId);
    return plan.history.map(h => ({ ...h, planName: capability?.name || 'Unknown Plan' }));
  },

  comparePlans: (planId1, planId2) => {
    const { plans } = get();
    const plan1 = plans.find(p => p.id === planId1);
    const plan2 = plans.find(p => p.id === planId2);
    if (!plan1 || !plan2) return { added: [], removed: [], changed: [] };
    
    const changes = {
      added: [] as string[],
      removed: [] as string[],
      changed: [] as string[]
    };
    
    // Compare phases
    const phases = ['requirements', 'design', 'development', 'cst', 'uat'] as const;
    phases.forEach(phase => {
      const phase1 = plan1.phases[phase];
      const phase2 = plan2.phases[phase];
      
      if (!phase1 && phase2) changes.added.push(`${phase}`);
      else if (phase1 && !phase2) changes.removed.push(`${phase}`);
      else if (phase1 && phase2) {
        if (phase1.startDate !== phase2.startDate) changes.changed.push(`${phase}.startDate`);
        if (phase1.endDate !== phase2.endDate) changes.changed.push(`${phase}.endDate`);
        if (phase1.status !== phase2.status) changes.changed.push(`${phase}.status`);
      }
    });
    
    return changes;
  },

  // User & Notification Actions
  addUser: (user) => set((state) => ({
    users: [...state.users, { ...user, id: uuidv4() }]
  })),

  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((u) =>
      u.id === id ? { ...u, ...updates } : u
    )
  })),

  addNotification: (notification) => {
    const now = new Date().toISOString();
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      createdAt: now,
      read: false
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));
  },

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
  })),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  })),

  // Data Selectors
  getCapabilitiesStats: () => {
    const { capabilities } = get();
    return {
      total: capabilities.length,
      inProgress: capabilities.filter(c => c.status === 'In Progress').length,
      completed: capabilities.filter(c => c.status === 'Completed').length,
      atRisk: capabilities.filter(c => c.status === 'At Risk').length
    };
  },

  getRecentActivity: () => {
    const { plans, capabilities } = get();
    return plans.flatMap(plan => {
      const capability = capabilities.find(c => c.id === plan.capabilityId);
      return plan.history.map(h => ({
        ...h,
        planName: capability?.name || 'Unknown Plan'
      }));
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  getUpcomingDeliveries: () => {
    const { plans, capabilities } = get();
    const now = new Date();
    
    return plans.flatMap(plan => {
      const capability = capabilities.find(c => c.id === plan.capabilityId);
      if (!capability) return [];
      
      return Object.entries(plan.phases).map(([phase, data]) => {
        if (!data) return null;
        const endDate = new Date(data.endDate);
        if (endDate < now) return null;
        
        return {
          id: `${plan.id}-${phase}`,
          capability: capability.name,
          phase,
          dueDate: data.endDate,
          assignedTo: data.assignedTo || ''
        };
      }).filter((delivery): delivery is NonNullable<typeof delivery> => delivery !== null);
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },

  getGanttData: () => {
    const { plans, capabilities } = get();
    return plans.map(plan => {
      const capability = capabilities.find(c => c.id === plan.capabilityId);
      if (!capability) return null;
      
      const phases = Object.entries(plan.phases).map(([phase, data]) => {
        if (!data) return null;
        return {
          phase,
          start: data.startDate,
          end: data.endDate,
          progress: data.progress,
          status: data.status
        };
      }).filter((p): p is NonNullable<typeof p> => p !== null);
      
      return {
        id: plan.id,
        capability: capability.name,
        phases
      };
    }).filter((data): data is NonNullable<typeof data> => data !== null);
  },

  getUnreadNotifications: () => {
    const { notifications } = get();
    return notifications.filter(n => !n.read);
  },

  getAssignedPhases: (userId) => {
    const { plans, capabilities } = get();
    return plans.flatMap(plan => {
      const capability = capabilities.find(c => c.id === plan.capabilityId);
      if (!capability) return [];
      
      return Object.entries(plan.phases).map(([phase, data]) => {
        if (!data || data.assignedTo !== userId) return null;
        
        return {
          planId: plan.id,
          capabilityId: capability.id,
          phase,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status
        };
      }).filter((assignment): assignment is NonNullable<typeof assignment> => assignment !== null);
    });
  },

  getUsageCount: (milestoneId) => {
    const { capabilities } = get();
    return capabilities.filter(
      (c) =>
        c.technicalMilestone?.id === milestoneId ||
        c.businessMilestone?.id === milestoneId
    ).length;
  }
}));