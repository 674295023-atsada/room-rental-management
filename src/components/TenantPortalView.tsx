import React, { useState } from 'react';
import { 
  Building2, 
  DoorClosed, 
  Receipt, 
  Wrench, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Phone, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Printer, 
  X,
  CreditCard,
  ShieldCheck,
  Info,
  RefreshCw
} from 'lucide-react';
import { User, Room, Invoice, MaintenanceTicket, LeaseContract, TicketCategory, TicketPriority } from '../types';

interface TenantPortalViewProps {
  currentUser: User;
  rooms: Room[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  leases: LeaseContract[];
  onUpdateInvoices: (invoices: Invoice[]) => void;
  onUpdateTickets: (tickets: MaintenanceTicket[]) => void;
  onRefresh?: () => void;
}

export const TenantPortalView: React.FC<TenantPortalViewProps> = ({
  currentUser,
  rooms,
  invoices,
  tickets,
  leases,
  onUpdateInvoices,
  onUpdateTickets,
  onRefresh
}) => {
  // Find lease associated strictly with current user's email or name
  const userLease = leases.find(l => 
    (l.tenantEmail && l.tenantEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) ||
    (currentUser.name && l.tenantName && l.tenantName.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
  );

  const myRoom = userLease ? rooms.find(r => r.id === userLease.roomId) : null;
  const myInvoices = myRoom ? invoices.filter(inv => inv.roomId === myRoom.id) : [];
  const myTickets = myRoom ? tickets.filter(t => t.roomId === myRoom.id) : [];

  // States
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'invoices' | 'maintenance' | 'rules'>('overview');
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [slipUrlInput, setSlipUrlInput] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  // Ticket Form
  const [ticketCategory, setTicketCategory] = useState<TicketCategory>('PLUMBING');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('MEDIUM');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');

  // Latest invoice
  const latestInvoice = myInvoices.length > 0 ? myInvoices[myInvoices.length - 1] : null;

  const handleAttachSlip = (invoiceId: string) => {
    const dummySlip = slipUrlInput || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60';
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'AWAITING_APPROVAL' as const,
          paymentSlipUrl: dummySlip
        };
      }
      return inv;
    });

    onUpdateInvoices(updated);
    setIsSlipModalOpen(false);
    setSlipUrlInput('');
    alert('แนบสลิปการโอนเงินเรียบร้อยแล้ว! ผู้ดูแลหอพักจะตรวจสอบและอนุมัติให้โดยเร็วที่สุดครับ');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !myRoom) return;

    const newTicket: MaintenanceTicket = {
      id: `t-tenant-${Date.now().toString().slice(-4)}`,
      ticketNumber: `REP-T-${Date.now().toString().slice(-4)}`,
      roomId: myRoom.id,
      roomNumber: myRoom.roomNumber,
      reportedBy: currentUser.name,
      category: ticketCategory,
      title: ticketTitle,
      description: ticketDescription,
      priority: ticketPriority,
      status: 'OPEN',
      createdAt: new Date().toLocaleString('th-TH')
    };

    onUpdateTickets([newTicket, ...tickets]);
    setIsNewTicketModalOpen(false);
    setTicketTitle('');
    setTicketDescription('');
    alert('ส่งคำขอแจ้งซ่อมเรียบร้อยแล้ว ช่างประจำอาคารจะดำเนินการตรวจสอบครับ');
  };

  // If tenant is not assigned to a room yet in Cloudflare D1
  if (!userLease || !myRoom) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <DoorClosed className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              ⏳ รอการจัดสรรห้องพัก (Pending Room Assignment)
            </span>
            <h2 className="text-2xl font-bold text-slate-800">
              ยินดีต้อนรับคุณ {currentUser.name}
            </h2>
            <p className="text-sm text-slate-500 font-mono">
              อีเมลบัญชี Google: {currentUser.email}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 text-left space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>บัญชีของคุณได้ลงทะเบียนในฐานข้อมูล Cloudflare D1 เรียบร้อยแล้ว</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              ขณะนี้บัญชีอีเมลของคุณยังไม่ได้ผูกกับสัญญาเช่าห้องพักในหอพัก กรุณาแจ้งผู้ดูแลระบบให้ทำการเพิ่มสัญญาเช่าและระบุอีเมล <span className="font-bold text-slate-800">{currentUser.email}</span> ในระบบ
            </p>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ซิงค์ข้อมูลล่าสุดจาก Cloudflare D1</span>
            </button>
          )}

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">ติดต่อผู้ดูแลหอพัก:</p>
            <p>อาจารย์เสรี ชะนะ (ผู้ดูแลระบบ) &bull; โทร 02-123-4567, 081-999-8888</p>
            <p>อีเมล: seree999@gmail.com หรือ 674295023@parichat.skru.ac.th</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wide">
              👤 พอร์ทัลสำหรับผู้เช่าห้องพัก (Tenant Portal)
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              ยินดีต้อนรับ, {currentUser.name} 👋
            </h2>
            <p className="text-blue-100 text-xs md:text-sm max-w-xl">
              ห้องพักของคุณ: <span className="font-bold text-white text-base">ห้อง {myRoom.roomNumber}</span> (ชั้น {myRoom.floor} &bull; {myRoom.type}) &bull; ค่าเช่า ฿{myRoom.baseRent.toLocaleString()}/เดือน
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-xs">
            <div>
              <p className="text-blue-200">สถานะสัญญาเช่า</p>
              <p className="text-sm font-bold text-emerald-300">● ใช้งานอยู่ (Active)</p>
            </div>
            <div className="border-l border-white/20 pl-4">
              <p className="text-blue-200">เงินประกันสัญญา</p>
              <p className="text-sm font-bold text-white">฿{(userLease?.securityDeposit || 9000).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ภาพรวมห้องพัก
        </button>
        <button
          onClick={() => setActiveSubTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'invoices'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          บิลค่าเช่า & ชำระเงิน ({myInvoices.length})
        </button>
        <button
          onClick={() => setActiveSubTab('maintenance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'maintenance'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          แจ้งซ่อมบำรุง ({myTickets.length})
        </button>
        <button
          onClick={() => setActiveSubTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'rules'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ระเบียบและติดต่อผู้ดูแล
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Bill Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">ใบแจ้งหนี้รอบล่าสุด</h3>
              </div>
              {latestInvoice && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  latestInvoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                  latestInvoice.status === 'AWAITING_APPROVAL' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {latestInvoice.status === 'PAID' ? '✓ ชำระแล้ว' :
                   latestInvoice.status === 'AWAITING_APPROVAL' ? '⏳ รอผู้ดูแลตรวจสอบสลิป' : '⚠️ รอชำระเงิน'}
                </span>
              )}
            </div>

            {latestInvoice ? (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 block">ยอดชำระประจำงวด {latestInvoice.monthYear}</span>
                    <span className="text-2xl font-extrabold text-blue-700">฿{latestInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <span>กำหนดชำระ: </span>
                    <span className="font-semibold text-slate-800">{latestInvoice.dueDate}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {latestInvoice.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between text-slate-700">
                      <span>{item.description}</span>
                      <span className="font-semibold">฿{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap gap-2 justify-end">
                  {latestInvoice.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setSelectedInvoice(latestInvoice);
                        setIsSlipModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
                    >
                      <Upload className="w-4 h-4" />
                      <span>แนบสลิปโอนเงินชำระค่าห้อง</span>
                    </button>
                  )}

                  {latestInvoice.status === 'AWAITING_APPROVAL' && (
                    <button
                      onClick={() => {
                        setSelectedInvoice(latestInvoice);
                        setIsSlipModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>อัปเดตสลิปใหม่</span>
                    </button>
                  )}

                  {latestInvoice.paymentSlipUrl && (
                    <a
                      href={latestInvoice.paymentSlipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      ดูสลิปที่แนบไว้
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">ไม่มีบิลค้างชำระในขณะนี้</p>
            )}
          </div>

          {/* Quick Maintenance Request Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-slate-800 text-base">แจ้งซ่อมบำรุง</h3>
                </div>
                <button
                  onClick={() => setIsNewTicketModalOpen(true)}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold"
                >
                  + แจ้งซ่อม
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                {myTickets.length > 0 ? (
                  myTickets.slice(0, 3).map(ticket => (
                    <div key={ticket.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate max-w-[150px]">{ticket.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.status === 'OPEN' ? 'bg-rose-100 text-rose-800' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ticket.status === 'OPEN' ? 'รอดำเนินการ' :
                           ticket.status === 'IN_PROGRESS' ? 'กำลังซ่อม' : 'เสร็จแล้ว'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{ticket.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">ไม่มีประวัติการแจ้งซ่อม</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              เปิดใบแจ้งซ่อมห้อง {myRoom.roomNumber}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES LIST */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base">ประวัติใบแจ้งหนี้ห้อง {myRoom.roomNumber}</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">เลขที่บิล / รอบบิล</th>
                  <th className="px-4 py-3">ยอดรวม</th>
                  <th className="px-4 py-3">กำหนดชำระ</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {myInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800 block">{inv.invoiceNumber}</span>
                      <span className="text-[11px] text-slate-400">รอบบิล {inv.monthYear}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-blue-700 text-sm">
                      ฿{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{inv.dueDate}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'AWAITING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {inv.status === 'PAID' ? 'ชำระแล้ว' : inv.status === 'AWAITING_APPROVAL' ? 'รอตรวจสอบ' : 'รอชำระ'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsSlipModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                        >
                          แนบสลิป
                        </button>
                      )}
                      {inv.paymentSlipUrl && (
                        <a
                          href={inv.paymentSlipUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          ดูสลิป
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MAINTENANCE TICKETS */}
      {activeSubTab === 'maintenance' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base">รายการแจ้งซ่อมห้อง {myRoom.roomNumber}</h3>
            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>เปิดใบแจ้งซ่อม</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTickets.map(ticket => (
              <div key={ticket.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{ticket.title}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    ticket.status === 'OPEN' ? 'bg-rose-100 text-rose-800' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {ticket.status === 'OPEN' ? 'รอดำเนินการ' : ticket.status === 'IN_PROGRESS' ? 'กำลังซ่อม' : 'เสร็จสิ้น'}
                  </span>
                </div>
                <p className="text-slate-600">{ticket.description}</p>
                <div className="pt-2 border-t border-slate-200 text-slate-400 flex items-center justify-between text-[11px]">
                  <span>วันที่แจ้ง: {ticket.createdAt}</span>
                  {ticket.assignedTo && <span className="text-blue-700 font-semibold">{ticket.assignedTo}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RULES & CONTACT */}
      {activeSubTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span>กฎระเบียบการพักอาศัย</span>
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>ห้ามส่งเสียงดังรบกวนผู้อื่นหลังเวลา 22:00 น.</li>
              <li>กรุณาแยกขยะและนำไปทิ้งที่จุดพักขยะประจำชั้นก่อน 09:00 น.</li>
              <li>ห้ามสูบบุหรี่ภายในห้องพักและทางเดินส่วนกลาง</li>
              <li>กำหนดชำระค่าเช่าห้องภายในวันที่ 5 ของทุกเดือน</li>
              <li>หากต้องการย้ายออก กรุณาแจ้งล่วงหน้าอย่างน้อย 30 วัน</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span>ติดต่อผู้ดูแลหอพัก</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-800">สำนักงานนิติบุคคล / ผู้จัดการ</p>
                <p className="text-slate-500">โทร: 02-123-4567, 081-999-8888</p>
                <p className="text-slate-500">เวลาทำการ: ทุกวัน 08:30 - 18:00 น.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-800">บัญชีสำหรับโอนชำระเงิน (พร้อมเพย์)</p>
                <p className="text-slate-500 font-mono text-sm font-bold text-blue-700 mt-1">081-999-8888</p>
                <p className="text-[11px] text-slate-400">หอพักบ้านสบายใจ (Baan Sabaijai)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attach Slip Modal */}
      {isSlipModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">แนบสลิปการโอนเงิน (ห้อง {myRoom.roomNumber})</h3>
              <button onClick={() => setIsSlipModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl text-xs text-blue-900 flex justify-between items-center">
                <span>ยอดที่ต้องชำระ:</span>
                <span className="text-base font-extrabold text-blue-700">฿{selectedInvoice.totalAmount.toLocaleString()} บาท</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ลิงก์รูปภาพสลิป หรือตัวอย่างจำลอง</label>
                <input
                  type="text"
                  placeholder="https://... หรือปล่อยว่างเพื่อใช้สลิปทดสอบ"
                  value={slipUrlInput}
                  onChange={(e) => setSlipUrlInput(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  onClick={() => setIsSlipModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleAttachSlip(selectedInvoice.id)}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  ยืนยันการแนบสลิป
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Maintenance Ticket Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">แจ้งซ่อมบำรุงห้อง {myRoom.roomNumber}</h3>
              <button onClick={() => setIsNewTicketModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่งานซ่อม</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as TicketCategory)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="PLUMBING">ประปาและท่อ</option>
                    <option value="ELECTRICAL">ไฟฟ้าและแสงสว่าง</option>
                    <option value="AIR_CONDITIONER">เครื่องปรับอากาศ</option>
                    <option value="FURNITURE">เฟอร์นิเจอร์/ประตู</option>
                    <option value="OTHER">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ความเร่งด่วน</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as TicketPriority)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="LOW">ปกติ</option>
                    <option value="MEDIUM">ปานกลาง</option>
                    <option value="HIGH">ด่วน</option>
                    <option value="URGENT">ด่วนที่สุด</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้ออาการชำรุด</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ก๊อกน้ำรั่ว, แอร์ไม่เย็น"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดและช่วงเวลาที่สะดวกให้เข้าซ่อม</label>
                <textarea
                  rows={3}
                  placeholder="เช่น น้ำซึมใต้อ่าง สะดวกช่วงเย็นหลัง 17:00 น."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                >
                  ส่งใบแจ้งซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
