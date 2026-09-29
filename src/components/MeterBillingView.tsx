import React, { useState } from 'react';
import { Gauge, Droplet, Zap, AlertCircle, CheckCircle2, Save, FileText } from 'lucide-react';
import { MeterReading, Room, Invoice, InvoiceItem } from '../types';
import { SystemRates } from '../services/storage';

interface MeterBillingViewProps {
  rooms: Room[];
  meters: MeterReading[];
  rates: SystemRates;
  invoices: Invoice[];
  onUpdateMeters: (meters: MeterReading[]) => void;
  onUpdateInvoices: (invoices: Invoice[]) => void;
  onUpdateRates: (rates: SystemRates) => void;
  onNavigateToInvoices: () => void;
}

export const MeterBillingView: React.FC<MeterBillingViewProps> = ({
  rooms,
  meters,
  rates,
  invoices,
  onUpdateMeters,
  onUpdateInvoices,
  onUpdateRates,
  onNavigateToInvoices
}) => {
  const currentMonthYear = '2026-09';
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED');

  // Local state for meter readings edit grid
  const [readingInputs, setReadingInputs] = useState<Record<string, { currWater: number; currElectric: number }>>(() => {
    const initial: Record<string, { currWater: number; currElectric: number }> = {};
    occupiedRooms.forEach(room => {
      const existing = meters.find(m => m.roomId === room.id && m.monthYear === currentMonthYear);
      if (existing) {
        initial[room.id] = { currWater: existing.currWater, currElectric: existing.currElectric };
      } else {
        // default placeholder
        initial[room.id] = { currWater: 0, currElectric: 0 };
      }
    });
    return initial;
  });

  const [notification, setNotification] = useState<string | null>(null);

  const getPreviousReading = (roomId: string) => {
    // Find the latest reading for this room
    const existing = meters.find(m => m.roomId === roomId);
    return {
      prevWater: existing ? existing.currWater : 100,
      prevElectric: existing ? existing.currElectric : 300
    };
  };

  const handleInputChange = (roomId: string, field: 'currWater' | 'currElectric', value: number) => {
    setReadingInputs(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: Number(value)
      }
    }));
  };

  const handleSaveAllMeters = () => {
    let hasValidationError = false;
    const newMeters: MeterReading[] = [];

    for (const room of occupiedRooms) {
      const prev = getPreviousReading(room.id);
      const current = readingInputs[room.id] || { currWater: prev.prevWater, currElectric: prev.prevElectric };

      if (current.currWater < prev.prevWater || current.currElectric < prev.prevElectric) {
        alert(`ข้อผิดพลาดห้อง ${room.roomNumber}: เลขมิเตอร์ปัจจุบันต้องไม่น้อยกว่างวดก่อนหน้า (น้ำก่อนหน้า: ${prev.prevWater}, ไฟก่อนหน้า: ${prev.prevElectric})`);
        hasValidationError = true;
        return;
      }

      const waterUnits = current.currWater - prev.prevWater;
      const electricUnits = current.currElectric - prev.prevElectric;

      newMeters.push({
        id: `m-${room.roomNumber}-${currentMonthYear}`,
        roomId: room.id,
        roomNumber: room.roomNumber,
        monthYear: currentMonthYear,
        prevWater: prev.prevWater,
        currWater: current.currWater,
        waterUnits,
        waterRate: rates.waterRate,
        waterAmount: waterUnits * rates.waterRate,
        prevElectric: prev.prevElectric,
        currElectric: current.currElectric,
        electricUnits,
        electricRate: rates.electricRate,
        electricAmount: electricUnits * rates.electricRate,
        readingDate: new Date().toISOString().split('T')[0],
        isBilled: false
      });
    }

    if (!hasValidationError) {
      onUpdateMeters(newMeters);
      setNotification('บันทึกเลขอ่านมิเตอร์สำเร็จเรียบร้อย!');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleGenerateInvoices = () => {
    // Generate invoices for all occupied rooms based on meters and room base rent
    const generated: Invoice[] = [];
    const updatedMeters = [...meters];

    occupiedRooms.forEach(room => {
      const meter = updatedMeters.find(m => m.roomId === room.id && m.monthYear === currentMonthYear);
      const waterUnits = meter ? meter.waterUnits : 5;
      const waterCost = meter ? meter.waterAmount : waterUnits * rates.waterRate;
      const electricUnits = meter ? meter.electricUnits : 60;
      const electricCost = meter ? meter.electricAmount : electricUnits * rates.electricRate;

      const items: InvoiceItem[] = [
        { description: `ค่าเช่าห้องพัก (ห้อง ${room.roomNumber})`, amount: room.baseRent },
        { description: `ค่าน้ำประปา (${waterUnits} หน่วย @ ${rates.waterRate} บาท)`, units: waterUnits, rate: rates.waterRate, amount: waterCost },
        { description: `ค่าไฟฟ้า (${electricUnits} หน่วย @ ${rates.electricRate} บาท)`, units: electricUnits, rate: rates.electricRate, amount: electricCost },
        { description: 'ค่าส่วนกลางและขยะ', amount: rates.commonFee }
      ];

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      // Check if invoice already exists
      const existingInvIndex = invoices.findIndex(i => i.roomId === room.id && i.monthYear === currentMonthYear);

      const invoice: Invoice = {
        id: `inv-${room.roomNumber}-${currentMonthYear.replace('-', '')}`,
        invoiceNumber: `INV-${currentMonthYear.replace('-', '')}-${room.roomNumber}`,
        roomId: room.id,
        roomNumber: room.roomNumber,
        tenantName: room.currentTenant?.name || 'ผู้เช่า',
        monthYear: currentMonthYear,
        items,
        totalAmount,
        dueDate: '2026-10-05',
        status: existingInvIndex >= 0 ? invoices[existingInvIndex].status : 'PENDING'
      };

      generated.push(invoice);

      if (meter) {
        meter.isBilled = true;
      }
    });

    onUpdateInvoices(generated);
    onUpdateMeters(updatedMeters);
    alert(`สร้างใบแจ้งหนี้ประจำงวด ${currentMonthYear} จำนวน ${generated.length} ใบเสร็จสมบูรณ์!`);
    onNavigateToInvoices();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">จดมิเตอร์น้ำ-ไฟ และคำนวณค่ายูนิต</h2>
          <p className="text-xs text-slate-500 mt-1">
            รอบบิล: <span className="font-semibold text-blue-700">{currentMonthYear}</span> &bull; 
            อัตราค่าน้ำ ฿{rates.waterRate}/หน่วย &bull; ค่าไฟ ฿{rates.electricRate}/หน่วย &bull; ส่วนกลาง ฿{rates.commonFee}/ห้อง
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAllMeters}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกเลขอ่าน</span>
          </button>

          <button
            onClick={handleGenerateInvoices}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>ออกบิลทั้งหอพัก ({occupiedRooms.length} ห้อง)</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Meter Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">ห้องพัก / ผู้เช่า</th>
                <th className="px-5 py-3.5 bg-blue-50/50 text-blue-900">
                  <div className="flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <span>มิเตอร์น้ำ (฿{rates.waterRate}/หน่วย)</span>
                  </div>
                </th>
                <th className="px-5 py-3.5 bg-amber-50/50 text-amber-900">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>มิเตอร์ไฟฟ้า (฿{rates.electricRate}/หน่วย)</span>
                  </div>
                </th>
                <th className="px-5 py-3.5 text-right">รวมค่าน้ำ-ไฟงวดนี้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {occupiedRooms.map(room => {
                const prev = getPreviousReading(room.id);
                const current = readingInputs[room.id] || { currWater: prev.prevWater, currElectric: prev.prevElectric };
                
                const waterUnits = Math.max(0, (current.currWater || 0) - prev.prevWater);
                const electricUnits = Math.max(0, (current.currElectric || 0) - prev.prevElectric);

                const waterCost = waterUnits * rates.waterRate;
                const electricCost = electricUnits * rates.electricRate;
                const totalUtilityCost = waterCost + electricCost;

                const isWaterInvalid = current.currWater > 0 && current.currWater < prev.prevWater;
                const isElectricInvalid = current.currElectric > 0 && current.currElectric < prev.prevElectric;

                return (
                  <tr key={room.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <span className="font-extrabold text-slate-800 text-base block">ห้อง {room.roomNumber}</span>
                      <span className="text-xs text-slate-500">{room.currentTenant?.name || 'มีผู้เช่า'}</span>
                    </td>

                    {/* Water Column */}
                    <td className="px-5 py-4 bg-blue-50/20">
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-slate-500 font-mono">
                          <span className="text-slate-400 block text-[10px]">ก่อนหน้า</span>
                          {prev.prevWater}
                        </div>
                        <span className="text-slate-300">&rarr;</span>
                        <div>
                          <span className="text-slate-400 block text-[10px]">งวดปัจจุบัน</span>
                          <input
                            type="number"
                            value={current.currWater || ''}
                            onChange={(e) => handleInputChange(room.id, 'currWater', Number(e.target.value))}
                            placeholder={prev.prevWater.toString()}
                            className={`w-24 px-2 py-1 text-xs font-mono font-bold rounded-lg border focus:outline-none ${
                              isWaterInvalid 
                                ? 'border-rose-500 bg-rose-50 text-rose-700' 
                                : 'border-slate-300 focus:border-blue-500'
                            }`}
                          />
                        </div>
                        <div className="text-xs text-blue-700 font-medium">
                          +{waterUnits} หน่วย = ฿{waterCost.toLocaleString()}
                        </div>
                      </div>
                      {isWaterInvalid && (
                        <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3" /> เลขปัจจุบันต่ำกว่างวดก่อนหน้า
                        </p>
                      )}
                    </td>

                    {/* Electric Column */}
                    <td className="px-5 py-4 bg-amber-50/20">
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-slate-500 font-mono">
                          <span className="text-slate-400 block text-[10px]">ก่อนหน้า</span>
                          {prev.prevElectric}
                        </div>
                        <span className="text-slate-300">&rarr;</span>
                        <div>
                          <span className="text-slate-400 block text-[10px]">งวดปัจจุบัน</span>
                          <input
                            type="number"
                            value={current.currElectric || ''}
                            onChange={(e) => handleInputChange(room.id, 'currElectric', Number(e.target.value))}
                            placeholder={prev.prevElectric.toString()}
                            className={`w-24 px-2 py-1 text-xs font-mono font-bold rounded-lg border focus:outline-none ${
                              isElectricInvalid 
                                ? 'border-rose-500 bg-rose-50 text-rose-700' 
                                : 'border-slate-300 focus:border-amber-500'
                            }`}
                          />
                        </div>
                        <div className="text-xs text-amber-700 font-medium">
                          +{electricUnits} หน่วย = ฿{electricCost.toLocaleString()}
                        </div>
                      </div>
                      {isElectricInvalid && (
                        <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3" /> เลขปัจจุบันต่ำกว่างวดก่อนหน้า
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="font-extrabold text-slate-800 text-sm">
                        ฿{totalUtilityCost.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
