import React, { useState } from 'react';
import { Plus, FileText, User, Calendar, Phone, DollarSign, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { LeaseContract, Room } from '../types';

interface LeaseManagementViewProps {
  leases: LeaseContract[];
  rooms: Room[];
  onUpdateLeases: (leases: LeaseContract[]) => void;
  onUpdateRooms: (rooms: Room[]) => void;
}

export const LeaseManagementView: React.FC<LeaseManagementViewProps> = ({
  leases,
  rooms,
  onUpdateLeases,
  onUpdateRooms
}) => {
  const [isNewLeaseModalOpen, setIsNewLeaseModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2027-09-30');
  const [monthlyRent, setMonthlyRent] = useState(4500);
  const [securityDeposit, setSecurityDeposit] = useState(9000);

  const vacantRooms = rooms.filter(r => r.status === 'VACANT');

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setMonthlyRent(room.baseRent);
      setSecurityDeposit(room.baseRent * 2);
    }
  };

  const handleCreateLease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !tenantName || !tenantPhone) return;

    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room) return;

    const leaseId = `l-${room.roomNumber}-${Date.now().toString().slice(-4)}`;
    const tenantId = `t-${Date.now().toString().slice(-4)}`;

    const newLease: LeaseContract = {
      id: leaseId,
      roomId: room.id,
      roomNumber: room.roomNumber,
      tenantId,
      tenantName,
      tenantPhone,
      startDate,
      endDate,
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit),
      status: 'ACTIVE'
    };

    // Update room status to OCCUPIED
    const updatedRooms = rooms.map(r => {
      if (r.id === room.id) {
        return {
          ...r,
          status: 'OCCUPIED' as const,
          currentTenant: {
            id: tenantId,
            name: tenantName,
            phone: tenantPhone,
            leaseId
          }
        };
      }
      return r;
    });

    onUpdateLeases([newLease, ...leases]);
    onUpdateRooms(updatedRooms);
    setIsNewLeaseModalOpen(false);

    // Reset form
    setSelectedRoomId('');
    setTenantName('');
    setTenantPhone('');
  };

  const handleTerminateLease = (leaseId: string, roomId: string) => {
    if (!confirm('ยืนยันการสิ้นสุดสัญญาและคืนห้องพักใช่หรือไม่?')) return;

    const updatedLeases = leases.map(l => {
      if (l.id === leaseId) {
        return { ...l, status: 'TERMINATED' as const };
      }
      return l;
    });

    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          status: 'VACANT' as const,
          currentTenant: undefined
        };
      }
      return r;
    });

    onUpdateLeases(updatedLeases);
    onUpdateRooms(updatedRooms);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">สัญญาเช่าและผู้เช่า (Lease Contracts)</h2>
          <p className="text-xs text-slate-500 mt-1">
            มีสัญญาที่กำลังใช้งาน (Active) {leases.filter(l => l.status === 'ACTIVE').length} ฉบับ &bull; มีห้องว่างพร้อมทำสัญญา {vacantRooms.length} ห้อง
          </p>
        </div>

        <button
          onClick={() => {
            if (vacantRooms.length > 0) {
              handleRoomSelect(vacantRooms[0].id);
            }
            setIsNewLeaseModalOpen(true);
          }}
          disabled={vacantRooms.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ทำสัญญาเช่าใหม่</span>
        </button>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">ห้อง / รหัสสัญญา</th>
                <th className="px-5 py-3.5">ข้อมูลผู้เช่า</th>
                <th className="px-5 py-3.5">ระยะเวลาสัญญา</th>
                <th className="px-5 py-3.5">ค่าเช่า / เงินประกัน</th>
                <th className="px-5 py-3.5">สถานะ</th>
                <th className="px-5 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leases.map((lease) => (
                <tr key={lease.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4">
                    <span className="font-extrabold text-blue-700 text-base block">ห้อง {lease.roomNumber}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{lease.id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        {lease.tenantName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{lease.tenantName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {lease.tenantPhone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs space-y-0.5 text-slate-600">
                      <p><span className="text-slate-400">เริ่ม:</span> {lease.startDate}</p>
                      <p><span className="text-slate-400">สิ้นสุด:</span> {lease.endDate}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800">฿{lease.monthlyRent.toLocaleString()}<span className="text-xs font-normal text-slate-500">/ด.</span></p>
                    <p className="text-xs text-emerald-600 font-medium">ประกัน: ฿{lease.securityDeposit.toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      lease.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {lease.status === 'ACTIVE' ? 'กำลังเช่าอยู่' : 'สิ้นสุดสัญญาแล้ว'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {lease.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleTerminateLease(lease.id, lease.roomId)}
                        className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition font-medium"
                      >
                        ย้ายออก / คืนห้อง
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lease Modal */}
      {isNewLeaseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">ทำสัญญาเช่าห้องพักใหม่</h3>
              <button onClick={() => setIsNewLeaseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLease} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เลือกห้องพักที่ว่าง</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => handleRoomSelect(e.target.value)}
                  required
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {vacantRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      ห้อง {r.roomNumber} ({r.type}) - ค่าเช่าปกติ ฿{r.baseRent.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล ผู้เช่า</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นายมานะ ตั้งใจ"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 081-999-8888"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันเริ่มสัญญา</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันสิ้นสุดสัญญา</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ค่าเช่ารายเดือน (บาท)</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เงินประกันสัญญา (บาท)</label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewLeaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
                >
                  บันทึกสัญญาและเข้าพัก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
