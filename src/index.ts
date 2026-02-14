import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import {
  createSessionToken,
  verifySessionToken,
  generateId,
  generateInviteCode,
  getGoogleAuthorizeUrl,
  exchangeGoogleCode,
  getGoogleUser,
  type SessionPayload,
  type GoogleUser,
} from './auth';
import { parseReport } from './parser';
import {
  landingPage,
  dashboardPage,
  leaderboardPage,
  uploadPage,
  invitesPage,
  adminPage,
  errorPage,
} from './html';

type Bindings = {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  ADMIN_EMAIL: string;
};

type Variables = {
  user: {
    id: string;
    google_id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    is_admin: number;
    invites_remaining: number;
  } | null;
  session: SessionPayload | null;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ─── Middleware: load session ───────────────────────────────────────────────────

app.use('*', async (c, next) => {
  const token = getCookie(c, 'session');
  if (token) {
    const session = await verifySessionToken(token, c.env.SESSION_SECRET);
    if (session) {
      c.set('session', session);
      const user = await c.env.DB.prepare(
        'SELECT id, google_id, email, display_name, avatar_url, is_admin, invites_remaining FROM users WHERE id = ?'
      )
        .bind(session.userId)
        .first();
      c.set('user', user as Variables['user']);
    } else {
      c.set('session', null);
      c.set('user', null);
    }
  } else {
    c.set('session', null);
    c.set('user', null);
  }
  await next();
});

// Helper: require auth
function requireAuth(c: any): Response | null {
  if (!c.get('user')) {
    return c.html(errorPage('Unauthorized', 'Please sign in to access this page.'), 401);
  }
  return null;
}

function requireAdmin(c: any): Response | null {
  const user = c.get('user');
  if (!user || !user.is_admin) {
    return c.html(errorPage('Forbidden', 'Admin access required.'), 403);
  }
  return null;
}

function getBaseUrl(c: any): string {
  const url = new URL(c.req.url);
  return `${url.protocol}//${url.host}`;
}

// ─── Pages ──────────────────────────────────────────────────────────────────────

app.get('/', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.html(landingPage());
  }

  // Get user stats
  const stats = await c.env.DB.prepare(
    `SELECT
      COALESCE(SUM(cost_usd), 0) as total_cost,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(output_tokens), 0) as total_output_tokens,
      COUNT(DISTINCT date) as days_active
    FROM daily_usage WHERE user_id = ?`
  )
    .bind(user.id)
    .first();

  // Get user rank
  const rankResult = await c.env.DB.prepare(
    `SELECT COUNT(*) + 1 as rank FROM (
      SELECT user_id, SUM(cost_usd) as total_cost FROM daily_usage GROUP BY user_id
    ) WHERE total_cost > (
      SELECT COALESCE(SUM(cost_usd), 0) FROM daily_usage WHERE user_id = ?
    )`
  )
    .bind(user.id)
    .first();

  const uploadCount = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM uploads WHERE user_id = ?')
    .bind(user.id)
    .first();

  return c.html(
    dashboardPage(user, {
      total_cost: (stats as any)?.total_cost ?? 0,
      total_tokens: (stats as any)?.total_tokens ?? 0,
      total_output_tokens: (stats as any)?.total_output_tokens ?? 0,
      days_active: (stats as any)?.days_active ?? 0,
      rank: (rankResult as any)?.rank ?? 0,
      upload_count: (uploadCount as any)?.cnt ?? 0,
    })
  );
});

app.get('/leaderboard', async (c) => {
  const user = c.get('user');
  const results = await c.env.DB.prepare(
    `SELECT
      u.display_name,
      u.avatar_url,
      COALESCE(SUM(d.cost_usd), 0) as total_cost,
      COALESCE(SUM(d.total_tokens), 0) as total_tokens,
      COALESCE(SUM(d.output_tokens), 0) as total_output_tokens,
      COUNT(DISTINCT d.date) as days_active,
      MAX(d.date) as last_active
    FROM users u
    LEFT JOIN daily_usage d ON u.id = d.user_id
    GROUP BY u.id
    HAVING total_cost > 0
    ORDER BY total_cost DESC`
  ).all();

  const entries = (results.results || []).map((row: any, i: number) => ({
    rank: i + 1,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    total_cost: row.total_cost,
    total_tokens: row.total_tokens,
    total_output_tokens: row.total_output_tokens,
    days_active: row.days_active,
    last_active: row.last_active,
  }));

  return c.html(leaderboardPage(entries, user));
});

app.get('/upload', (c) => {
  const authErr = requireAuth(c);
  if (authErr) return authErr;
  return c.html(uploadPage(c.get('user')!));
});

app.get('/invites', async (c) => {
  const authErr = requireAuth(c);
  if (authErr) return authErr;
  const user = c.get('user')!;

  const codes = await c.env.DB.prepare(
    'SELECT code, used_by, use_count, max_uses FROM invite_codes WHERE created_by = ?'
  )
    .bind(user.id)
    .all();

  return c.html(
    invitesPage(
      user,
      (codes.results || []) as any[]
    )
  );
});

app.get('/admin', async (c) => {
  const adminErr = requireAdmin(c);
  if (adminErr) return adminErr;
  const user = c.get('user')!;

  const [userCount, uploadCount, inviteCount, allCodes] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first(),
    c.env.DB.prepare('SELECT COUNT(*) as cnt FROM uploads').first(),
    c.env.DB.prepare('SELECT COUNT(*) as cnt FROM invite_codes').first(),
    c.env.DB.prepare(
      `SELECT ic.code, ic.use_count, ic.max_uses, u.display_name as created_by_name
       FROM invite_codes ic LEFT JOIN users u ON ic.created_by = u.id
       ORDER BY ic.created_at DESC LIMIT 100`
    ).all(),
  ]);

  return c.html(
    adminPage(user, {
      total_users: (userCount as any)?.cnt ?? 0,
      total_uploads: (uploadCount as any)?.cnt ?? 0,
      total_invites: (inviteCount as any)?.cnt ?? 0,
    }, (allCodes.results || []) as any[])
  );
});

// ─── Auth Routes ────────────────────────────────────────────────────────────────

app.get('/auth/google', (c) => {
  const invite = c.req.query('invite') || '';
  const nonce = generateId();

  // Store invite code and nonce in a cookie for the callback
  const stateData = JSON.stringify({ invite, nonce });
  const stateB64 = btoa(stateData);

  setCookie(c, 'oauth_state', stateB64, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  const redirectUri = `${getBaseUrl(c)}/auth/google/callback`;
  const url = getGoogleAuthorizeUrl(c.env.GOOGLE_CLIENT_ID, redirectUri, stateB64);
  return c.redirect(url);
});

app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  const stateParam = c.req.query('state');
  const storedState = getCookie(c, 'oauth_state');

  deleteCookie(c, 'oauth_state', { path: '/' });

  if (!code || !stateParam || stateParam !== storedState) {
    return c.html(errorPage('Auth Error', 'Invalid OAuth state. Please try again.'), 400);
  }

  let invite = '';
  try {
    const stateData = JSON.parse(atob(stateParam));
    invite = stateData.invite || '';
  } catch {
    // ignore parse errors
  }

  let googleUser: GoogleUser;
  try {
    const redirectUri = `${getBaseUrl(c)}/auth/google/callback`;
    const accessToken = await exchangeGoogleCode(
      code,
      c.env.GOOGLE_CLIENT_ID,
      c.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    googleUser = await getGoogleUser(accessToken);
  } catch (err: any) {
    return c.html(errorPage('Auth Error', err.message || 'Failed to authenticate with Google.'), 400);
  }

  // Check if user already exists
  let user = await c.env.DB.prepare('SELECT * FROM users WHERE google_id = ?')
    .bind(googleUser.id)
    .first();

  if (!user) {
    // New user — invite code required
    if (!invite) {
      return c.html(
        errorPage(
          'Invite Required',
          'You need an invite code to sign up. Go back and enter your invite code before signing in.'
        ),
        403
      );
    }

    // Validate invite code
    const inviteRow = await c.env.DB.prepare(
      'SELECT * FROM invite_codes WHERE code = ? AND use_count < max_uses'
    )
      .bind(invite.toUpperCase())
      .first();

    if (!inviteRow) {
      return c.html(
        errorPage('Invalid Invite', 'The invite code is invalid or has already been used.'),
        403
      );
    }

    // Create user
    const userId = generateId();
    const isAdmin = c.env.ADMIN_EMAIL && googleUser.email === c.env.ADMIN_EMAIL ? 1 : 0;

    await c.env.DB.prepare(
      `INSERT INTO users (id, google_id, email, display_name, avatar_url, is_admin)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, googleUser.id, googleUser.email, googleUser.name || googleUser.email, googleUser.picture, isAdmin)
      .run();

    // Mark invite as used
    await c.env.DB.prepare(
      'UPDATE invite_codes SET use_count = use_count + 1, used_by = ?, used_at = datetime(\'now\') WHERE code = ?'
    )
      .bind(userId, invite.toUpperCase())
      .run();

    user = { id: userId, email: googleUser.email } as any;
  }

  // Create session
  const token = await createSessionToken(
    { userId: (user as any).id, email: (user as any).email },
    c.env.SESSION_SECRET
  );

  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return c.redirect('/');
});

app.get('/auth/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' });
  return c.redirect('/');
});

// ─── API Routes ─────────────────────────────────────────────────────────────────

app.post('/api/upload', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  let body: { json: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid request body' }, 400);
  }

  if (!body.json || typeof body.json !== 'string') {
    return c.json({ ok: false, error: 'Missing "json" field' }, 400);
  }

  let report;
  try {
    report = parseReport(body.json);
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 400);
  }

  // Create upload record
  const uploadId = generateId();
  await c.env.DB.prepare(
    'INSERT INTO uploads (id, user_id, report_type, record_count) VALUES (?, ?, ?, ?)'
  )
    .bind(uploadId, user.id, report.type, report.entries.length)
    .run();

  // Upsert daily usage entries
  const stmt = c.env.DB.prepare(
    `INSERT INTO daily_usage (id, upload_id, user_id, date, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens, total_tokens, cost_usd, models_used)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, date) DO UPDATE SET
       upload_id = excluded.upload_id,
       input_tokens = excluded.input_tokens,
       output_tokens = excluded.output_tokens,
       cache_creation_tokens = excluded.cache_creation_tokens,
       cache_read_tokens = excluded.cache_read_tokens,
       total_tokens = excluded.total_tokens,
       cost_usd = excluded.cost_usd,
       models_used = excluded.models_used`
  );

  const batch = report.entries.map((entry) =>
    stmt.bind(
      generateId(),
      uploadId,
      user.id,
      entry.date,
      entry.inputTokens,
      entry.outputTokens,
      entry.cacheCreationTokens,
      entry.cacheReadTokens,
      entry.totalTokens,
      entry.costUsd,
      JSON.stringify(entry.modelsUsed)
    )
  );

  await c.env.DB.batch(batch);

  return c.json({
    ok: true,
    entries: report.entries.length,
    type: report.type,
    summary: report.summary,
  });
});

app.get('/api/leaderboard', async (c) => {
  const results = await c.env.DB.prepare(
    `SELECT
      u.id,
      u.display_name,
      u.avatar_url,
      COALESCE(SUM(d.cost_usd), 0) as total_cost,
      COALESCE(SUM(d.total_tokens), 0) as total_tokens,
      COALESCE(SUM(d.output_tokens), 0) as total_output_tokens,
      COUNT(DISTINCT d.date) as days_active,
      MAX(d.date) as last_active
    FROM users u
    LEFT JOIN daily_usage d ON u.id = d.user_id
    GROUP BY u.id
    HAVING total_cost > 0
    ORDER BY total_cost DESC`
  ).all();

  return c.json({
    ok: true,
    entries: (results.results || []).map((row: any, i: number) => ({
      rank: i + 1,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      total_cost: row.total_cost,
      total_tokens: row.total_tokens,
      total_output_tokens: row.total_output_tokens,
      days_active: row.days_active,
      last_active: row.last_active,
    })),
  });
});

app.get('/api/me', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ ok: false, error: 'Unauthorized' }, 401);

  const stats = await c.env.DB.prepare(
    `SELECT
      COALESCE(SUM(cost_usd), 0) as total_cost,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(output_tokens), 0) as total_output_tokens,
      COUNT(DISTINCT date) as days_active
    FROM daily_usage WHERE user_id = ?`
  )
    .bind(user.id)
    .first();

  return c.json({
    ok: true,
    user: {
      display_name: user.display_name,
      email: user.email,
      avatar_url: user.avatar_url,
    },
    stats,
  });
});

app.post('/api/invites/create', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ ok: false, error: 'Unauthorized' }, 401);

  if (user.invites_remaining <= 0) {
    return c.json({ ok: false, error: 'No invites remaining' }, 400);
  }

  const code = generateInviteCode();
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO invite_codes (code, created_by) VALUES (?, ?)').bind(code, user.id),
    c.env.DB.prepare('UPDATE users SET invites_remaining = invites_remaining - 1 WHERE id = ?').bind(user.id),
  ]);

  return c.json({ ok: true, code });
});

app.post('/api/admin/invites', async (c) => {
  const user = c.get('user');
  if (!user || !user.is_admin) return c.json({ ok: false, error: 'Forbidden' }, 403);

  let body: { count?: number; maxUses?: number };
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const count = Math.min(Math.max(body.count || 5, 1), 50);
  const maxUses = Math.min(Math.max(body.maxUses || 1, 1), 100);

  const stmts = [];
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = generateInviteCode();
    codes.push(code);
    stmts.push(
      c.env.DB.prepare('INSERT INTO invite_codes (code, created_by, max_uses) VALUES (?, ?, ?)').bind(
        code,
        user.id,
        maxUses
      )
    );
  }

  await c.env.DB.batch(stmts);
  return c.json({ ok: true, codes });
});

// ─── 404 ────────────────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.html(errorPage('Not Found', 'The page you are looking for does not exist.', c.get('user')), 404);
});

export default app;
