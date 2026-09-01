import React from 'react';
import { Doctor, RefundItem, AuthorizationItem, AppointmentItem, LeadQuote, LeadNote, QuoteState, AdminUser } from '../../types';

/**
 * Todo lo que las secciones del panel admin pueden necesitar: los campos de
 * ColmedikalContextType que el admin usa + el estado local y los handlers
 * que vivían en AdminPanel.tsx. Cada sección tipa sus props con
 * `Pick<AdminSharedProps, ...>` en vez de redeclarar tipos.
 *
 * Nota: no se pudo usar `ReturnType<typeof useColmedikal>` — ese hook ya
 * infiere `any` en el proyecto (preexistente, no introducido por este
 * cambio), así que los campos del contexto se tipan aquí explícitamente
 * contra ColmedikalContextType en ../../context/ColmedikalContext.tsx.
 */
export interface AdminCtx {
  doctors: Doctor[];
  refunds: RefundItem[];
  appointments: AppointmentItem[];
  authorizations: AuthorizationItem[];
  leads: LeadQuote[];
  admins: AdminUser[];
  login: (email: string, password: string) => Promise<void>;
  addDoctor: (doctor: Doctor) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  toggleDoctorActiveStatus: (id: string) => Promise<void>;
  updateDoctor: (doctor: Doctor) => Promise<void>;
  updateRefundStatus: (id: string, status: RefundItem['status'], comment?: string) => Promise<void>;
  updateAuthorizationStatus: (id: string, status: AuthorizationItem['status'], comment?: string) => Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentItem['status']) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadQuote['status']) => Promise<void>;
  updateClientPaymentStatus: (id: string, paymentStatus: NonNullable<QuoteState['paymentStatus']>) => Promise<void>;
  updateLeadPlan: (id: string, basePlanId: string, selectedPlanName: string, estimatedPrice: number) => Promise<void>;
  setClientContractNumber: (id: string, contractNumber: string) => Promise<void>;
  setClientPassword: (leadId: string, newPassword: string) => Promise<void>;
  addLeadNote: (id: string, note: LeadNote) => void;
  assignLead: (id: string, assignedTo: string) => void;
  setLeadFollowUp: (id: string, followUpDate: string) => void;
  setLeadLostReason: (id: string, lostReason: string) => void;
  deleteLead: (id: string | number) => Promise<void>;
  refreshData: () => Promise<void>;
  addAdmin: (email: string, name: string, role: AdminUser['role'], password?: string) => Promise<void>;
  deleteAdmin: (email: string) => Promise<void>;
  toggleAdminActiveStatus: (email: string) => Promise<void>;
  updateAdminRole: (email: string, role: AdminUser['role']) => Promise<void>;
  seoSettings: Record<string, string>;
  saveSEOSettings: (settings: Record<string, string>) => Promise<void>;
}

export type ActiveTab =
  | 'kpis'
  | 'refunds'
  | 'appointments'
  | 'auths'
  | 'leads'
  | 'clientes'
  | 'doctors'
  | 'admins'
  | 'sitio';

export type SelectedDocument = {
  id: string;
  type: 'refund' | 'auth';
  fullName: string;
  fileName: string;
  date: string;
  amount?: number;
  invoiceNumber?: string;
  procedure?: string;
  facility?: string;
  phone?: string;
  email?: string;
  fileData?: string;
} | null;

export type NewAdminForm = {
  email: string;
  name: string;
  role: 'Super Admin' | 'Mid Admin' | 'Equipo Comercial' | 'Auditor';
  password: string;
};

export type NewDocForm = {
  name: string;
  specialty: string;
  city: string;
  phone: string;
  email: string;
  clinic: string;
  availability: string;
  education: string;
  cost: number;
  image: string;
  nivel: number;
};

export type LeadStatusFilter = 'all' | 'Nuevo Plan' | 'Contactado' | 'Cierre Efectivo' | 'Perdido';

export interface AdminSharedProps extends AdminCtx {
  setCurrentPage: (page: import('../../types').Page) => void;

  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loginError: string;
  isLoggingIn: boolean;
  handleLogin: (e: React.FormEvent) => void;
  handleLogout: () => void;

  selectedDocument: SelectedDocument;
  setSelectedDocument: (v: SelectedDocument) => void;

  activeTab: ActiveTab;
  setActiveTab: (v: ActiveTab) => void;

  maintenanceSaving: boolean;
  setMaintenanceSaving: (v: boolean) => void;

  leadDateFilter: string;
  setLeadDateFilter: (v: string) => void;
  leadStatusFilter: LeadStatusFilter;
  setLeadStatusFilter: (v: LeadStatusFilter) => void;
  leadSourceFilter: string;
  setLeadSourceFilter: (v: string) => void;
  leadSearchFilter: string;
  setLeadSearchFilter: (v: string) => void;

  clientSearchFilter: string;
  setClientSearchFilter: (v: string) => void;
  passwordModalLeadId: string | null;
  setPasswordModalLeadId: (v: string | null) => void;
  newPasswordInput: string;
  setNewPasswordInput: (v: string) => void;
  passwordFieldVisible: boolean;
  setPasswordFieldVisible: React.Dispatch<React.SetStateAction<boolean>>;
  passwordSaveLoading: boolean;
  setPasswordSaveLoading: (v: boolean) => void;
  passwordSaveError: string;
  setPasswordSaveError: (v: string) => void;
  passwordSaveSuccess: string | null;
  setPasswordSaveSuccess: (v: string | null) => void;

  openNoteLeadId: string | null;
  setOpenNoteLeadId: (v: string | null) => void;
  noteText: string;
  setNoteText: (v: string) => void;

  contractEditId: string | null;
  setContractEditId: (v: string | null) => void;
  contractNumberInput: string;
  setContractNumberInput: (v: string) => void;

  newAdmin: NewAdminForm;
  setNewAdmin: (v: NewAdminForm) => void;
  isSubmittingAdmin: boolean;
  adminSuccessMsg: string;
  adminErrorMsg: string;
  handleRegisterAdmin: (e: React.FormEvent) => void;

  currentUserRole: 'Super Admin' | 'Mid Admin' | 'Equipo Comercial' | 'Auditor';
  canSeeTab: (tab: string) => boolean;
  canDeleteLeads: boolean;
  canManageAdmins: boolean;

  resolvePlanName: (l: { quoteData?: { selectedPlanName?: string; basePlanId?: string } }) => string;
  SOURCE_BADGE: Record<string, string>;
  PLAN_CATALOG: Record<string, { name: string; basePrice: number }>;
  handlePlanChange: (leadId: string, basePlanId: string) => void;
  exportLeadsCSV: (clusters: [string, AdminCtx['leads']][]) => void;

  newDoc: NewDocForm;
  setNewDoc: (v: NewDocForm) => void;
  editingDocId: string | null;
  docSuccessMsg: string;
  handleAddDoctor: (e: React.FormEvent) => void;
  handleEditInitiate: (doc: AdminCtx['doctors'][number]) => void;
  handleCancelEdit: () => void;
  avatarGomez: string;
  avatarRestrepo: string;
  avatarDoctorM2: string;
  avatarDoctorF2: string;

  selectedRefundId: string | null;
  setSelectedRefundId: (v: string | null) => void;
  adminComment: string;
  setAdminComment: (v: string) => void;

  pendingRefunds: AdminCtx['refunds'];
  totalRefundAmountPending: number;
  totalLeadsUncontacted: number;
  pendingAuthsCount: number;
  activeAppointmentsCount: number;
  duplicateGroups: Set<string>;
}
