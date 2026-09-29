import React, { useEffect, useState, useRef } from 'react';
import { Building2, Shield, Lock, AlertCircle, Database } from 'lucide-react';
import { AuthService, GOOGLE_CLIENT_ID } from '../services/auth';
import { User } from '../types';

declare global {
  interface Window {
    google?: any;
  }
}

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services
  useEffect(() => {
    let interval: any;

    const checkGSI = () => {
      if (window.google?.accounts?.id) {
        setGsiLoaded(true);
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: 280
            });
          }
        } catch (err: any) {
          console.error('Google GSI init error:', err);
        }
        clearInterval(interval);
      }
    };

    interval = setInterval(checkGSI, 300);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      setErrorMsg('ไม่ได้รับข้อมูลรับรองจาก Google');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await AuthService.loginWithGoogleCredential(response.credential);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'การเข้าสู่ระบบผ่าน Google ขัดข้อง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">ระบบจัดการเช่าห้องพัก</h2>
          <p className="text-xs text-slate-500 font-medium">Smart Room Rental Management</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold mt-1">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>เชื่อมต่อ Cloudflare D1 Database</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs text-slate-600 leading-relaxed text-left">
          <div className="flex items-center gap-2 mb-1 text-blue-800 font-bold">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>เข้าสู่ระบบด้วยบัญชี Google</span>
          </div>
          กรุณากดปุ่มด้านล่างเพื่อเข้าสู่ระบบด้วย Google โดยระบบจะตรวจสอบสิทธิ์ผู้ดูแลระบบตามบัญชีที่ได้รับอนุญาต
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Official Google Sign-In Button ONLY */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div ref={googleBtnRef} className="flex justify-center min-h-[44px]"></div>
          
          {!gsiLoaded && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              กำลังโหลดปุ่ม Google Sign-In...
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              กำลังยืนยันตัวตนกับ Google...
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1 font-mono">
            <Lock className="w-3 h-3 text-slate-400" />
            Google OAuth 2.0 &bull; Cloudflare D1
          </p>
        </div>
      </div>
    </div>
  );
};
