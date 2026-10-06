interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const [
      roomsRes,
      leasesRes,
      metersRes,
      invoicesRes,
      ticketsRes,
      usersRes,
      settingsRes
    ] = await Promise.all([
      context.env.DB.prepare(`
        SELECT 
          r.id, 
          r.room_number, 
          r.floor, 
          r.type, 
          r.base_rent, 
          r.status,
          l.id AS lease_id,
          l.tenant_name,
          l.tenant_email,
          l.tenant_phone
        FROM rooms r
        LEFT JOIN leases l ON r.id = l.room_id AND l.status = 'ACTIVE'
        ORDER BY r.floor ASC, r.room_number ASC
      `).all(),
      context.env.DB.prepare(`
        SELECT 
          l.id,
          l.room_id,
          r.room_number,
          l.tenant_name,
          l.tenant_email,
          l.tenant_phone,
          l.start_date,
          l.end_date,
          l.monthly_rent,
          l.security_deposit,
          l.status
        FROM leases l
        LEFT JOIN rooms r ON l.room_id = r.id
        ORDER BY l.created_at DESC
      `).all(),
      context.env.DB.prepare(`
        SELECT 
          m.id,
          m.room_id,
          r.room_number,
          m.month_year,
          m.prev_water,
          m.curr_water,
          m.water_units,
          m.water_rate,
          m.water_amount,
          m.prev_electric,
          m.curr_electric,
          m.electric_units,
          m.electric_rate,
          m.electric_amount,
          m.reading_date,
          m.is_billed
        FROM meters m
        LEFT JOIN rooms r ON m.room_id = r.id
        ORDER BY m.reading_date DESC, r.room_number ASC
      `).all(),
      context.env.DB.prepare(`
        SELECT 
          i.id,
          i.invoice_number,
          i.room_id,
          r.room_number,
          i.tenant_name,
          i.month_year,
          i.items_json,
          i.total_amount,
          i.due_date,
          i.status,
          i.payment_slip_url,
          i.paid_at,
          i.approved_by,
          i.created_at
        FROM invoices i
        LEFT JOIN rooms r ON i.room_id = r.id
        ORDER BY i.due_date DESC, i.created_at DESC
      `).all(),
      context.env.DB.prepare(`
        SELECT 
          t.id,
          t.ticket_number,
          t.room_id,
          r.room_number,
          t.reported_by,
          t.category,
          t.title,
          t.description,
          t.priority,
          t.status,
          t.assigned_to,
          t.repair_cost,
          t.created_at,
          t.resolved_at
        FROM maintenance_tickets t
        LEFT JOIN rooms r ON t.room_id = r.id
        ORDER BY t.created_at DESC
      `).all(),
      context.env.DB.prepare('SELECT id, email, name, avatar_url, role, created_at FROM users ORDER BY created_at DESC').all(),
      context.env.DB.prepare('SELECT key, value FROM system_settings').all()
    ]);

    // Map rooms
    const mappedRooms = roomsRes.results.map((r: any) => ({
      id: r.id,
      roomNumber: r.room_number,
      floor: r.floor,
      type: r.type,
      baseRent: r.base_rent,
      status: r.status,
      currentTenant: r.tenant_name ? {
        id: r.lease_id,
        name: r.tenant_name,
        phone: r.tenant_phone,
        email: r.tenant_email,
        leaseId: r.lease_id
      } : undefined
    }));

    // Map leases
    const mappedLeases = leasesRes.results.map((l: any) => ({
      id: l.id,
      roomId: l.room_id,
      roomNumber: l.room_number,
      tenantId: l.id,
      tenantName: l.tenant_name,
      tenantEmail: l.tenant_email || '',
      tenantPhone: l.tenant_phone,
      startDate: l.start_date,
      endDate: l.end_date,
      monthlyRent: l.monthly_rent,
      securityDeposit: l.security_deposit,
      status: l.status
    }));

    // Map meters
    const mappedMeters = metersRes.results.map((m: any) => ({
      id: m.id,
      roomId: m.room_id,
      roomNumber: m.room_number,
      monthYear: m.month_year,
      prevWater: m.prev_water,
      currWater: m.curr_water,
      waterUnits: m.water_units,
      waterRate: m.water_rate,
      waterAmount: m.water_amount,
      prevElectric: m.prev_electric,
      currElectric: m.curr_electric,
      electricUnits: m.electric_units,
      electricRate: m.electric_rate,
      electricAmount: m.electric_amount,
      readingDate: m.reading_date,
      isBilled: Boolean(m.is_billed)
    }));

    // Map invoices
    const mappedInvoices = invoicesRes.results.map((inv: any) => {
      let items = [];
      try {
        items = typeof inv.items_json === 'string' ? JSON.parse(inv.items_json) : (inv.items_json || []);
      } catch {
        items = [];
      }
      return {
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        roomId: inv.room_id,
        roomNumber: inv.room_number,
        tenantName: inv.tenant_name,
        monthYear: inv.month_year,
        items,
        totalAmount: inv.total_amount,
        dueDate: inv.due_date,
        status: inv.status,
        paymentSlipUrl: inv.payment_slip_url || undefined,
        paidAt: inv.paid_at || undefined,
        approvedBy: inv.approved_by || undefined
      };
    });

    // Map tickets
    const mappedTickets = ticketsRes.results.map((t: any) => ({
      id: t.id,
      ticketNumber: t.ticket_number,
      roomId: t.room_id,
      roomNumber: t.room_number,
      reportedBy: t.reported_by,
      category: t.category,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      status: t.status,
      assignedTo: t.assigned_to || undefined,
      repairCost: t.repair_cost || undefined,
      createdAt: t.created_at,
      resolvedAt: t.resolved_at || undefined
    }));

    // Map settings
    const settingsObj: Record<string, any> = {
      waterRate: 18,
      electricRate: 8,
      commonFee: 200
    };
    for (const s of (settingsRes.results as any[])) {
      if (s.key === 'waterRate' || s.key === 'electricRate' || s.key === 'commonFee') {
        settingsObj[s.key] = Number(s.value);
      } else {
        settingsObj[s.key] = s.value;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      database: 'Cloudflare D1 (Live)',
      counts: {
        rooms: mappedRooms.length,
        leases: mappedLeases.length,
        meters: mappedMeters.length,
        invoices: mappedInvoices.length,
        tickets: mappedTickets.length,
        users: usersRes.results.length
      },
      rooms: mappedRooms,
      leases: mappedLeases,
      meters: mappedMeters,
      invoices: mappedInvoices,
      tickets: mappedTickets,
      users: usersRes.results,
      rates: settingsObj
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as {
      action: string;
      data: any;
    };

    const { action, data } = body;

    if (action === 'SAVE_ROOMS' && Array.isArray(data)) {
      for (const r of data) {
        await context.env.DB.prepare(`
          INSERT INTO rooms (id, room_number, floor, type, base_rent, status, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            room_number = excluded.room_number,
            floor = excluded.floor,
            type = excluded.type,
            base_rent = excluded.base_rent,
            status = excluded.status,
            updated_at = CURRENT_TIMESTAMP
        `).bind(r.id, r.roomNumber || r.room_number, r.floor, r.type, r.baseRent || r.base_rent, r.status).run();
      }
    } else if (action === 'SAVE_LEASE' && data) {
      const l = data;
      await context.env.DB.prepare(`
        INSERT INTO leases (id, room_id, tenant_name, tenant_email, tenant_phone, start_date, end_date, monthly_rent, security_deposit, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          room_id = excluded.room_id,
          tenant_name = excluded.tenant_name,
          tenant_email = excluded.tenant_email,
          tenant_phone = excluded.tenant_phone,
          start_date = excluded.start_date,
          end_date = excluded.end_date,
          monthly_rent = excluded.monthly_rent,
          security_deposit = excluded.security_deposit,
          status = excluded.status
      `).bind(
        l.id,
        l.roomId || l.room_id,
        l.tenantName || l.tenant_name,
        l.tenantEmail || l.tenant_email || null,
        l.tenantPhone || l.tenant_phone,
        l.startDate || l.start_date,
        l.endDate || l.end_date,
        l.monthlyRent || l.monthly_rent,
        l.securityDeposit || l.security_deposit,
        l.status || 'ACTIVE'
      ).run();

      // If active, mark room occupied; if terminated, mark room vacant
      if (l.status === 'ACTIVE') {
        await context.env.DB.prepare(`UPDATE rooms SET status = 'OCCUPIED' WHERE id = ?`).bind(l.roomId || l.room_id).run();
      } else if (l.status === 'TERMINATED') {
        await context.env.DB.prepare(`UPDATE rooms SET status = 'VACANT' WHERE id = ?`).bind(l.roomId || l.room_id).run();
      }
    } else if (action === 'TERMINATE_LEASE' && data) {
      const { leaseId, roomId } = data;
      if (leaseId) {
        await context.env.DB.prepare(`UPDATE leases SET status = 'TERMINATED' WHERE id = ?`).bind(leaseId).run();
      }
      if (roomId) {
        await context.env.DB.prepare(`UPDATE rooms SET status = 'VACANT' WHERE id = ?`).bind(roomId).run();
      }
    } else if (action === 'SAVE_METERS' && Array.isArray(data)) {
      for (const m of data) {
        await context.env.DB.prepare(`
          INSERT INTO meters (id, room_id, month_year, prev_water, curr_water, water_units, water_rate, water_amount, prev_electric, curr_electric, electric_units, electric_rate, electric_amount, reading_date, is_billed, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            prev_water = excluded.prev_water,
            curr_water = excluded.curr_water,
            water_units = excluded.water_units,
            water_rate = excluded.water_rate,
            water_amount = excluded.water_amount,
            prev_electric = excluded.prev_electric,
            curr_electric = excluded.curr_electric,
            electric_units = excluded.electric_units,
            electric_rate = excluded.electric_rate,
            electric_amount = excluded.electric_amount,
            reading_date = excluded.reading_date,
            is_billed = excluded.is_billed
        `).bind(
          m.id,
          m.roomId || m.room_id,
          m.monthYear || m.month_year,
          m.prevWater ?? m.prev_water ?? 0,
          m.currWater ?? m.curr_water ?? 0,
          m.waterUnits ?? m.water_units ?? 0,
          m.waterRate ?? m.water_rate ?? 18,
          m.waterAmount ?? m.water_amount ?? 0,
          m.prevElectric ?? m.prev_electric ?? 0,
          m.currElectric ?? m.curr_electric ?? 0,
          m.electricUnits ?? m.electric_units ?? 0,
          m.electricRate ?? m.electric_rate ?? 8,
          m.electricAmount ?? m.electric_amount ?? 0,
          m.readingDate || m.reading_date || new Date().toISOString().split('T')[0],
          m.isBilled ? 1 : 0
        ).run();
      }
    } else if (action === 'SAVE_INVOICE' && data) {
      const inv = data;
      await context.env.DB.prepare(`
        INSERT INTO invoices (id, invoice_number, room_id, tenant_name, month_year, items_json, total_amount, due_date, status, payment_slip_url, paid_at, approved_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          payment_slip_url = excluded.payment_slip_url,
          paid_at = excluded.paid_at,
          approved_by = excluded.approved_by,
          total_amount = excluded.total_amount,
          items_json = excluded.items_json
      `).bind(
        inv.id,
        inv.invoiceNumber || inv.invoice_number,
        inv.roomId || inv.room_id,
        inv.tenantName || inv.tenant_name,
        inv.monthYear || inv.month_year,
        typeof inv.items === 'object' ? JSON.stringify(inv.items) : (inv.items_json || '[]'),
        inv.totalAmount || inv.total_amount,
        inv.dueDate || inv.due_date,
        inv.status,
        inv.paymentSlipUrl || inv.payment_slip_url || null,
        inv.paidAt || inv.paid_at || null,
        inv.approvedBy || inv.approved_by || null
      ).run();
    } else if (action === 'SAVE_INVOICES' && Array.isArray(data)) {
      for (const inv of data) {
        await context.env.DB.prepare(`
          INSERT INTO invoices (id, invoice_number, room_id, tenant_name, month_year, items_json, total_amount, due_date, status, payment_slip_url, paid_at, approved_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            payment_slip_url = excluded.payment_slip_url,
            paid_at = excluded.paid_at,
            approved_by = excluded.approved_by,
            total_amount = excluded.total_amount,
            items_json = excluded.items_json
        `).bind(
          inv.id,
          inv.invoiceNumber || inv.invoice_number,
          inv.roomId || inv.room_id,
          inv.tenantName || inv.tenant_name,
          inv.monthYear || inv.month_year,
          typeof inv.items === 'object' ? JSON.stringify(inv.items) : (inv.items_json || '[]'),
          inv.totalAmount || inv.total_amount,
          inv.dueDate || inv.due_date,
          inv.status,
          inv.paymentSlipUrl || inv.payment_slip_url || null,
          inv.paidAt || inv.paid_at || null,
          inv.approvedBy || inv.approved_by || null
        ).run();
      }
    } else if (action === 'SAVE_TICKET' && data) {
      const t = data;
      await context.env.DB.prepare(`
        INSERT INTO maintenance_tickets (id, ticket_number, room_id, reported_by, category, title, description, priority, status, assigned_to, repair_cost, created_at, resolved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          assigned_to = excluded.assigned_to,
          repair_cost = excluded.repair_cost,
          resolved_at = excluded.resolved_at
      `).bind(
        t.id,
        t.ticketNumber || t.ticket_number,
        t.roomId || t.room_id,
        t.reportedBy || t.reported_by,
        t.category,
        t.title,
        t.description || null,
        t.priority,
        t.status,
        t.assignedTo || t.assigned_to || null,
        t.repairCost || t.repair_cost || null,
        t.createdAt || t.created_at || new Date().toISOString(),
        t.resolvedAt || t.resolved_at || null
      ).run();
    } else if (action === 'SAVE_RATES' && data) {
      if (data.waterRate !== undefined) {
        await context.env.DB.prepare(`INSERT INTO system_settings (key, value, updated_at) VALUES ('waterRate', ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).bind(String(data.waterRate)).run();
      }
      if (data.electricRate !== undefined) {
        await context.env.DB.prepare(`INSERT INTO system_settings (key, value, updated_at) VALUES ('electricRate', ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).bind(String(data.electricRate)).run();
      }
      if (data.commonFee !== undefined) {
        await context.env.DB.prepare(`INSERT INTO system_settings (key, value, updated_at) VALUES ('commonFee', ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).bind(String(data.commonFee)).run();
      }
    }

    return new Response(JSON.stringify({ success: true, action }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
