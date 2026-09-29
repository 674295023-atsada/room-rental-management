import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  DollarSign, 
  X,
  Filter
} from 'lucide-react';
import { MaintenanceTicket, Room, TicketCategory, TicketPriority, TicketStatus } from '../types';

interface MaintenanceViewProps {
  tickets: MaintenanceTicket[];
  rooms: Room[];
  onUpdateTickets: (tickets: MaintenanceTicket[]) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ tickets, rooms, onUpdateTickets }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New ticket state
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [category, setCategory] = useState<TicketCategory>('PLUMBING');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomNumber || !title) return;

    const newTicket: MaintenanceTicket = {
      id: `t-${Date.now().toString().slice(-4)}`,
      ticketNumber: `REP-202609-${(tickets.length + 1).toString().padStart(2, '0')}`,
      roomId: `r-${selectedRoomNumber}`,
      roomNumber: selectedRoomNumber,
      reportedBy: reporterName || 'ผู้เช่าห้องพัก',
      category,
      title,
      description,
      priority,
      status: 'OPEN',
      createdAt: new Date().toLocaleString('th-TH')
    };

    onUpdateTickets([newTicket, ...tickets]);
    setIsAddModalOpen(false);

    // Reset form
    setSelectedRoomNumber('');
    setReporterName('');
    setTitle('');
    setDescription('');
  };

  const handleStatusUpdate = (ticketId: string, newStatus: TicketStatus) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          resolvedAt: newStatus === 'RESOLVED' ? new Date().toLocaleString('th-TH') : t.resolvedAt,
          assignedTo: newStatus === 'IN_PROGRESS' && !t.assignedTo ? 'ช่างประจำอาคาร' : t.assignedTo
        };
      }
      return t;
    });
    onUpdateTickets(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">แจ้งซ่อมบำรุงห้องพัก (Maintenance & Repairs)</h2>
          <p className="text-xs text-slate-500 mt-1">
            รายการแจ้งซ่อมทั้งหมด {tickets.length} รายการ &bull; 
            รอดำเนินการ {tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length} รายการ
          </p>
        </div>

        <button
          onClick={() => {
            if (rooms.length > 0) setSelectedRoomNumber(rooms[0].roomNumber);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เปิดใบแจ้งซ่อมใหม่</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/80 w-fit text-xs font-semibold">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'}`}
        >
          ทั้งหมด ({tickets.length})
        </button>
        <button
          onClick={() => setFilterStatus('OPEN')}
          className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'OPEN' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'}`}
        >
          เปิดคำขอ ({tickets.filter(t => t.status === 'OPEN').length})
        </button>
        <button
          onClick={() => setFilterStatus('IN_PROGRESS')}
          className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'IN_PROGRESS' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'}`}
        >
          กำลังซ่อม ({tickets.filter(t => t.status === 'IN_PROGRESS').length})
        </button>
        <button
          onClick={() => setFilterStatus('RESOLVED')}
          className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
        >
          ซ่อมเสร็จสิ้น ({tickets.filter(t => t.status === 'RESOLVED').length})
        </button>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-extrabold text-blue-700 text-base">ห้อง {ticket.roomNumber}</span>
                  <span className="text-[11px] text-slate-400 font-mono block">{ticket.ticketNumber}</span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    ticket.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                    ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    ticket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    ความเร่งด่วน: {ticket.priority}
                  </span>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    ticket.status === 'OPEN' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {ticket.status === 'OPEN' ? 'รอดำเนินการ' :
                     ticket.status === 'IN_PROGRESS' ? 'กำลังดำเนินการ' : 'ซ่อมเสร็จแล้ว'}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <span className="inline-block text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium mb-1">
                  หมวดหมู่: {ticket.category}
                </span>
                <h4 className="font-bold text-slate-800 text-sm">{ticket.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {ticket.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <p><span className="text-slate-400">ผู้แจ้ง:</span> {ticket.reportedBy}</p>
                <p><span className="text-slate-400">วันที่แจ้ง:</span> {ticket.createdAt}</p>
                {ticket.assignedTo && (
                  <p className="text-blue-700 font-medium"><span className="text-slate-400">ผู้รับผิดชอบ:</span> {ticket.assignedTo}</p>
                )}
                {ticket.repairCost && (
                  <p className="text-emerald-700 font-bold"><span className="text-slate-400">ค่าซ่อม/อะไหล่:</span> ฿{ticket.repairCost.toLocaleString()} บาท</p>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              {ticket.status === 'OPEN' && (
                <button
                  onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                >
                  เริ่มเข้าซ่อม
                </button>
              )}
              {ticket.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusUpdate(ticket.id, 'RESOLVED')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  ✓ ปิดงานซ่อมแล้ว
                </button>
              )}
              {ticket.status === 'RESOLVED' && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> เสร็จสมบูรณ์
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Ticket Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">เปิดใบแจ้งซ่อมบำรุง</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เลือกห้องพัก</label>
                  <select
                    value={selectedRoomNumber}
                    onChange={(e) => setSelectedRoomNumber(e.target.value)}
                    required
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.roomNumber}>ห้อง {r.roomNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้แจ้ง</label>
                  <input
                    type="text"
                    placeholder="เช่น ผู้เช่า หรือ ผู้ตรวจ"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TicketCategory)}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ระดับความเร่งด่วน</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="LOW">ปกติ (Low)</option>
                    <option value="MEDIUM">ปานกลาง (Medium)</option>
                    <option value="HIGH">ด่วน (High)</option>
                    <option value="URGENT">ด่วนที่สุด (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้ออาการเสีย/ปัญหา</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ก๊อกน้ำรั่วซึม, แอร์ไม่เย็น"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  rows={3}
                  placeholder="ระบุจุดที่เสีย หรือช่วงเวลาที่สะดวกให้ช่างเข้าซ่อม..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                >
                  บันทึกใบแจ้งซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
