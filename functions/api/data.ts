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
      context.env.DB.prepare('SELECT * FROM rooms ORDER BY floor ASC, room_number ASC').all(),
      context.env.DB.prepare('SELECT * FROM leases ORDER BY created_at DESC').all(),
      context.env.DB.prepare('SELECT * FROM meters ORDER BY reading_date DESC').all(),
      context.env.DB.prepare('SELECT * FROM invoices ORDER BY due_date DESC').all(),
      context.env.DB.prepare('SELECT * FROM maintenance_tickets ORDER BY created_at DESC').all(),
      context.env.DB.prepare('SELECT id, email, name, avatar_url, role FROM users').all(),
      context.env.DB.prepare('SELECT key, value FROM system_settings').all()
    ]);

    // Parse items_json in invoices
    const parsedInvoices = invoicesRes.results.map((inv: any) => {
      try {
        return {
          ...inv,
          items: typeof inv.items_json === 'string' ? JSON.parse(inv.items_json) : inv.items_json
        };
      } catch {
        return inv;
      }
    });

    return new Response(JSON.stringify({
      success: true,
      database: 'Cloudflare D1 (Live)',
      counts: {
        rooms: roomsRes.results.length,
        leases: leasesRes.results.length,
        meters: metersRes.results.length,
        invoices: invoicesRes.results.length,
        tickets: ticketsRes.results.length,
        users: usersRes.results.length
      },
      rooms: roomsRes.results,
      leases: leasesRes.results,
      meters: metersRes.results,
      invoices: parsedInvoices,
      tickets: ticketsRes.results,
      users: usersRes.results,
      settings: settingsRes.results
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
    } else if (action === 'SAVE_INVOICE' && data) {
      const inv = data;
      await context.env.DB.prepare(`
        INSERT INTO invoices (id, invoice_number, room_id, tenant_name, month_year, items_json, total_amount, due_date, status, payment_slip_url, paid_at, approved_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          payment_slip_url = excluded.payment_slip_url,
          paid_at = excluded.paid_at,
          approved_by = excluded.approved_by
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
        t.createdAt || t.created_at,
        t.resolvedAt || t.resolved_at || null
      ).run();
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
