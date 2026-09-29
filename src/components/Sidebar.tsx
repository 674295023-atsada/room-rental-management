import React from 'react';
import { 
  LayoutDashboard, 
  DoorOpen, 
  FileText, 
  Gauge, 
  Receipt, 
  Wrench, 
  Database,
  CloudUpload
} from 'lucide-react';

export type TabType = 'dashboard' | 'rooms' | 'leases' | 'meters' | 'invoices' | 'maintenance' | 'database' | 'deployment';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  counts: {
    pendingInvoices: number;
    openTickets: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, counts }) => {
  const menuItems = [
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          เมนูหลัก
        </p>
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
              {item.badge && (
                <span className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-3.5 text-white shadow-sm">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-200" />
            <p className="text-xs font-medium text-emerald-100">Cloudflare D1 SQL</p>
          </div>
          <p className="text-sm font-bold mt-0.5">room_rental_db</p>
          <div className="mt-2 text-[11px] text-emerald-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            Connected &bull; Edge APAC
          </div>
        </div>
      </div>
    </aside>
  );
};
