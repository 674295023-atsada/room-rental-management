import React, { useState } from 'react';
import { 
  CloudUpload, 
  GitBranch, 
  Key, 
  Terminal, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  ShieldCheck, 
  Zap,
  Globe
} from 'lucide-react';

export const DeploymentGuideView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <CloudUpload className="w-8 h-8 text-white" />
          <h2 className="text-2xl font-bold">Cloudflare Pages Automated Deployment</h2>
        </div>
        <p className="text-orange-100 text-sm max-w-2xl leading-relaxed">
          ระบบได้รับการตั้งค่าพร้อมสำหรับ Deploy ขึ้นระบบ Cloudflare Pages แบบอัตโนมัติ 100% ผ่าน 
          <span className="font-bold text-white underline mx-1">GitHub Actions CI/CD</span> 
          เมื่อคุณ Push โค้ดขึ้น Branch <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono">main</code>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1: Automated CI/CD with GitHub Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">ระบบ Deploy อัตโนมัติ (GitHub Actions CI/CD)</h3>
              <p className="text-xs text-slate-500">ไฟล์ Workflow ถูกสร้างไว้แล้วที่ <code className="text-blue-600 font-mono">.github/workflows/deploy-cloudflare.yml</code></p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            เพียงนำ Repository นี้ขึ้น GitHub และเพิ่ม Secrets 2 ค่าใน GitHub Repo Settings (Settings &rarr; Secrets and variables &rarr; Actions):
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-800 block">CLOUDFLARE_API_TOKEN</span>
                <span className="text-[11px] text-slate-500">สร้าง Token ได้จาก Cloudflare Dashboard &rarr; My Profile &rarr; API Tokens</span>
              </div>
              <button
                onClick={() => copyToClipboard('CLOUDFLARE_API_TOKEN', 'token')}
                className="text-xs text-slate-600 hover:text-blue-600 p-1.5 rounded-lg border border-slate-200 bg-white"
              >
                {copiedKey === 'token' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-800 block">CLOUDFLARE_ACCOUNT_ID</span>
                <span className="text-[11px] text-slate-500">ดูได้จากหน้า URL หรือ Overview ใน Cloudflare Dashboard</span>
              </div>
              <button
                onClick={() => copyToClipboard('CLOUDFLARE_ACCOUNT_ID', 'acc')}
                className="text-xs text-slate-600 hover:text-blue-600 p-1.5 rounded-lg border border-slate-200 bg-white"
              >
                {copiedKey === 'acc' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 mb-1 text-blue-800">
              <Zap className="w-4 h-4 text-blue-600" /> กลไกการทำงานของ CI/CD:
            </p>
            1. ตรวจสอบโค้ด & Build Productive Assets (<code className="font-mono bg-blue-100/80 px-1 rounded">npm run build</code>)<br/>
            2. เชื่อมต่อ Cloudflare Edge ผ่าน <code className="font-mono bg-blue-100/80 px-1 rounded">wrangler pages deploy</code><br/>
            3. เผยแพร่เว็บแอปพลิเคชันขึ้นสู่ CDN ระดับโลก พร้อม SSL ทันที
          </div>
        </div>

        {/* Method 2: Direct CLI Deployment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Deploy ผ่านคำสั่งในเครื่องทันที (CLI)</h3>
              <p className="text-xs text-slate-500">ใช้คำสั่ง Wrangler จาก Command Line</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            หากต้องการ Deploy จากเครื่องคอมพิวเตอร์ของคุณโดยตรงทันที สามารถพิมพ์คำสั่งต่อไปนี้:
          </p>

          <div className="p-3 bg-slate-900 rounded-xl text-slate-100 font-mono text-xs space-y-2">
            <p className="text-slate-400"># 1. ล็อกอินบัญชี Cloudflare ของคุณ</p>
            <div className="flex items-center justify-between text-emerald-400">
              <span>npx wrangler login</span>
              <button
                onClick={() => copyToClipboard('npx wrangler login', 'cmd1')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'cmd1' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-slate-400 mt-2"># 2. Build และ Deploy สู่ Cloudflare Pages</p>
            <div className="flex items-center justify-between text-emerald-400">
              <span>npm run build && npx wrangler pages deploy dist --project-name=room-rental-management</span>
              <button
                onClick={() => copyToClipboard('npm run build && npx wrangler pages deploy dist --project-name=room-rental-management', 'cmd2')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'cmd2' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900">
            <p className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800">
              <Globe className="w-4 h-4 text-emerald-600" /> การเข้าถึงหลัง Deploy:
            </p>
            เว็บจะออนไลน์ทันทีที่ <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded font-bold">https://room-rental-management.pages.dev</code> และสามารถผูก Custom Domain ของตนเองได้ฟรี
          </div>
        </div>
      </div>
    </div>
  );
};
