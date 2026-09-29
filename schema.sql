-- =======================================================
-- Cloudflare D1 Database Schema for Room Rental Management
-- =======================================================

-- 1. Users Table (with Role-Based Access Control)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'TENANT', -- 'ADMIN' | 'TENANT' | 'STAFF'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Property & Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    room_number TEXT UNIQUE NOT NULL,
    floor INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'Standard' | 'Deluxe' | 'Studio' | 'Suite'
    base_rent REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'VACANT', -- 'VACANT' | 'OCCUPIED' | 'MAINTENANCE'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leases / Contracts Table
CREATE TABLE IF NOT EXISTS leases (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_name TEXT NOT NULL,
    tenant_email TEXT,
    tenant_phone TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    monthly_rent REAL NOT NULL,
    security_deposit REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'TERMINATED' | 'EXPIRED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Meter Readings Table
CREATE TABLE IF NOT EXISTS meters (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL,
    prev_water REAL NOT NULL,
    curr_water REAL NOT NULL,
    water_units REAL NOT NULL,
    water_rate REAL NOT NULL,
    water_amount REAL NOT NULL,
    prev_electric REAL NOT NULL,
    curr_electric REAL NOT NULL,
    electric_units REAL NOT NULL,
    electric_rate REAL NOT NULL,
    electric_amount REAL NOT NULL,
    reading_date TEXT NOT NULL,
    is_billed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_name TEXT NOT NULL,
    month_year TEXT NOT NULL,
    items_json TEXT NOT NULL,
    total_amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'AWAITING_APPROVAL' | 'PAID' | 'OVERDUE'
    payment_slip_url TEXT,
    paid_at TEXT,
    approved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Maintenance Tickets Table
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    reported_by TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'OPEN',
    assigned_to TEXT,
    repair_cost REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT
);

-- 7. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_leases_room_id ON leases(room_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_invoices_month ON invoices(month_year);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON maintenance_tickets(status);

-- =======================================================
-- Initial Seed Data
-- =======================================================

-- Pre-seed Admin role for seree999@gmail.com
INSERT OR REPLACE INTO users (id, email, name, role) 
VALUES ('u-admin-seree', 'seree999@gmail.com', 'อาจารย์เสรี ชะนะ (ผู้ดูแลระบบ)', 'ADMIN');

-- Pre-seed Rooms
INSERT OR REPLACE INTO rooms (id, room_number, floor, type, base_rent, status) VALUES
('r-101', '101', 1, 'Standard', 4500, 'OCCUPIED'),
('r-102', '102', 1, 'Standard', 4500, 'OCCUPIED'),
('r-103', '103', 1, 'Deluxe', 5500, 'VACANT'),
('r-104', '104', 1, 'Deluxe', 5500, 'MAINTENANCE'),
('r-201', '201', 2, 'Standard', 4500, 'OCCUPIED'),
('r-202', '202', 2, 'Standard', 4500, 'VACANT'),
('r-203', '203', 2, 'Deluxe', 5500, 'OCCUPIED'),
('r-204', '204', 2, 'Studio', 6000, 'OCCUPIED'),
('r-301', '301', 3, 'Studio', 6000, 'VACANT'),
('r-302', '302', 3, 'Suite', 7500, 'OCCUPIED'),
('r-303', '303', 3, 'Suite', 7500, 'VACANT'),
('r-304', '304', 3, 'Deluxe', 5500, 'OCCUPIED');

-- Pre-seed Default Utility Rates
INSERT OR REPLACE INTO system_settings (key, value) VALUES
('waterRate', '18'),
('electricRate', '8'),
('commonFee', '200'),
('adminEmail', 'seree999@gmail.com');
