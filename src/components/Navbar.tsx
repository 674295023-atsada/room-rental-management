import React from 'react';
import { Building2, Bell, RefreshCw } from 'lucide-react';
import { StorageService } from '../services/storage';

interface NavbarProps {
  onDataReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onDataReset }) => {
  const currentDate = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'full',
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">ระบบจัดการหอพักและห้องเช่า</h1>
          <p className="text-xs text-slate-500 font-medium">Smart Room Rental Management &bull; Phase 1</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
          📅 วันนี้: {currentDate}
        </div>

        <button
          onClick={onDataReset}
          title="รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น"
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">รีเซ็ตข้อมูล Mock</span>
        </button>

        <div className="relative">
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
            ผจ
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-800">ผู้จัดการหอพัก</p>
            <p className="text-xs text-emerald-600 font-medium">● ออนไลน์ (Admin)</p>
          </div>
        </div>
      </div>
    </header>
  );
};
