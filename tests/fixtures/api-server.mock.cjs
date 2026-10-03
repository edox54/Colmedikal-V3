const db = { 'boss@x.co': { email: 'boss@x.co', role: 'Super Admin', active: 1, password_hash: 'h0' }, 'aud@x.co': { email: 'aud@x.co', role: 'Auditor', active: 1, password_hash: 'h1' } };
const bcrypt = { hash: async (p) => 'bc:' + p };
function verifyToken(token) { try { return JSON.parse(token); } catch { return null; } }
async function executeQuery(sql, vals) {
  if (sql.startsWith('SELECT email, role, active')) return db[vals[0]] ? [db[vals[0]]] : [];
  if (sql.startsWith('UPDATE')) { const e = vals[vals.length - 1]; const cols = sql.match(/SET (.*), updated_at/)[1].split(', ').map(c => c.split(' ')[0]); cols.forEach((c, i) => db[e][c] = vals[i]); return []; }
  if (sql.startsWith('DELETE')) { delete db[vals[0]]; return []; }
  return [];
}
function sendResponse(res, code, body) { res.code = code; res.body = body; }
async function handleRequest(req, res, body0) {
  const pathname = req.url, method = req.method;
  const parseBody = async () => body0;
  try {
    // GET /api/admin/users
    if (pathname === '/api/admin/users' && method === 'GET') { sendResponse(res, 200, {}); return; }

    // POST /api/admin/users
    if (pathname === '/api/admin/users' && method === 'POST') { sendResponse(res, 201, {}); return; }

    // PUT & DELETE /api/admin/users/:email
    const adminUserMatch = pathname.match(/^\/api\/admin\/users\/(.+)$/);
    if (adminUserMatch) {
      const targetEmail = decodeURIComponent(adminUserMatch[1]);
      if (method === 'PUT') {
        const body = await parseBody(req);
        const sets = [];
        const vals = [];
        if (body.active !== undefined) { sets.push('active = ?'); vals.push(body.active ? 1 : 0); }
        if (body.role) { sets.push('role = ?'); vals.push(body.role); }
        if (sets.length === 0) { sendResponse(res, 400, { error: 'Nothing to update' }); return; }
        vals.push(targetEmail);
        await executeQuery('UPDATE admin_users SET ' + sets.join(', ') + ', updated_at = NOW() WHERE email = ?', vals);
        sendResponse(res, 200, { message: 'User updated' });
        return;
      }
      if (method === 'DELETE') {
        await executeQuery('DELETE FROM admin_users WHERE email = ?', [targetEmail]);
        sendResponse(res, 200, { message: 'User deleted' });
        return;
      }
    }
  } catch (e) { sendResponse(res, 500, { error: e.message }); }
}
const ddlLog = [];
const cols = new Set(['id', 'name']);
async function migrate(query) {
  try {
    await query("ALTER TABLE admin_users MODIFY COLUMN role ENUM('Super Admin','Mid Admin','Equipo Comercial','Auditor') NOT NULL DEFAULT 'Mid Admin'");
    await query("UPDATE admin_users SET role = 'Auditor' WHERE role = 'Auditor Clínico'");
  } catch (e) { console.error(e); }
}
async function initializePool() {
  const executeQuery = async (sql) => {
    ddlLog.push(sql);
    const m = sql.match(/ADD COLUMN (\w+)/);
    if (m) { if (cols.has(m[1])) throw new Error("Duplicate column name '" + m[1] + "'"); cols.add(m[1]); }
  };
  try {
    await executeQuery("UPDATE admin_users SET role = 'Auditor' WHERE role = 'Auditor Clínico'");
  } catch (e) { console.error(e); }
}
const jwt = { sign: (payload, secret, opts) => 'tok:' + opts.expiresIn };
const JWT_SECRET = 'x';
function generateToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}
module.exports = { handleRequest, db, initializePool, cols, ddlLog, generateToken };
