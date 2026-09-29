export type UserRole = 'ADMIN' | 'TENANT' | 'STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
}

export type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

export type RoomType = 'Standard' | 'Deluxe' | 'Studio' | 'Suite';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  baseRent: number;
  status: RoomStatus;
  currentTenant?: {
    id: string;
    name: string;
    phone: string;
    leaseId: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface LeaseContract {
  id: string;
  roomId: string;
  roomNumber: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
}

export interface MeterReading {
  id: string;
  roomId: string;
  roomNumber: string;
  monthYear: string; // e.g. "2026-09"
  prevWater: number;
  currWater: number;
  waterUnits: number;
  waterRate: number; // default 18 THB
  waterAmount: number;
  prevElectric: number;
  currElectric: number;
  electricUnits: number;
  electricRate: number; // default 8 THB
  electricAmount: number;
  readingDate: string;
  isBilled: boolean;
}

export type InvoiceStatus = 'PENDING' | 'AWAITING_APPROVAL' | 'PAID' | 'OVERDUE';

export interface InvoiceItem {
  description: string;
  units?: number;
  rate?: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  roomId: string;
  roomNumber: string;
  tenantName: string;
  monthYear: string;
  items: InvoiceItem[];
  totalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  paymentSlipUrl?: string;
  paidAt?: string;
  approvedBy?: string;
}

export type TicketCategory = 'PLUMBING' | 'ELECTRICAL' | 'AIR_CONDITIONER' | 'FURNITURE' | 'OTHER';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  roomId: string;
  roomNumber: string;
  reportedBy: string;
  category: TicketCategory;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  repairCost?: number;
}
