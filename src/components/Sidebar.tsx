import React from 'react';
import { 
  LayoutDashboard, 
  DoorOpen, 
  FileText, 
  Gauge, 
  Receipt, 
  Wrench, 
  Database,
  CloudUpload,
  Home,
  CreditCard,
  Info
} from 'lucide-react';
import { User } from '../types';

export type TabType = 
  | 'dashboard' 
  | 'rooms' 
  | 'leases' 
  | 'meters' 
  | 'invoices' 
  | 'maintenance' 
  | 'database' 
  | 'deployment'
  | 'tenant-portal';

interface SidebarProps {
  currentUser: User;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  counts: {
    pendingInvoices: number;
    openTickets: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, setActiveTab, counts }) => {
  const isAdmin = currentUser.role === 'ADMIN';

  const adminMenuItems = [
    { id: 'dashboard' as TabType, label: 'ภาพรวมระบบ (Dashboard)', icon: LayoutDashboard },
    { id: 'rooms' as TabType, label: 'จัดการห้องพัก (Rooms)', icon: DoorOpen },
    { id: 'leases' as TabType, label: 'สัญญาเช่าและผู้เช่า (Leases)', icon: FileText },
    { id: 'meters' as TabType, label: 'จดมิเตอร์น้ำ-ไฟ (Meters)', icon: Gauge },
    { 
      id: 'invoices' as TabType, 
      label: 'บิลและชำระเงิน (Invoices)', 
      icon: Receipt,
      badge: counts.pendingInvoices > 0 ? counts.pendingInvoices : undefined,
      badgeColor: 'bg-amber-500'
    },
    { 
      id: 'maintenance' as TabType, 
      label: 'แจ้งซ่อมบำรุง (Maintenance)', 
      icon: Wrench,
      badge: counts.openTickets > 0 ? counts.openTickets : undefined,
      badgeColor: 'bg-rose-500'
    },
    { id: 'database' as TabType, label: 'ฐานข้อมูล Cloudflare D1', icon: Database },
    { id: 'deployment' as TabType, label: 'สถานะ Cloudflare Deploy', icon: CloudUpload },
  ];

  const tenantMenuItems = [
    { id: 'tenant-portal' as TabType, label: 'ห้องพักและบิลของฉัน', icon: Home },
  ];

  const menuItems = isAdmin ? adminMenuItems : tenantMenuItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-1">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {isAdmin ? 'เมนูผู้ดูแลระบบ (Admin)' : 'เมนูสำหรับผู้เช่า (Tenant)'}
          </span>
          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${
            isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isAdmin ? '👑 สิทธิ์ Admin' : '👤 สิทธิ์ผู้เช่าทั่วไป'}
          </span>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {'badge' in item && Boolean((item as any).badge) && (
                <span className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${(item as any).badgeColor}`}>
                  {String((item as any).badge)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className={`rounded-xl p-3.5 text-white shadow-sm ${
          isAdmin ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-white/80" />
            <p className="text-xs font-medium text-white/90">Cloudflare D1 SQL</p>
          </div>
          <p className="text-sm font-bold mt-0.5">room_rental_db</p>
          <div className="mt-2 text-[11px] text-white/90 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            Connected &bull; Edge APAC
          </div>
        </div>
      </div>
    </aside>
  );
};
