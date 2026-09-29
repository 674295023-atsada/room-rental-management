import { Room, LeaseContract, MeterReading, Invoice, MaintenanceTicket } from '../types';

export const INITIAL_ROOMS: Room[] = [
  { id: 'r-101', roomNumber: '101', floor: 1, type: 'Standard', baseRent: 4500, status: 'OCCUPIED', currentTenant: { id: 't-1', name: 'สมชาย รักสงบ', phone: '081-234-5678', leaseId: 'l-101' } },
  { id: 'r-102', roomNumber: '102', floor: 1, type: 'Standard', baseRent: 4500, status: 'OCCUPIED', currentTenant: { id: 't-2', name: 'วิภาดา ใจดี', phone: '089-876-5432', leaseId: 'l-102' } },
  { id: 'r-103', roomNumber: '103', floor: 1, type: 'Deluxe', baseRent: 5500, status: 'VACANT' },
  { id: 'r-104', roomNumber: '104', floor: 1, type: 'Deluxe', baseRent: 5500, status: 'MAINTENANCE' },
  { id: 'r-201', roomNumber: '201', floor: 2, type: 'Standard', baseRent: 4500, status: 'OCCUPIED', currentTenant: { id: 't-3', name: 'กิตติศักดิ์ มั่งมี', phone: '086-112-2334', leaseId: 'l-201' } },
  { id: 'r-202', roomNumber: '202', floor: 2, type: 'Standard', baseRent: 4500, status: 'VACANT' },
  { id: 'r-203', roomNumber: '203', floor: 2, type: 'Deluxe', baseRent: 5500, status: 'OCCUPIED', currentTenant: { id: 't-4', name: 'ณัฐชา สว่างจิต', phone: '095-555-8899', leaseId: 'l-203' } },
  { id: 'r-204', roomNumber: '204', floor: 2, type: 'Studio', baseRent: 6000, status: 'OCCUPIED', currentTenant: { id: 't-5', name: 'ธีรพงษ์ เจริญผล', phone: '084-333-2211', leaseId: 'l-204' } },
  { id: 'r-301', roomNumber: '301', floor: 3, type: 'Studio', baseRent: 6000, status: 'VACANT' },
  { id: 'r-302', roomNumber: '302', floor: 3, type: 'Suite', baseRent: 7500, status: 'OCCUPIED', currentTenant: { id: 't-6', name: 'อารยา ทรงศิลป์', phone: '092-444-6677', leaseId: 'l-302' } },
  { id: 'r-303', roomNumber: '303', floor: 3, type: 'Suite', baseRent: 7500, status: 'VACANT' },
  { id: 'r-304', roomNumber: '304', floor: 3, type: 'Deluxe', baseRent: 5500, status: 'OCCUPIED', currentTenant: { id: 't-7', name: 'ปกรณ์ มีสุข', phone: '088-777-9911', leaseId: 'l-304' } },
];

export const INITIAL_LEASES: LeaseContract[] = [
  { id: 'l-101', roomId: 'r-101', roomNumber: '101', tenantId: 't-1', tenantName: 'สมชาย รักสงบ', tenantPhone: '081-234-5678', startDate: '2026-01-01', endDate: '2026-12-31', monthlyRent: 4500, securityDeposit: 9000, status: 'ACTIVE' },
  { id: 'l-102', roomId: 'r-102', roomNumber: '102', tenantId: 't-2', tenantName: 'วิภาดา ใจดี', tenantPhone: '089-876-5432', startDate: '2026-03-01', endDate: '2027-02-28', monthlyRent: 4500, securityDeposit: 9000, status: 'ACTIVE' },
  { id: 'l-201', roomId: 'r-201', roomNumber: '201', tenantId: 't-3', tenantName: 'กิตติศักดิ์ มั่งมี', tenantPhone: '086-112-2334', startDate: '2026-05-15', endDate: '2027-05-14', monthlyRent: 4500, securityDeposit: 9000, status: 'ACTIVE' },
  { id: 'l-203', roomId: 'r-203', roomNumber: '203', tenantId: 't-4', tenantName: 'ณัฐชา สว่างจิต', tenantPhone: '095-555-8899', startDate: '2026-02-01', endDate: '2027-01-31', monthlyRent: 5500, securityDeposit: 11000, status: 'ACTIVE' },
  { id: 'l-204', roomId: 'r-204', roomNumber: '204', tenantId: 't-5', tenantName: 'ธีรพงษ์ เจริญผล', tenantPhone: '084-333-2211', startDate: '2026-04-01', endDate: '2027-03-31', monthlyRent: 6000, securityDeposit: 12000, status: 'ACTIVE' },
  { id: 'l-302', roomId: 'r-302', roomNumber: '302', tenantId: 't-6', tenantName: 'อารยา ทรงศิลป์', tenantPhone: '092-444-6677', startDate: '2026-06-01', endDate: '2027-05-31', monthlyRent: 7500, securityDeposit: 15000, status: 'ACTIVE' },
  { id: 'l-304', roomId: 'r-304', roomNumber: '304', tenantId: 't-7', tenantName: 'ปกรณ์ มีสุข', tenantPhone: '088-777-9911', startDate: '2026-07-01', endDate: '2027-06-30', monthlyRent: 5500, securityDeposit: 11000, status: 'ACTIVE' },
];

export const INITIAL_METERS: MeterReading[] = [
  { id: 'm-101', roomId: 'r-101', roomNumber: '101', monthYear: '2026-09', prevWater: 140, currWater: 147, waterUnits: 7, waterRate: 18, waterAmount: 126, prevElectric: 450, currElectric: 520, electricUnits: 70, electricRate: 8, electricAmount: 560, readingDate: '2026-09-25', isBilled: true },
  { id: 'm-102', roomId: 'r-102', roomNumber: '102', monthYear: '2026-09', prevWater: 95, currWater: 101, waterUnits: 6, waterRate: 18, waterAmount: 108, prevElectric: 310, currElectric: 395, electricUnits: 85, electricRate: 8, electricAmount: 680, readingDate: '2026-09-25', isBilled: true },
  { id: 'm-201', roomId: 'r-201', roomNumber: '201', monthYear: '2026-09', prevWater: 210, currWater: 218, waterUnits: 8, waterRate: 18, waterAmount: 144, prevElectric: 600, currElectric: 680, electricUnits: 80, electricRate: 8, electricAmount: 640, readingDate: '2026-09-25', isBilled: true },
  { id: 'm-203', roomId: 'r-203', roomNumber: '203', monthYear: '2026-09', prevWater: 115, currWater: 120, waterUnits: 5, waterRate: 18, waterAmount: 90, prevElectric: 280, currElectric: 375, electricUnits: 95, electricRate: 8, electricAmount: 760, readingDate: '2026-09-25', isBilled: true },
  { id: 'm-204', roomId: 'r-204', roomNumber: '204', monthYear: '2026-09', prevWater: 80, currWater: 86, waterUnits: 6, waterRate: 18, waterAmount: 108, prevElectric: 190, currElectric: 260, electricUnits: 70, electricRate: 8, electricAmount: 560, readingDate: '2026-09-25', isBilled: false },
  { id: 'm-302', roomId: 'r-302', roomNumber: '302', monthYear: '2026-09', prevWater: 155, currWater: 164, waterUnits: 9, waterRate: 18, waterAmount: 162, prevElectric: 510, currElectric: 620, electricUnits: 110, electricRate: 8, electricAmount: 880, readingDate: '2026-09-25', isBilled: false },
  { id: 'm-304', roomId: 'r-304', roomNumber: '304', monthYear: '2026-09', prevWater: 60, currWater: 65, waterUnits: 5, waterRate: 18, waterAmount: 90, prevElectric: 140, currElectric: 210, electricUnits: 70, electricRate: 8, electricAmount: 560, readingDate: '2026-09-25', isBilled: false },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-202609-101',
    roomId: 'r-101',
    roomNumber: '101',
    tenantName: 'สมชาย รักสงบ',
    monthYear: '2026-09',
    items: [
      { description: 'ค่าเช่าห้องพัก (ห้อง 101)', amount: 4500 },
      { description: 'ค่าน้ำประปา (7 หน่วย @ 18 บาท)', units: 7, rate: 18, amount: 126 },
      { description: 'ค่าไฟฟ้า (70 หน่วย @ 8 บาท)', units: 70, rate: 8, amount: 560 },
      { description: 'ค่าส่วนกลางและขยะ', amount: 200 }
    ],
    totalAmount: 5386,
    dueDate: '2026-10-05',
    status: 'PAID',
    paymentSlipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
    paidAt: '2026-09-28 14:22',
    approvedBy: 'ผู้จัดการอาคาร'
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-202609-102',
    roomId: 'r-102',
    roomNumber: '102',
    tenantName: 'วิภาดา ใจดี',
    monthYear: '2026-09',
    items: [
      { description: 'ค่าเช่าห้องพัก (ห้อง 102)', amount: 4500 },
      { description: 'ค่าน้ำประปา (6 หน่วย @ 18 บาท)', units: 6, rate: 18, amount: 108 },
      { description: 'ค่าไฟฟ้า (85 หน่วย @ 8 บาท)', units: 85, rate: 8, amount: 680 },
      { description: 'ค่าส่วนกลางและขยะ', amount: 200 }
    ],
    totalAmount: 5488,
    dueDate: '2026-10-05',
    status: 'AWAITING_APPROVAL',
    paymentSlipUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'inv-201',
    invoiceNumber: 'INV-202609-201',
    roomId: 'r-201',
    roomNumber: '201',
    tenantName: 'กิตติศักดิ์ มั่งมี',
    monthYear: '2026-09',
    items: [
      { description: 'ค่าเช่าห้องพัก (ห้อง 201)', amount: 4500 },
      { description: 'ค่าน้ำประปา (8 หน่วย @ 18 บาท)', units: 8, rate: 18, amount: 144 },
      { description: 'ค่าไฟฟ้า (80 หน่วย @ 8 บาท)', units: 80, rate: 8, amount: 640 },
      { description: 'ค่าส่วนกลางและขยะ', amount: 200 }
    ],
    totalAmount: 5484,
    dueDate: '2026-10-05',
    status: 'PENDING'
  },
  {
    id: 'inv-203',
    invoiceNumber: 'INV-202609-203',
    roomId: 'r-203',
    roomNumber: '203',
    tenantName: 'ณัฐชา สว่างจิต',
    monthYear: '2026-09',
    items: [
      { description: 'ค่าเช่าห้องพัก (ห้อง 203)', amount: 5500 },
      { description: 'ค่าน้ำประปา (5 หน่วย @ 18 บาท)', units: 5, rate: 18, amount: 90 },
      { description: 'ค่าไฟฟ้า (95 หน่วย @ 8 บาท)', units: 95, rate: 8, amount: 760 },
      { description: 'ค่าส่วนกลางและขยะ', amount: 200 }
    ],
    totalAmount: 6550,
    dueDate: '2026-10-05',
    status: 'PENDING'
  }
];

export const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 't-1',
    ticketNumber: 'REP-202609-01',
    roomId: 'r-104',
    roomNumber: '104',
    reportedBy: 'ผู้ดูแลอาคาร (ตรวจพบตอนทำความสะอาด)',
    category: 'PLUMBING',
    title: 'ก๊อกน้ำอ่างล้างหน้าซึมและมีน้ำหยดตลอดเวลา',
    description: 'ท่อน้ำใต้อ่างล้างหน้ามีหยดน้ำรั่วซึม จำเป็นต้องเปลี่ยนซีลยางหรือเกลียวข้อต่อ',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: '2026-09-27 10:15',
    assignedTo: 'ช่างสมหมาย (ประปา)',
    repairCost: 350
  },
  {
    id: 't-2',
    ticketNumber: 'REP-202609-02',
    roomId: 'r-201',
    roomNumber: '201',
    reportedBy: 'กิตติศักดิ์ มั่งมี',
    category: 'AIR_CONDITIONER',
    title: 'เครื่องปรับอากาศมีเสียงดังผิดปกติและไม่ค่อยเย็น',
    description: 'เปิดแอร์แล้วมีเสียงพัดลมดัง และลมออกมาไม่เย็นฉ่ำเหมือนปกติ',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-09-28 16:40'
  },
  {
    id: 't-3',
    ticketNumber: 'REP-202609-03',
    roomId: 'r-101',
    roomNumber: '101',
    reportedBy: 'สมชาย รักสงบ',
    category: 'ELECTRICAL',
    title: 'หลอดไฟระเบียงหลังห้องขาด',
    description: 'หลอดไฟ LED ระเบียงหลังห้องเปิดไม่ติด',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: '2026-09-20 09:30',
    resolvedAt: '2026-09-21 11:00',
    assignedTo: 'ช่างเอก (ไฟฟ้า)',
    repairCost: 120
  }
];
