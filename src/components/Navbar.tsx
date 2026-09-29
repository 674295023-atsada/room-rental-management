import React from 'react';
import { Building2, RefreshCw, LogOut, Database, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onDataReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onDataReset }) => {
  const currentDate = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'full',
  }).format(new Date());

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">ระบบจัดการหอพักและห้องเช่า</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Smart Room Rental &bull; Phase 1</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Database className="w-3 h-3 text-emerald-600" />
              Cloudflare D1 Live
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden lg:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
          📅 วันนี้: {currentDate}
        </div>

        <button
          onClick={onDataReset}
          title="รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>รีเซ็ต Mock</span>
        </button>

        {/* User Profile */}
        {currentUser && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full ring-2 ring-blue-500/20 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                {currentUser.name[0] || 'U'}
              </div>
            )}
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                  {currentUser.name}
                </p>
                {isAdmin && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">
                {currentUser.email}
              </p>
            </div>

            <button
              onClick={onLogout}
              title="ออกจากระบบ Google"
              className="ml-2 flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 transition font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ออกจากระบบ</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
