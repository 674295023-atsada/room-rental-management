-- ========================================================
-- Seed Initial Leases, Meters, Invoices, Maintenance in D1
-- ========================================================

-- Leases
INSERT OR REPLACE INTO leases (id, room_id, tenant_name, tenant_email, tenant_phone, start_date, end_date, monthly_rent, security_deposit, status) VALUES
('l-101', 'r-101', 'สมชาย รักสงบ', 'somchai@example.com', '081-234-5678', '2026-01-01', '2026-12-31', 4500, 9000, 'ACTIVE'),
('l-102', 'r-102', 'วิภาดา ใจดี', 'vipada@example.com', '089-876-5432', '2026-03-01', '2027-02-28', 4500, 9000, 'ACTIVE'),
('l-201', 'r-201', 'กิตติศักดิ์ มั่งมี', 'kittisak@example.com', '086-112-2334', '2026-05-15', '2027-05-14', 4500, 9000, 'ACTIVE'),
('l-203', 'r-203', 'ณัฐชา สว่างจิต', 'natcha@example.com', '095-555-8899', '2026-02-01', '2027-01-31', 5500, 11000, 'ACTIVE'),
('l-204', 'r-204', 'ธีรพงษ์ เจริญผล', 'teerapong@example.com', '084-333-2211', '2026-04-01', '2027-03-31', 6000, 12000, 'ACTIVE'),
('l-302', 'r-302', 'อารยา ทรงศิลป์', 'araya@example.com', '092-444-6677', '2026-06-01', '2027-05-31', 7500, 15000, 'ACTIVE'),
('l-304', 'r-304', 'ปกรณ์ มีสุข', 'pakorn@example.com', '088-777-9911', '2026-07-01', '2027-06-30', 5500, 11000, 'ACTIVE');

-- Meters
INSERT OR REPLACE INTO meters (id, room_id, month_year, prev_water, curr_water, water_units, water_rate, water_amount, prev_electric, curr_electric, electric_units, electric_rate, electric_amount, reading_date, is_billed) VALUES
('m-101', 'r-101', '2026-09', 140, 147, 7, 18, 126, 450, 520, 70, 8, 560, '2026-09-25', 1),
('m-102', 'r-102', '2026-09', 95, 101, 6, 18, 108, 310, 395, 85, 8, 680, '2026-09-25', 1),
('m-201', 'r-201', '2026-09', 210, 218, 8, 18, 144, 600, 680, 80, 8, 640, '2026-09-25', 1),
('m-203', 'r-203', '2026-09', 115, 120, 5, 18, 90, 280, 375, 95, 8, 760, '2026-09-25', 1),
('m-204', 'r-204', '2026-09', 80, 86, 6, 18, 108, 190, 260, 70, 8, 560, '2026-09-25', 0),
('m-302', 'r-302', '2026-09', 155, 164, 9, 18, 162, 510, 620, 110, 8, 880, '2026-09-25', 0),
('m-304', 'r-304', '2026-09', 60, 65, 5, 18, 90, 140, 210, 70, 8, 560, '2026-09-25', 0);

-- Invoices
INSERT OR REPLACE INTO invoices (id, invoice_number, room_id, tenant_name, month_year, items_json, total_amount, due_date, status, payment_slip_url, paid_at, approved_by) VALUES
('inv-101', 'INV-202609-101', 'r-101', 'สมชาย รักสงบ', '2026-09', '[{"description":"ค่าเช่าห้องพัก (ห้อง 101)","amount":4500},{"description":"ค่าน้ำประปา (7 หน่วย @ 18 บาท)","units":7,"rate":18,"amount":126},{"description":"ค่าไฟฟ้า (70 หน่วย @ 8 บาท)","units":70,"rate":8,"amount":560},{"description":"ค่าส่วนกลางและขยะ","amount":200}]', 5386, '2026-10-05', 'PAID', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60', '2026-09-28 14:22', 'ผู้จัดการอาคาร'),
('inv-102', 'INV-202609-102', 'r-102', 'วิภาดา ใจดี', '2026-09', '[{"description":"ค่าเช่าห้องพัก (ห้อง 102)","amount":4500},{"description":"ค่าน้ำประปา (6 หน่วย @ 18 บาท)","units":6,"rate":18,"amount":108},{"description":"ค่าไฟฟ้า (85 หน่วย @ 8 บาท)","units":85,"rate":8,"amount":680},{"description":"ค่าส่วนกลางและขยะ","amount":200}]', 5488, '2026-10-05', 'AWAITING_APPROVAL', 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=60', NULL, NULL),
('inv-201', 'INV-202609-201', 'r-201', 'กิตติศักดิ์ มั่งมี', '2026-09', '[{"description":"ค่าเช่าห้องพัก (ห้อง 201)","amount":4500},{"description":"ค่าน้ำประปา (8 หน่วย @ 18 บาท)","units":8,"rate":18,"amount":144},{"description":"ค่าไฟฟ้า (80 หน่วย @ 8 บาท)","units":80,"rate":8,"amount":640},{"description":"ค่าส่วนกลางและขยะ","amount":200}]', 5484, '2026-10-05', 'PENDING', NULL, NULL, NULL),
('inv-203', 'INV-202609-203', 'r-203', 'ณัฐชา สว่างจิต', '2026-09', '[{"description":"ค่าเช่าห้องพัก (ห้อง 203)","amount":5500},{"description":"ค่าน้ำประปา (5 หน่วย @ 18 บาท)","units":5,"rate":18,"amount":90},{"description":"ค่าไฟฟ้า (95 หน่วย @ 8 บาท)","units":95,"rate":8,"amount":760},{"description":"ค่าส่วนกลางและขยะ","amount":200}]', 6550, '2026-10-05', 'PENDING', NULL, NULL, NULL);

-- Maintenance Tickets
INSERT OR REPLACE INTO maintenance_tickets (id, ticket_number, room_id, reported_by, category, title, description, priority, status, assigned_to, repair_cost, created_at, resolved_at) VALUES
('t-1', 'REP-202609-01', 'r-104', 'ผู้ดูแลอาคาร', 'PLUMBING', 'ก๊อกน้ำอ่างล้างหน้าซึมและมีน้ำหยดตลอดเวลา', 'ท่อน้ำใต้อ่างล้างหน้ามีหยดน้ำรั่วซึม', 'MEDIUM', 'IN_PROGRESS', 'ช่างสมหมาย (ประปา)', 350, '2026-09-27 10:15', NULL),
('t-2', 'REP-202609-02', 'r-201', 'กิตติศักดิ์ มั่งมี', 'AIR_CONDITIONER', 'เครื่องปรับอากาศมีเสียงดังผิดปกติและไม่ค่อยเย็น', 'เปิดแอร์แล้วมีเสียงพัดลมดัง และลมออกมาไม่เย็นฉ่ำเหมือนปกติ', 'HIGH', 'OPEN', NULL, NULL, '2026-09-28 16:40', NULL),
('t-3', 'REP-202609-03', 'r-101', 'สมชาย รักสงบ', 'ELECTRICAL', 'หลอดไฟระเบียงหลังห้องขาด', 'หลอดไฟ LED ระเบียงหลังห้องเปิดไม่ติด', 'LOW', 'RESOLVED', 'ช่างเอก (ไฟฟ้า)', 120, '2026-09-20 09:30', '2026-09-21 11:00');
