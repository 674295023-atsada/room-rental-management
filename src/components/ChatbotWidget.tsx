import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  Trash2, 
  Minimize2, 
  Maximize2,
  Settings,
  Key,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { User } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  engine?: string;
  timestamp: string;
}

interface ChatbotWidgetProps {
  currentUser: User | null;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);

  // Gemini Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [isGeminiSaved, setIsGeminiSaved] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isGeminiActive, setIsGeminiActive] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  // Check if Gemini is configured on mount
  useEffect(() => {
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => {
        if (data.geminiConfigured) {
          setIsGeminiActive(true);
        }
      })
      .catch(() => {});
  }, []);

  const defaultGreeting: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `สวัสดีครับคุณ ${currentUser?.name || 'ผู้เข้าพัก'} 👋 ผมคือ **น้องสบายใจ AI** ผู้ช่วยอัจฉริยะประจำหอพัก ขับเคลื่อนด้วย **Google Gemini AI**\n\nมีคำถามเกี่ยวกับค่าเช่า ค่าน้ำ-ไฟ แจ้งซ่อม หรือกฎระเบียบ สามารถสอบถามผมได้ตลอดเวลาเลยครับ! ✨`,
    engine: isGeminiActive ? 'Google Gemini 1.5 Flash' : undefined,
    timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sabaijai_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return [defaultGreeting];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized && !isSettingsOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isLoading, isSettingsOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('sabaijai_chat_history', JSON.stringify(messages.slice(-20)));
    } catch {
      // storage full
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history,
          user: currentUser ? {
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role
          } : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'ขออภัยครับ ไม่สามารถรับคำตอบได้ในขณะนี้',
          engine: data.engine,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
        if (data.engine && data.engine.includes('Gemini')) {
          setIsGeminiActive(true);
        }
      } else {
        throw new Error('API response failed');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้จัดการหอพักโทร 081-999-8888 ครับ 🙏',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKeyInput.trim()) return;

    setIsSavingKey(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_GEMINI_KEY',
          apiKey: geminiKeyInput.trim()
        })
      });

      if (res.ok) {
        setIsGeminiSaved(true);
        setIsGeminiActive(true);
        setTimeout(() => {
          setIsSettingsOpen(false);
          setIsGeminiSaved(false);
          setGeminiKeyInput('');
        }, 1500);

        // System notification message
        setMessages(prev => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: 'assistant',
            content: '✨ **เชื่อมต่อกับ Google Gemini AI สำเร็จเรียบร้อยแล้ว!** ตอนนี้น้องสบายใจทำงานด้วยโมเดล `gemini-1.5-flash` ตัวจริง สามารถคุยตอบคำถามได้อย่างชาญฉลาดแล้วครับ 🚀',
            engine: 'Google Gemini 1.5 Flash (Live)',
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        alert('บันทึกคีย์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกคีย์');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('ต้องการล้างประวัติการสนทนาทั้งหมดใช่หรือไม่?')) {
      setMessages([defaultGreeting]);
      localStorage.removeItem('sabaijai_chat_history');
    }
  };

  // Quick suggestion chips
  const tenantChips = [
    '💳 บิลค่าเช่าเดือนนี้',
    '⚡ อัตราค่าน้ำ-ค่าไฟ',
    '📲 ช่องทางชำระเงิน',
    '🔧 วิธีแจ้งซ่อมบำรุง',
    '📜 กฎระเบียบหอพัก',
    '📞 ติดต่อผู้จัดการ'
  ];

  const adminChips = [
    '📊 สรุปห้องว่างและคนเช่า',
    '⚠️ ยอดค้างชำระทั้งหมด',
    '🛠️ งานแจ้งซ่อมที่ค้างอยู่',
    '⚡ อัตราค่าน้ำ-ไฟปัจจุบัน',
    '📞 ข้อมูลติดต่อผู้จัดการ'
  ];

  const chips = isAdmin ? adminChips : tenantChips;

  // Simple Markdown-like formatter for bullet points, bold text and line breaks
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block leading-relaxed min-h-[1.25rem]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={pIdx} className="px-1.5 py-0.5 bg-slate-100 text-blue-700 font-mono text-[11px] rounded">{part.slice(1, -1)}</code>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {hasUnreadNotice && (
            <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-xl border border-blue-100 text-xs font-semibold text-slate-700 animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>คุยกับ Google Gemini AI ผู้ช่วยหอพักได้ที่นี่</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setHasUnreadNotice(false); }}
                className="text-slate-400 hover:text-slate-600 ml-1"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setHasUnreadNotice(false);
            }}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="เปิดแชทกับ AI ผู้ช่วย"
          >
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></span>
            <Sparkles className="w-7 h-7 transition-transform group-hover:rotate-12" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[430px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden transition-all duration-300 ${
          isMinimized ? 'h-[72px]' : 'h-[590px] max-h-[85vh]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-indigo-700"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">น้องสบายใจ AI</h3>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Google Gemini
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span>● {isGeminiActive ? 'Gemini 1.5 Flash' : 'Cloudflare D1'}</span>
                  <span>&bull;</span>
                  <span>ออนไลน์ 24 ชม.</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="ตั้งค่า Google Gemini API Key"
                className={`p-1.5 rounded-lg transition text-xs ${
                  isSettingsOpen ? 'bg-white/30 text-white' : 'hover:bg-white/10 text-blue-100 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearHistory}
                title="ล้างประวัติการคุย"
                className="p-1.5 hover:bg-white/10 rounded-lg text-blue-100 hover:text-white transition text-xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'ขยาย' : 'ย่อ'}
                className="p-1.5 hover:bg-white/10 rounded-lg text-blue-100 hover:text-white transition"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="ปิดหน้าต่าง"
                className="p-1.5 hover:bg-white/10 rounded-lg text-blue-100 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (Visible when not minimized) */}
          {!isMinimized && (
            <>
              {/* Settings Screen */}
              {isSettingsOpen ? (
                <div className="flex-1 p-5 overflow-y-auto bg-slate-50 text-xs space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-sm text-slate-800">ตั้งค่า Google Gemini API Key</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      เชื่อมต่อกับ **Google Gemini 1.5 Flash AI** ตัวจริง โดยใส่ API Key จาก Google AI Studio เพื่อให้ AI ฉลาด ตอบคำถามภาษาไทยได้แม่นยำที่สุด
                    </p>

                    <form onSubmit={handleSaveGeminiKey} className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Gemini API Key (ขึ้นต้นด้วย AIzaSy...)
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="AIzaSy..."
                          value={geminiKeyInput}
                          onChange={(e) => setGeminiKeyInput(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      {isGeminiSaved && (
                        <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>บันทึกคีย์ลง Cloudflare D1 เรียบร้อยแล้ว!</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSavingKey || !geminiKeyInput.trim()}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition shadow-sm text-xs"
                        >
                          {isSavingKey ? 'กำลังบันทึก...' : 'บันทึกคีย์ลงฐานข้อมูล D1'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsSettingsOpen(false)}
                          className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200/80 rounded-2xl space-y-2 text-blue-900">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>วิธีรับ Gemini API Key ฟรี:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
                      <li>เข้าเว็บ Google AI Studio ที่ปุ่มด้านล่าง</li>
                      <li>ล็อกอินด้วยบัญชี Google แล้วกด <strong>"Get API key"</strong></li>
                      <li>คัดลอกคีย์มาวางในช่องด้านบนได้เลยครับ (ฟรี 100%)</li>
                    </ol>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
                    >
                      <span>ไปยัง Google AI Studio เพื่อรับ Key ฟรี</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Message List */
                <>
                  <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${
                          msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Avatar */}
                        {msg.role === 'assistant' ? (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 text-[10px] font-bold">
                            {currentUser?.name ? currentUser.name[0] : 'U'}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div className={`max-w-[82%] rounded-2xl p-3.5 shadow-sm space-y-1 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-700 border border-slate-200/80 rounded-tl-none'
                        }`}>
                          <div className="text-xs break-words">
                            {renderFormattedText(msg.content)}
                          </div>
                          <div className="flex items-center justify-between pt-1 gap-2 border-t border-slate-100/40 text-[9px]">
                            {msg.engine && (
                              <span className="text-blue-600 font-semibold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> {msg.engine}
                              </span>
                            )}
                            <span className={`ml-auto ${
                              msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                            }`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isLoading && (
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]"></span>
                          <span className="text-[10px] text-slate-400 ml-1">น้องสบายใจ (Gemini AI) กำลังคิดคำตอบ...</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Prompt Chips */}
                  <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip.replace(/^[^\s]+\s/, ''))}
                        disabled={isLoading}
                        className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-medium transition border border-transparent hover:border-blue-200 active:scale-95 disabled:opacity-50"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="p-3 bg-white border-t border-slate-200">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="พิมพ์คำถามของคุณที่นี่ เช่น ค่าเช่า, แจ้งซ่อม..."
                        disabled={isLoading}
                        className="flex-1 text-xs border border-slate-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition"
                      />
                      <button
                        type="submit"
                        disabled={!inputText.trim() || isLoading}
                        className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:bg-slate-200 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 hover:shadow-md transition active:scale-95 flex items-center justify-center"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400 px-1">
                      <span>💡 Powered by Google Gemini 1.5 Flash</span>
                      <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <Key className="w-2.5 h-2.5" />
                        <span>ตั้งค่า Gemini Key</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
