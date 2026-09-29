import React, { useState } from 'react';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Eye, 
  FileText, 
  Printer, 
  Check, 
  X,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';

interface InvoicePaymentViewProps {
  invoices: Invoice[];
  onUpdateInvoices: (invoices: Invoice[]) => void;
}

export const InvoicePaymentView: React.FC<InvoicePaymentViewProps> = ({ invoices, onUpdateInvoices }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [slipUrlInput, setSlipUrlInput] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'ALL') return true;
    return inv.status === filter;
  });

  const handleApprovePayment = (invoiceId: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'PAID' as InvoiceStatus,
          paidAt: new Date().toLocaleString('th-TH'),
          approvedBy: 'ผู้จัดการหอพัก'
        };
      }
      return inv;
    });

    onUpdateInvoices(updated);
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice({
        ...selectedInvoice,
        status: 'PAID',
        paidAt: new Date().toLocaleString('th-TH'),
        approvedBy: 'ผู้จัดการหอพัก'
      });
    }
  };

  const handleAttachSlip = (invoiceId: string) => {
    const dummySlip = slipUrlInput || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60';
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'AWAITING_APPROVAL' as InvoiceStatus,
          paymentSlipUrl: dummySlip
        };
      }
      return inv;
    });

    onUpdateInvoices(updated);
    setIsSlipModalOpen(false);
    setSlipUrlInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ใบแจ้งหนี้และการชำระเงิน (Invoices & Payments)</h2>
          <p className="text-xs text-slate-500 mt-1">
            ทั้งหมด {invoices.length} ใบ &bull; 
            ชำระแล้ว {invoices.filter(i => i.status === 'PAID').length} ใบ &bull; 
            รอตรวจสอบสลิป {invoices.filter(i => i.status === 'AWAITING_APPROVAL').length} ใบ
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            ทั้งหมด ({invoices.length})
          </button>
          <button
            onClick={() => setFilter('AWAITING_APPROVAL')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'AWAITING_APPROVAL' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'}`}
          >
            รอตรวจสลิป ({invoices.filter(i => i.status === 'AWAITING_APPROVAL').length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'PENDING' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
          >
            รอชำระ ({invoices.filter(i => i.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'PAID' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
          >
            ชำระแล้ว ({invoices.filter(i => i.status === 'PAID').length})
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">เลขที่บิล / ห้อง</th>
                <th className="px-5 py-3.5">ผู้เช่า</th>
                <th className="px-5 py-3.5">ยอดรวม</th>
                <th className="px-5 py-3.5">กำหนดชำระ</th>
                <th className="px-5 py-3.5">สถานะ</th>
                <th className="px-5 py-3.5">หลักฐานสลิป</th>
                <th className="px-5 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4">
                    <span className="font-extrabold text-blue-700 text-base block">ห้อง {inv.roomNumber}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{inv.invoiceNumber}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{inv.tenantName}</p>
                    <span className="text-[11px] text-slate-400">รอบบิล {inv.monthYear}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-base font-extrabold text-slate-900">
                      ฿{inv.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    {inv.dueDate}
                  </td>
                  <td className="px-5 py-4">
                    {inv.status === 'PAID' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ชำระแล้ว
                      </span>
                    )}
                    {inv.status === 'AWAITING_APPROVAL' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                        <Clock className="w-3 h-3 text-amber-600" /> รออนุมัติสลิป
                      </span>
                    )}
                    {inv.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        รอชำระเงิน
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {inv.paymentSlipUrl ? (
                      <a
                        href={inv.paymentSlipUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> ดูภาพสลิป
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsSlipModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-medium"
                      >
                        <Upload className="w-3.5 h-3.5" /> แนบสลิป
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setIsReceiptModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      ใบแจ้งหนี้ / ใบเสร็จ
                    </button>

                    {inv.status === 'AWAITING_APPROVAL' && (
                      <button
                        onClick={() => handleApprovePayment(inv.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        ✓ อนุมัติยอด
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice / Receipt View Modal */}
      {isReceiptModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-800 text-base">
                  {selectedInvoice.status === 'PAID' ? 'ใบเสร็จรับเงิน (Receipt)' : 'ใบแจ้งหนี้ค่าเช่าห้องพัก (Invoice)'}
                </span>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Paper Preview */}
            <div className="mt-4 p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-slate-200">
                <h4 className="text-base font-bold text-slate-800">หอพักบ้านสบายใจ (Baan Sabaijai)</h4>
                <p className="text-slate-500 text-[11px]">123/45 ซอยสุขสวัสดิ์ กรุงเทพมหานคร โทร 02-123-4567</p>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full font-bold text-[11px] ${
                  selectedInvoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedInvoice.status === 'PAID' ? '✓ ชำระเงินเรียบร้อยแล้ว' : 'รอชำระเงิน'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <p><span className="text-slate-400">เลขที่เอกสาร:</span> <span className="font-mono font-bold text-slate-800">{selectedInvoice.invoiceNumber}</span></p>
                <p className="text-right"><span className="text-slate-400">รอบบิล:</span> {selectedInvoice.monthYear}</p>
                <p><span className="text-slate-400">ห้องพัก:</span> <span className="font-bold text-blue-700">ห้อง {selectedInvoice.roomNumber}</span></p>
                <p className="text-right"><span className="text-slate-400">ผู้เช่า:</span> {selectedInvoice.tenantName}</p>
                <p><span className="text-slate-400">กำหนดชำระ:</span> {selectedInvoice.dueDate}</p>
                {selectedInvoice.paidAt && (
                  <p className="text-right text-emerald-700 font-semibold"><span className="text-slate-400">วันที่ชำระ:</span> {selectedInvoice.paidAt}</p>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">รายการ</th>
                      <th className="p-2 text-right">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2 text-slate-700">{item.description}</td>
                        <td className="p-2 text-right font-medium text-slate-800">฿{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-extrabold text-sm">
                      <td className="p-2.5 text-slate-900">ยอดรวมสุทธิ</td>
                      <td className="p-2.5 text-right text-blue-700">฿{selectedInvoice.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedInvoice.paymentSlipUrl && (
                <div className="pt-2">
                  <p className="font-bold text-slate-700 mb-1">หลักฐานสลิปการโอนเงิน:</p>
                  <img
                    src={selectedInvoice.paymentSlipUrl}
                    alt="Slip Preview"
                    className="max-h-48 rounded-lg border border-slate-300 mx-auto object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                <Printer className="w-4 h-4" /> พิมพ์เอกสาร
              </button>

              <div className="space-x-2">
                {selectedInvoice.status === 'AWAITING_APPROVAL' && (
                  <button
                    onClick={() => {
                      handleApprovePayment(selectedInvoice.id);
                      setIsReceiptModalOpen(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    อนุมัติการชำระเงิน
                  </button>
                )}
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attach Slip Modal */}
      {isSlipModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="font-bold text-slate-800 text-base mb-2">แนบสลิปการโอนเงิน (ห้อง {selectedInvoice.roomNumber})</h3>
            <p className="text-xs text-slate-500 mb-4">ยอดชำระ: ฿{selectedInvoice.totalAmount.toLocaleString()} บาท</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ลิงก์รูปภาพสลิป หรือตัวอย่างจำลอง</label>
                <input
                  type="text"
                  placeholder="https://... หรือปล่อยว่างเพื่อใช้สลิปทดสอบ"
                  value={slipUrlInput}
                  onChange={(e) => setSlipUrlInput(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  onClick={() => setIsSlipModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleAttachSlip(selectedInvoice.id)}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  ยืนยันการแนบสลิป
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
