import React from 'react';
import { 
  Building2, 
  DoorClosed, 
  DoorOpen, 
  Receipt, 
  Wrench, 
  DollarSign, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { Room, Invoice, MaintenanceTicket, LeaseContract } from '../types';
import { TabType } from './Sidebar';

interface DashboardViewProps {
  rooms: Room[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  leases: LeaseContract[];
  setActiveTab: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  rooms,
  invoices,
  tickets,
  leases,
  setActiveTab
}) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
  const vacantRooms = rooms.filter(r => r.status === 'VACANT').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'MAINTENANCE').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const totalRevenueThisMonth = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const pendingRevenue = invoices
    .filter(i => i.status !== 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const pendingVerificationInvoices = invoices.filter(i => i.status === 'AWAITING_APPROVAL');
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
            ภาพรวมระบบ &bull; เฟส 1
          </span>
          <h2 className="text-2xl font-bold">สวัสดีผู้จัดการอาคาร 👋</h2>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            สถานะหอพักปัจจุบัน: มีผู้พักอาศัย {occupiedRooms} จาก {totalRooms} ห้อง ({occupancyRate}% อัตราการเข้าพัก)
            และมี {pendingVerificationInvoices.length} บิลที่แนบสลิปรอการตรวจสอบ
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('meters')}
              className="bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
            >
              ⚡ บันทึกมิเตอร์ประจำเดือน
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className="bg-blue-600/80 hover:bg-blue-600 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition backdrop-blur-sm"
            >
              📄 ตรวจสอบบิลและสลิป
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className="bg-blue-600/80 hover:bg-blue-600 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition backdrop-blur-sm"
            >
              🚪 ดูผังห้องพักทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Occupancy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">อัตราการเข้าพัก</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DoorClosed className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">{occupancyRate}%</span>
              <span className="text-xs text-slate-500 font-medium">({occupiedRooms}/{totalRooms} ห้อง)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Revenue Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ยอดชำระแล้วเดือนนี้</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-emerald-600">
                ฿{totalRevenueThisMonth.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ชำระแล้ว {invoices.filter(i => i.status === 'PAID').length} รายการ
            </p>
          </div>
        </div>

        {/* Card 3: Pending Bills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ยอดรอบิล / รอตรวจ</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-amber-600">
                ฿{pendingRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-2 font-medium">
              สลิปรออนุมัติ: {pendingVerificationInvoices.length} ห้อง
            </p>
          </div>
        </div>

        {/* Card 4: Open Maintenance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">งานแจ้งซ่อมค้างอยู่</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600">{openTickets.length}</span>
              <span className="text-xs text-slate-500 font-medium">รายการ</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              รอดำเนินการซ่อมบำรุง
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Recent Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room Status Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">สรุปสถานะห้องพักตามชั้น</h3>
              <p className="text-xs text-slate-500">คลิกที่ห้องเพื่อดูรายละเอียดสัญญาหรือสร้างบิล</p>
            </div>
            <button
              onClick={() => setActiveTab('rooms')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              จัดการห้องพักทั้งหมด <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <div>
                <p className="text-xs text-slate-500">มีผู้เช่าแล้ว</p>
                <p className="text-lg font-bold text-slate-800">{occupiedRooms} ห้อง</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <div>
                <p className="text-xs text-slate-500">ห้องว่างพร้อมเช่า</p>
                <p className="text-lg font-bold text-emerald-700">{vacantRooms} ห้อง</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div>
                <p className="text-xs text-slate-500">ปิดปรับปรุง</p>
                <p className="text-lg font-bold text-rose-700">{maintenanceRooms} ห้อง</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-slate-400"></div>
              <div>
                <p className="text-xs text-slate-500">ทั้งหมด</p>
                <p className="text-lg font-bold text-slate-700">{totalRooms} ห้อง</p>
              </div>
            </div>
          </div>

          {/* Quick Room Mini Matrix */}
          <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {rooms.map(room => (
              <div
                key={room.id}
                onClick={() => setActiveTab('rooms')}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition transform hover:-translate-y-0.5 ${
                  room.status === 'OCCUPIED'
                    ? 'bg-blue-50/50 border-blue-200 text-blue-900'
                    : room.status === 'VACANT'
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/50 border-rose-200 text-rose-900'
                }`}
              >
                <span className="text-xs font-bold block">{room.roomNumber}</span>
                <span className="text-[10px] text-slate-500 font-medium">{room.type}</span>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                  room.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' :
                  room.status === 'VACANT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {room.status === 'OCCUPIED' ? 'เช่าอยู่' : room.status === 'VACANT' ? 'ว่าง' : 'ซ่อม'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pending Action Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">สิ่งที่ต้องจัดการด่วน</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            </div>

            <div className="space-y-3">
              {pendingVerificationInvoices.map(inv => (
                <div key={inv.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">ห้อง {inv.roomNumber}</span>
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-md font-bold">สลิปรอตรวจ</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{inv.tenantName} แจ้งชำระ ฿{inv.totalAmount.toLocaleString()}</p>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    ตรวจสอบและอนุมัติบิล &rarr;
                  </button>
                </div>
              ))}

              {openTickets.map(t => (
                <div key={t.id} className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900">แจ้งซ่อม: ห้อง {t.roomNumber}</span>
                    <span className="text-[10px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded-md font-bold">{t.priority}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{t.title}</p>
                  <button
                    onClick={() => setActiveTab('maintenance')}
                    className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline"
                  >
                    ดูรายละเอียดงานซ่อม &rarr;
                  </button>
                </div>
              ))}

              {pendingVerificationInvoices.length === 0 && openTickets.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs">ไม่มีรายการค้างจัดการในขณะนี้</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400">ระบบทำงานอัตโนมัติบน Edge Network</span>
          </div>
        </div>
      </div>
    </div>
  );
};
