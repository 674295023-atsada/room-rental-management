interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const [roomsRes, usersRes, settingsRes] = await Promise.all([
      context.env.DB.prepare('SELECT * FROM rooms ORDER BY floor ASC, room_number ASC').all(),
      context.env.DB.prepare('SELECT id, email, name, avatar_url, role FROM users').all(),
      context.env.DB.prepare('SELECT key, value FROM system_settings').all()
    ]);

    return new Response(JSON.stringify({
      rooms: roomsRes.results,
      users: usersRes.results,
      settings: settingsRes.results,
      database: 'Cloudflare D1 (Live)'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
