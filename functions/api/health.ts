interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare('SELECT COUNT(*) as count FROM users').all();
    return new Response(JSON.stringify({
      status: 'healthy',
      database: 'connected (Cloudflare D1)',
      userCount: results[0]?.count,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      status: 'error',
      database: 'connection failed',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
