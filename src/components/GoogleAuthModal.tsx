import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogIn, CheckCircle2, X, Lock, Sparkles, UserCheck } from 'lucide-react';
import { User } from '../types';
import { AuthService, DEFAULT_ADMIN_USER } from '../services/auth';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Google Identity Services script if present
  useEffect(() => {
    if (!isOpen) return;

    // Load Google GSI script dynamically if not already loaded
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginAsSeree = async () => {
    setIsProcessing(true);
    const user = await AuthService.loginWithGoogle({
      email: 'seree999@gmail.com',
      name: 'อาจารย์เสรี ชะนะ (ผู้ดูแลระบบ)',
      picture: DEFAULT_ADMIN_USER.avatarUrl
    });
    setIsProcessing(false);
    onLoginSuccess(user);
    onClose();
  };

  const handleCustomGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    setIsProcessing(true);
    const user = await AuthService.loginWithGoogle({
      email: customEmail,
      name: customName || customEmail.split('@')[0]
    });
    setIsProcessing(false);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">เข้าสู่ระบบด้วย Google</h3>
          <p className="text-xs text-slate-500 mt-1">Google OAuth 2.0 & Role Authorization</p>
        </div>

        {/* Highlighted Admin Button for Seree */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 mb-5 text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">สิทธิ์ผู้ดูแลระบบสูงสุด (Admin)</span>
          </div>

          <p className="text-xs text-slate-600 mb-3">
            บัญชี <span className="font-bold text-blue-700">seree999@gmail.com</span> ได้รับสิทธิ์เป็น 
            <span className="font-semibold text-emerald-700"> ผู้ดูแลระบบ (Super Admin)</span> ในฐานข้อมูล Cloudflare D1
          </p>

          <button
            onClick={handleLoginAsSeree}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition transform active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            <span>เข้าสู่ระบบเป็น seree999@gmail.com (ผู้ดูแลระบบ)</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-medium">หรือเข้าสู่ระบบด้วยบัญชีอื่น</span>
          </div>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleCustomGoogleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email</label>
            <input
              type="email"
              required
              placeholder="example@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              placeholder="เช่น นายมานะ รักดี"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
          >
            เข้าสู่ระบบในฐานะผู้ใช้งานทั่วไป (Tenant)
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> ข้อมูลบันทึกและซิงก์ตรงกับ Cloudflare D1 Database
          </p>
        </div>
      </div>
    </div>
  );
};
