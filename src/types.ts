export type Page = 'home' | 'servicios' | 'nosotros' | 'contacto' | 'cotizador' | 'directorio' | 'tramites' | 'agendamiento' | 'faqs' | 'blog' | 'blog-detalle' | 'admin' | 'privacy' | 'mapa-red-medica' | 'gracias';

export interface Author {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  avatar: string; // URL/SVG illustration or path
  bio: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[]; // split by paragraphs or sections
  publishDate: string;
  readTime: string;
  category: string;
  author: Author;
  image: string;
  tags: string[];
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  basePrice: number;
  maxCoverage: number;
  copayPercent: number;
  hospitalNetwork: string;
  highlights?: string[];
  features: string[];
  color: string; // Tailwind color class names
}

export interface ClientAddress {
  province: string;
  city: string;
  address1: string;
  address2?: string;
  postalCode: string;
}

export interface QuoteState {
  fullName: string;
  email: string;
  phone: string;
  docType?: 'cedula' | 'pasaporte';
  docNumber?: string;
  birthDate?: string;
  type: 'individual' | 'pareja' | 'familiar';
  primaryAge: number;
  partnerAge?: number;
  childrenCount: number;
  childrenAges: number[];
  basePlanId: string;
  leadCode?: string;
  selectedPlanName?: string;
  province?: string;
  address?: ClientAddress;
  contractNumber?: string;
  // Client/portal fields — only present once a lead becomes a client
  // (status 'Cierre Efectivo') and an admin sets up their portal access.
  paymentStatus?: 'Pagado' | 'Pendiente' | 'Atrasado';
  portalPasswordHash?: string;
  portalPasswordSalt?: string;
}

export interface LeadNote {
  text: string;
  author: string;
  timestamp: string;
}

export interface LeadQuote {
  id: string;
  timestamp: string;
  quoteData: QuoteState;
  estimatedPrice: number;
  status: 'Nuevo Plan' | 'Contactado' | 'Cierre Efectivo' | 'Perdido';
  notes?: LeadNote[];
  assignedTo?: string;
  followUpDate?: string;
  lostReason?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  iconName: string;
  benefits: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  city: string;
  phone: string;
  email: string;
  clinic: string;
  rating: string;
  availability: string;
  education: string;
  image: string;
  cost: number;
  active?: boolean;
  nivel?: number;
}

export interface RefundItem {
  id: string;
  familyMember: string;
  specialty: string;
  amount: number;
  refundDate: string;
  status: 'Aprobado' | 'Procesando' | 'Reembolsado' | 'Rechazado';
  invoiceNumber: string;
  adminComment?: string;
  fileName?: string;
  fileData?: string;
  userEmail?: string;
  userPhone?: string;
}

export interface AuthorizationItem {
  id: string;
  patient: string;
  procedure: string;
  facility: string;
  requestDate: string;
  status: 'Aprobado' | 'Pendiente' | 'Auditoría' | 'Rechazado';
  adminComment?: string;
  fileName?: string;
  fileData?: string;
  userEmail?: string;
  userPhone?: string;
}

export interface AppointmentItem {
  id: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  patientId: string;
  patientPhone: string;
  aptDate: string;
  aptTime: string;
  modality: 'presencial' | 'telemedicina';
  clinic: string;
  city: string;
  cost: number;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';
  notes?: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'Super Admin' | 'Mid Admin' | 'Equipo Comercial' | 'Auditor';
  addedAt: string;
  addedBy: string;
  active: boolean;
}

