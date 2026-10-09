interface Env {
  DB: D1Database;
  AI?: any;
  GEMINI_API_KEY?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Check if Gemini API key exists
    let geminiConfigured = false;
    if (context.env.GEMINI_API_KEY) {
      geminiConfigured = true;
    } else {
      const setting = await context.env.DB.prepare("SELECT value FROM system_settings WHERE key = 'geminiApiKey'").first();
      if (setting && setting.value) {
        geminiConfigured = true;
      }
    }

    return new Response(JSON.stringify({
      geminiConfigured,
      model: 'gemini-1.5-flash'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as {
      action?: string;
      apiKey?: string;
      message?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      user?: {
        email?: string;
        name?: string;
        role?: string;
      };
    };

    // Action: Save Gemini API Key to D1
    if (body.action === 'SET_GEMINI_KEY' && body.apiKey !== undefined) {
      const trimmedKey = body.apiKey.trim();
      await context.env.DB.prepare(`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES ('geminiApiKey', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).bind(trimmedKey).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'บันทึก Google Gemini API Key ลงในฐานข้อมูล Cloudflare D1 เรียบร้อยแล้ว'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userMsg = (body.message || '').trim();
    if (!userMsg) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUser = body.user || { role: 'TENANT' };
    const isAdmin = currentUser.role === 'ADMIN';

    // 1. Fetch live system settings from D1
    const settingsRes = await context.env.DB.prepare('SELECT key, value FROM system_settings').all();
    const settings: Record<string, string> = {};
    for (const s of (settingsRes.results as any[])) {
      settings[s.key] = s.value;
    }
    const waterRate = settings.waterRate || '18';
    const electricRate = settings.electricRate || '8';
    const commonFee = settings.commonFee || '200';
    const promptPayPhone = '081-999-8888';
    const officeHours = 'ทุกวัน 08:30 - 18:00 น.';
    const officePhone = '02-123-4567, 081-999-8888';

    // Get Gemini Key from body, env, or D1
    const geminiKey = body.apiKey || context.env.GEMINI_API_KEY || settings.geminiApiKey || '';

    // 2. Fetch User & Room Data from D1
    let userLease: any = null;
    let userRoom: any = null;
    let userInvoices: any[] = [];
    let userTickets: any[] = [];
    let dormSummary: any = null;

    if (!isAdmin && currentUser.email) {
      // Find active lease for tenant by email
      const leaseQuery = await context.env.DB.prepare(`
        SELECT l.*, r.room_number, r.floor, r.type, r.base_rent
        FROM leases l
        JOIN rooms r ON l.room_id = r.id
        WHERE LOWER(l.tenant_email) = LOWER(?) AND l.status = 'ACTIVE'
        LIMIT 1
      `).bind(currentUser.email).all();

      if (leaseQuery.results.length > 0) {
        userLease = leaseQuery.results[0];
        userRoom = {
          id: userLease.room_id,
          roomNumber: userLease.room_number,
          floor: userLease.floor,
          type: userLease.type,
          baseRent: userLease.base_rent
        };

        // Fetch invoices for this room
        const invQuery = await context.env.DB.prepare(`
          SELECT * FROM invoices WHERE room_id = ? ORDER BY due_date DESC LIMIT 3
        `).bind(userRoom.id).all();
        userInvoices = invQuery.results;

        // Fetch tickets for this room
        const ticketQuery = await context.env.DB.prepare(`
          SELECT * FROM maintenance_tickets WHERE room_id = ? ORDER BY created_at DESC LIMIT 3
        `).bind(userRoom.id).all();
        userTickets = ticketQuery.results;
      }
    } else if (isAdmin) {
      // Admin summary data
      const [roomsRes, invRes, ticketRes] = await Promise.all([
        context.env.DB.prepare('SELECT status, COUNT(*) as count FROM rooms GROUP BY status').all(),
        context.env.DB.prepare("SELECT COUNT(*) as count, SUM(total_amount) as total FROM invoices WHERE status != 'PAID'").all(),
        context.env.DB.prepare("SELECT COUNT(*) as count FROM maintenance_tickets WHERE status != 'RESOLVED'").all()
      ]);

      const roomCounts: Record<string, number> = { VACANT: 0, OCCUPIED: 0, MAINTENANCE: 0 };
      for (const r of (roomsRes.results as any[])) {
        roomCounts[r.status] = r.count;
      }

      dormSummary = {
        totalRooms: 12,
        occupied: roomCounts.OCCUPIED || 0,
        vacant: roomCounts.VACANT || 0,
        maintenance: roomCounts.MAINTENANCE || 0,
        pendingInvoicesCount: (invRes.results[0] as any)?.count || 0,
        pendingInvoicesTotal: (invRes.results[0] as any)?.total || 0,
        openTicketsCount: (ticketRes.results[0] as any)?.count || 0
      };
    }

    // 3. Construct System Prompt with live data
    const systemPrompt = `คุณคือ "น้องสบายใจ" ผู้ช่วย AI อัจฉริยะประจำหอพักบ้านสบายใจ (Baan Sabaijai) ขับเคลื่อนด้วยโมเดล Google Gemini
ตอบคำถามอย่างสุภาพ ไพเราะ เป็นมิตร กระชับ ใช้ภาษาไทยและมีอิโมจิประกอบอย่างเหมาะสม

ข้อมูลสำคัญของหอพัก (จากฐานข้อมูลจริง Cloudflare D1):
- อัตราค่าน้ำประปา: ${waterRate} บาท/หน่วย
- อัตราค่าไฟฟ้า: ${electricRate} บาท/หน่วย
- ค่าส่วนกลางและขยะ: ${commonFee} บาท/ห้อง/เดือน
- ช่องทางชำระเงิน: โอนผ่านพร้อมเพย์ ${promptPayPhone} (หอพักบ้านสบายใจ) แล้วแนบสลิปในระบบ
- กำหนดชำระค่าเช่า: ทุกวันที่ 1-5 ของเดือน
- เวลาทำการนิติบุคคล/สำนักงาน: ${officeHours} โทร: ${officePhone}
- กฎระเบียบ: งดส่งเสียงดังหลัง 22:00 น., ทิ้งขยะที่จุดพักก่อน 09:00 น., ห้ามสูบบุหรี่ในห้องและทางเดินส่วนกลาง, ย้ายออกต้องแจ้งล่วงหน้า 30 วัน

ข้อมูลผู้ใช้ปัจจุบัน:
- ชื่อ: ${currentUser.name || 'ผู้ใช้งาน'} (${isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้เช่า (Tenant)'})
${userRoom ? `- ห้องพัก: ห้อง ${userRoom.roomNumber} (ชั้น ${userRoom.floor}, ประเภท ${userRoom.type}, ค่าเช่า ฿${Number(userRoom.baseRent).toLocaleString()} บาท/เดือน)` : '- สถานะห้อง: ยังไม่ได้ผูกห้องพัก'}
${userInvoices.length > 0 ? `- บิลล่าสุด: เลขที่ ${userInvoices[0].invoice_number} ประจำงวด ${userInvoices[0].month_year} ยอด ฿${Number(userInvoices[0].total_amount).toLocaleString()} บาท สถานะ: ${userInvoices[0].status} กำหนดชำระ: ${userInvoices[0].due_date}` : ''}
${userTickets.length > 0 ? `- งานแจ้งซ่อมล่าสุด: ${userTickets[0].title} (สถานะ: ${userTickets[0].status})` : ''}
${dormSummary ? `- ข้อมูลสรุปภาพรวมหอพัก: ห้องว่าง ${dormSummary.vacant} ห้อง, ห้องมีผู้เช่า ${dormSummary.occupied} ห้อง, ห้องปรับปรุง ${dormSummary.maintenance} ห้อง, บิลค้างชำระ ${dormSummary.pendingInvoicesCount} ใบ (รวม ฿${Number(dormSummary.pendingInvoicesTotal).toLocaleString()}), งานแจ้งซ่อมค้าง ${dormSummary.openTicketsCount} งาน` : ''}
`;

    let aiReply = '';
    let usedEngine = 'Intelligent Context Engine';

    // 4. CALL REAL GOOGLE GEMINI API IF KEY IS PROVIDED
    if (geminiKey) {
      try {
        const geminiContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        // Add history
        if (Array.isArray(body.history)) {
          for (const h of body.history.slice(-6)) {
            geminiContents.push({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }]
            });
          }
        }

        // Add current user message
        geminiContents.push({
          role: 'user',
          parts: [{ text: userMsg }]
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const geminiReqBody = {
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        };

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiReqBody)
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            aiReply = candidateText;
            usedEngine = 'Google Gemini 1.5 Flash (Live)';
          }
        } else {
          const errData = await geminiRes.text();
          console.error('Google Gemini API Error:', errData);
        }
      } catch (geminiErr) {
        console.warn('Gemini request failed, falling back:', geminiErr);
      }
    }

    // 5. Cloudflare Workers AI Fallback (if no Gemini or Gemini failed)
    if (!aiReply && context.env.AI) {
      try {
        const messages: Array<{ role: string; content: string }> = [
          { role: 'system', content: systemPrompt }
        ];

        if (Array.isArray(body.history)) {
          for (const h of body.history.slice(-6)) {
            messages.push({ role: h.role, content: h.content });
          }
        }

        messages.push({ role: 'user', content: userMsg });

        const aiResponse = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages,
          max_tokens: 512,
          temperature: 0.6
        });

        if (aiResponse && aiResponse.response) {
          aiReply = aiResponse.response;
          usedEngine = 'Cloudflare Workers AI (Llama 3.1)';
        }
      } catch (err) {
        console.warn('Workers AI fallback error:', err);
      }
    }

    // 6. Intelligent Fallback (if no API keys configured)
    if (!aiReply) {
      const q = userMsg.toLowerCase();

      if (q.includes('บิล') || q.includes('ค่าเช่า') || q.includes('ค่าห้อง') || q.includes('ยอดชำระ') || q.includes('จ่ายเงิน') || q.includes('เท่าไหร่') || q.includes('ใบแจ้งหนี้')) {
        if (isAdmin && dormSummary) {
          aiReply = `📊 **สรุปยอดใบแจ้งหนี้หอพัก:**\n\n- มีบิลรอชำระ/รอตรวจสอบทั้งหมด: **${dormSummary.pendingInvoicesCount} ใบ**\n- รวมยอดเงินค้างชำระ: **฿${Number(dormSummary.pendingInvoicesTotal).toLocaleString()} บาท**\n\nอาจารย์สามารถตรวจสอบสลิปและอนุมัติการชำระได้ที่แท็บ **"ใบแจ้งหนี้ & ชำระเงิน"** ครับ 💳`;
        } else if (userRoom && userInvoices.length > 0) {
          const inv = userInvoices[0];
          const statusText = inv.status === 'PAID' ? '✅ ชำระเรียบร้อยแล้ว' : inv.status === 'AWAITING_APPROVAL' ? '⏳ แนบสลิปแล้ว กำลังรอผู้ดูแลตรวจสอบ' : '⚠️ รอการชำระเงิน';
          aiReply = `🏠 **ข้อมูลค่าเช่าห้อง ${userRoom.roomNumber}** ประจำรอบบิล **${inv.month_year}**\n\n` +
            `- **ยอดรวมสุทธิ:** ฿${Number(inv.total_amount).toLocaleString()} บาท\n` +
            `- **กำหนดชำระ:** ภายในวันที่ ${inv.due_date}\n` +
            `- **สถานะปัจจุบัน:** ${statusText}\n\n` +
            `💡 คุณสามารถกดปุ่ม **"แนบสลิป"** ในหน้าพอร์ทัลเพื่อส่งหลักฐานการโอนได้ทันทีครับ`;
        } else if (userRoom) {
          aiReply = `🏠 คุณพักอยู่ **ห้อง ${userRoom.roomNumber}** ค่าเช่าพื้นฐานอยู่ที่ **฿${Number(userRoom.baseRent).toLocaleString()} บาท/เดือน** ครับ ยังไม่มีบิลค้างชำระในรอบปัจจุบันครับ ✨`;
        } else {
          aiReply = `ขณะนี้บัญชีของคุณยังไม่ได้ผูกกับห้องพัก กรุณาติดต่อผู้ดูแลระบบเพื่อจัดสรรห้องพักก่อนนะครับ 😊`;
        }
      } else if (q.includes('น้ำ') || q.includes('ไฟ') || q.includes('มิเตอร์') || q.includes('หน่วย') || q.includes('เรท') || q.includes('อัตรา')) {
        aiReply = `⚡ **อัตราค่าน้ำ-ค่าไฟของหอพักบ้านสบายใจ:**\n\n` +
          `- 💧 **ค่าน้ำประปา:** ฿${waterRate} บาท ต่อหน่วย\n` +
          `- ⚡ **ค่าไฟฟ้า:** ฿${electricRate} บาท ต่อหน่วย\n` +
          `- 🏢 **ค่าส่วนกลางและขยะ:** ฿${commonFee} บาท ต่อห้อง/เดือน\n\n` +
          `ระบบจะคำนวณค่ายูนิตตามมิเตอร์จริงที่จดในวันที่ 25 ของทุกเดือนครับ 📋`;
      } else if (q.includes('โอน') || q.includes('บัญชี') || q.includes('พร้อมเพย์') || q.includes('ธนาคาร') || q.includes('promptpay') || q.includes('เลขที่บัญชี') || q.includes('ชำระยังไง')) {
        aiReply = `💳 **ช่องทางการชำระเงินค่าเช่าหอพัก:**\n\n` +
          `- **พร้อมเพย์ (PromptPay):** \`${promptPayPhone}\`\n` +
          `- **ชื่อบัญชี:** หอพักบ้านสบายใจ (Baan Sabaijai)\n\n` +
          `📌 **ขั้นตอน:** เมื่อโอนเงินเสร็จแล้ว ให้เข้าไปที่เมนู **"บิลค่าเช่า & ชำระเงิน"** แล้วกด **"แนบสลิป"** เพื่อให้ผู้ดูแลหอพักตรวจสอบและออกใบเสร็จรับเงินให้ครับ ✅`;
      } else if (q.includes('ซ่อม') || q.includes('เสีย') || q.includes('พัง') || q.includes('แอร์') || q.includes('ก๊อก') || q.includes('ไฟดับ') || q.includes('ท่อ') || q.includes('ชำรุด')) {
        if (userRoom) {
          aiReply = `🔧 **ระบบแจ้งซ่อมบำรุงห้อง ${userRoom.roomNumber}:**\n\n` +
            `คุณสามารถเปิดใบแจ้งซ่อมได้ง่ายๆ โดยไปที่แท็บ **"แจ้งซ่อมบำรุง"** แล้วกดปุ่ม **"+ แจ้งซ่อม"** ระบุอาการและช่วงเวลาที่สะดวกให้ช่างเข้าตรวจเช็กได้เลยครับ ช่างประจำหอจะรีบเข้าดูแลให้ครับ 👷‍♂️`;
        } else {
          aiReply = `🔧 หากมีอุปกรณ์หรือสิ่งของในห้องพักชำรุด สามารถไปที่เมนู **"แจ้งซ่อมบำรุง"** เพื่อเปิดคำขอได้ตลอด 24 ชม. เลยครับ หรือโทรแจ้งช่างด่วนที่ ${officePhone} ครับ`;
        }
      } else if (q.includes('กฎ') || q.includes('ระเบียบ') || q.includes('เสียง') || q.includes('ทิ้งขยะ') || q.includes('สูบบุหรี่') || q.includes('สัตว์') || q.includes('ย้ายออก')) {
        aiReply = `📜 **กฎระเบียบการพักอาศัยหอพักบ้านสบายใจ:**\n\n` +
          `1. 🔇 **ความเงียบสงบ:** งดส่งเสียงดังรบกวนผู้อื่นหลังเวลา 22:00 น.\n` +
          `2. 🗑️ **การทิ้งขยะ:** แยกขยะและนำไปไว้ที่จุดพักขยะประจำชั้นก่อน 09:00 น.\n` +
          `3. 🚭 **สุขอนามัย:** ห้ามสูบบุหรี่ภายในห้องพักและทางเดินส่วนกลางโดยเด็ดขาด\n` +
          `4. 📅 **กำหนดชำระ:** ชำระค่าเช่าห้องภายในวันที่ 5 ของทุกเดือน\n` +
          `5. 📦 **การย้ายออก:** กรุณาแจ้งผู้จัดการล่วงหน้าอย่างน้อย 30 วันเพื่อตรวจสภาพห้องและคืนเงินประกันครับ`;
      } else if (q.includes('ติดต่อ') || q.includes('เบอร์') || q.includes('โทร') || q.includes('ผู้จัดการ') || q.includes('นิติ') || q.includes('แอดมิน') || q.includes('เสรี')) {
        aiReply = `📞 **ช่องทางติดต่อผู้ดูแลหอพัก:**\n\n` +
          `- **ผู้จัดการ/สำนักงาน:** อาจารย์เสรี ชะนะ\n` +
          `- **เบอร์โทรศัพท์:** ${officePhone}\n` +
          `- **เวลาทำการ:** ${officeHours}\n` +
          `- **อีเมลติดต่อ:** \`seree999@gmail.com\` หรือ \`674295023@parichat.skru.ac.th\`\n\n` +
          `ยินดีให้บริการและช่วยเหลือทุกท่านตลอดเวลาทำการครับ 🏢`;
      } else if (isAdmin && (q.includes('ว่าง') || q.includes('สรุป') || q.includes('ห้อง') || q.includes('สถานะ') || q.includes('คนเช่า'))) {
        aiReply = `📊 **สรุปสถานะหอพักปัจจุบัน (จาก Cloudflare D1):**\n\n` +
          `- 🟢 **ห้องที่มีผู้เช่า (Occupied):** ${dormSummary.occupied} ห้อง\n` +
          `- ⚪ **ห้องว่างพร้อมเช่า (Vacant):** ${dormSummary.vacant} ห้อง\n` +
          `- 🟡 **ห้องซ่อมบำรุง (Maintenance):** ${dormSummary.maintenance} ห้อง\n` +
          `- 🧾 **บิลรอจัดการ:** ${dormSummary.pendingInvoicesCount} รายการ (฿${Number(dormSummary.pendingInvoicesTotal).toLocaleString()} บาท)\n` +
          `- 🛠️ **งานซ่อมค้างอยู่:** ${dormSummary.openTicketsCount} งาน\n\n` +
          `อาจารย์สามารถคลิกที่เมนูด้านซ้ายเพื่อจัดการห้องพักและสัญญาเช่าได้ทันทีครับ 💼`;
      } else {
        aiReply = `สวัสดีครับคุณ ${currentUser.name || ''} 👋 ผมคือน้องสบายใจ AI ผู้ช่วยประจำหอพัก\n\n` +
          `ผมสามารถช่วยคุณในเรื่องเหล่านี้ได้ครับ:\n` +
          `• 💳 **ตรวจสอบค่าเช่าและบิลล่าสุด**\n` +
          `• ⚡ **สอบถามอัตราค่าน้ำ-ค่าไฟและค่าส่วนกลาง**\n` +
          `• 📲 **ข้อมูลเลขที่บัญชีโอนเงิน / พร้อมเพย์**\n` +
          `• 🔧 **แนะนำขั้นตอนการแจ้งซ่อมห้องพัก**\n` +
          `• 📜 **กฎระเบียบการพักอาศัยและเวลาทำการ**\n\n` +
          (geminiKey ? '' : '💡 *(ใส่ Gemini API Key ในปุ่มตั้งค่า ⚙️ เพื่อเปิดใช้พลัง Google Gemini AI แบบเต็มรูปแบบได้เลยครับ)*\n\n') +
          `พิมพ์สอบถามเรื่องที่ต้องการทราบได้เลยนะครับ ยินดีช่วยเหลือครับ! 😊`;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      reply: aiReply,
      engine: usedEngine,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'Failed to process chat message',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
