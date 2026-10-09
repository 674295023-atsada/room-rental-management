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
  ChevronDown,
  User as UserIcon,
  HelpCircle,
  Zap
} from 'lucide-react';
import { User } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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

  const isAdmin = currentUser?.role === 'ADMIN';

  const defaultGreeting: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `สวัสดีครับคุณ ${currentUser?.name || 'ผู้เข้าพัก'} 👋 ผมคือ **น้องสบายใจ AI** ผู้ช่วยอัจฉริยะประจำหอพัก\n\nมีคำถามเกี่ยวกับค่าเช่า ค่าน้ำ-ไฟ แจ้งซ่อม หรือกฎระเบียบ สอบถามผมได้ตลอด 24 ชั่วโมงเลยครับ! ✨`,
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
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isLoading]);

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
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
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
      // Bold replacer: **text**
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
              <span>มีคำถาม? คุยกับน้องสบายใจ AI ได้เลย</span>
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
            <Bot className="w-7 h-7 transition-transform group-hover:rotate-12" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden transition-all duration-300 ${
          isMinimized ? 'h-[72px]' : 'h-[580px] max-h-[85vh]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-indigo-700"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">น้องสบายใจ AI</h3>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">Edge AI</span>
                </div>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span>● เชื่อมต่อฐานข้อมูล D1</span>
                  <span>&bull;</span>
                  <span>ออนไลน์ 24 ชม.</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
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
              {/* Message List */}
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
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <Bot className="w-4 h-4" />
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
                      <span className={`block text-[9px] text-right ${
                        msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[10px] text-slate-400 ml-1">น้องสบายใจกำลังคิดคำตอบ...</span>
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
                <div className="mt-1.5 text-center">
                  <span className="text-[9px] text-slate-400">
                    💡 พัฒนาด้วย Cloudflare Workers AI & D1 Database
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
