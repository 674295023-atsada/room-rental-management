interface Env {
  DB: D1Database;
}

const ADMIN_EMAILS = [
  'seree999@gmail.com',
  '674295023@parichat.skru.ac.th'
];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as {
      credential?: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    let email = body.email || '';
    let name = body.name || '';
    let picture = body.picture || '';

    // If client sends Google JWT credential, decode it
    if (body.credential) {
      try {
        const parts = body.credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          email = payload.email || email;
          name = payload.name || name;
          picture = payload.picture || picture;
        }
      } catch (e) {
        console.error('Failed to decode Google JWT token', e);
      }
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Role Assignment: seree999@gmail.com is unconditionally granted ADMIN
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const role = isAdmin ? 'ADMIN' : 'TENANT';

    const userId = `u-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Upsert into D1 users table
    await context.env.DB.prepare(`
      INSERT INTO users (id, email, name, avatar_url, role, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        avatar_url = excluded.avatar_url,
        role = CASE WHEN LOWER(excluded.email) IN ('seree999@gmail.com', '674295023@parichat.skru.ac.th') THEN 'ADMIN' ELSE users.role END,
        updated_at = CURRENT_TIMESTAMP
    `).bind(userId, email, name || email, picture, role).run();

    // Query the saved user from DB
    const { results } = await context.env.DB.prepare(
      'SELECT id, email, name, avatar_url, role, created_at FROM users WHERE email = ?'
    ).bind(email).all();

    const user = results[0] || {
      id: userId,
      email,
      name: name || email,
      avatar_url: picture,
      role
    };

    return new Response(JSON.stringify({
      success: true,
      message: isAdmin ? 'เข้าสู่ระบบสำเร็จในฐานะผู้ดูแลระบบ (Admin)' : 'เข้าสู่ระบบสำเร็จ',
      user
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'Authentication failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
