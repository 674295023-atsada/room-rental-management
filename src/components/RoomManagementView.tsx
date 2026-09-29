import React, { useState } from 'react';
import { 
  Plus, 
  DoorClosed, 
  DoorOpen, 
  Wrench, 
  Filter, 
  Search, 
  DollarSign, 
  Check, 
  X,
  User
} from 'lucide-react';
import { Room, RoomStatus, RoomType } from '../types';

interface RoomManagementViewProps {
  rooms: Room[];
  onUpdateRooms: (rooms: Room[]) => void;
}

export const RoomManagementView: React.FC<RoomManagementViewProps> = ({ rooms, onUpdateRooms }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New room form state
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newType, setNewType] = useState<RoomType>('Standard');
  const [newBaseRent, setNewBaseRent] = useState(4500);

  const filteredRooms = rooms.filter(r => {
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchFloor = selectedFloor === 'ALL' || r.floor.toString() === selectedFloor;
    const matchSearch = r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.currentTenant && r.currentTenant.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchFloor && matchSearch;
  });

  const handleStatusChange = (roomId: string, newStatus: RoomStatus) => {
    const updated = rooms.map(r => {
      if (r.id === roomId) {
        return { 
          ...r, 
          status: newStatus,
          // if changing to vacant or maintenance, optionally keep or clear
          currentTenant: newStatus === 'VACANT' ? undefined : r.currentTenant
        };
      }
      return r;
    });
    onUpdateRooms(updated);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) return;

    const newRoom: Room = {
      id: `r-${newRoomNumber}`,
      roomNumber: newRoomNumber,
      floor: Number(newFloor),
      type: newType,
      baseRent: Number(newBaseRent),
      status: 'VACANT'
    };

    onUpdateRooms([...rooms, newRoom]);
    setIsAddModalOpen(false);
    setNewRoomNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการข้อมูลห้องพัก (Room Management)</h2>
          <p className="text-xs text-slate-500 mt-1">
            ทั้งหมด {rooms.length} ห้อง &bull; ว่าง {rooms.filter(r => r.status === 'VACANT').length} ห้อง &bull; มีผู้เช่า {rooms.filter(r => r.status === 'OCCUPIED').length} ห้อง
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มห้องพักใหม่</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขห้อง หรือชื่อผู้เช่า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs w-full focus:outline-none text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-md transition ${filterStatus === 'ALL' ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-600'}`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterStatus('OCCUPIED')}
              className={`px-3 py-1 rounded-md transition ${filterStatus === 'OCCUPIED' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-slate-600'}`}
            >
              มีผู้เช่า
            </button>
            <button
              onClick={() => setFilterStatus('VACANT')}
              className={`px-3 py-1 rounded-md transition ${filterStatus === 'VACANT' ? 'bg-emerald-600 text-white shadow-sm font-semibold' : 'text-slate-600'}`}
            >
              ห้องว่าง
            </button>
            <button
              onClick={() => setFilterStatus('MAINTENANCE')}
              className={`px-3 py-1 rounded-md transition ${filterStatus === 'MAINTENANCE' ? 'bg-rose-600 text-white shadow-sm font-semibold' : 'text-slate-600'}`}
            >
              ปิดปรับปรุง
            </button>
          </div>

          {/* Floor selector */}
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="text-xs bg-slate-100 border-none rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">ทุกชั้น (All Floors)</option>
            <option value="1">ชั้น 1</option>
            <option value="2">ชั้น 2</option>
            <option value="3">ชั้น 3</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map(room => (
          <div 
            key={room.id} 
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-slate-800">ห้อง {room.roomNumber}</span>
                    <span className="text-xs text-slate-400 font-medium">ชั้น {room.floor}</span>
                  </div>
                  <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                    {room.type}
                  </span>
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  room.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' :
                  room.status === 'VACANT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {room.status === 'OCCUPIED' ? 'มีผู้เช่า' : room.status === 'VACANT' ? 'ห้องว่าง' : 'ปิดซ่อม'}
                </span>
              </div>

              {/* Tenant info or Vacant placeholder */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {room.currentTenant ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{room.currentTenant.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-5">โทร: {room.currentTenant.phone}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {room.status === 'MAINTENANCE' ? 'กำลังซ่อมบำรุงห้องพัก' : 'ยังไม่มีผู้ทำสัญญาเช่า'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">ค่าเช่าเริ่มต้น</span>
                <span className="text-sm font-bold text-slate-800">฿{room.baseRent.toLocaleString()}/ด.</span>
              </div>

              {/* Status Switcher Quick Menu */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStatusChange(room.id, 'VACANT')}
                  title="เปลี่ยนสถานะเป็น: ห้องว่าง"
                  className={`p-1.5 rounded-lg border text-xs ${room.status === 'VACANT' ? 'bg-emerald-600 text-white border-emerald-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <DoorOpen className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleStatusChange(room.id, 'OCCUPIED')}
                  title="เปลี่ยนสถานะเป็น: มีผู้เช่า"
                  className={`p-1.5 rounded-lg border text-xs ${room.status === 'OCCUPIED' ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <DoorClosed className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleStatusChange(room.id, 'MAINTENANCE')}
                  title="เปลี่ยนสถานะเป็น: ปิดซ่อม"
                  className={`p-1.5 rounded-lg border text-xs ${room.status === 'MAINTENANCE' ? 'bg-rose-600 text-white border-rose-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">เพิ่มห้องพักใหม่</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเลขห้อง (เช่น 105, 205)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 105"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชั้น (Floor)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทห้อง (Type)</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as RoomType)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Studio">Studio</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ค่าเช่ารายเดือน (บาท)</label>
                <input
                  type="number"
                  step="100"
                  value={newBaseRent}
                  onChange={(e) => setNewBaseRent(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
                >
                  บันทึกห้องใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
