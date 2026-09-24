const { createHash } = require('node:crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  },
  body: JSON.stringify(body)
});

function usernameEmail(username) {
  const normalized = username.trim().normalize('NFKC').toLowerCase();
  const id = createHash('sha256').update(normalized).digest('hex');
  return `u-${id}@users.forge.invalid`;
}

async function supabase(path, key, body, method = 'POST') {
  return fetch(`${supabaseUrl}${path}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') return response(204, {});
  if (event.httpMethod !== 'POST') return response(405, { error: 'Method not allowed.' });
  if (!supabaseUrl || !serviceKey || !anonKey) {
    console.error('Username auth is missing required Supabase environment variables.');
    return response(500, { error: 'Authentication is not configured yet.' });
  }

  try {
    const { action, username, password } = JSON.parse(event.body || '{}');
    const name = typeof username === 'string' ? username.trim() : '';
    if (!['signin', 'signup'].includes(action)) return response(400, { error: 'Invalid request.' });
    if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/u.test(name)) {
      return response(400, { error: 'Username must be 1–80 characters.' });
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return response(400, { error: 'Password must be 8–72 characters.' });
    }

    const email = usernameEmail(name);
    if (action === 'signup') {
      const created = await supabase('/auth/v1/admin/users', serviceKey, {
        email,
        password,
        email_confirm: true,
        user_metadata: { username: name }
      });
      if (!created.ok) {
        const issue = await created.json().catch(() => ({}));
        if (created.status === 422 || created.status === 409) {
          return response(409, { error: 'That username is already in use.' });
        }
        console.error('Supabase account creation failed:', created.status, issue.code || issue.error);
        return response(502, { error: 'Could not create your account. Please try again.' });
      }
    }

    const signedIn = await supabase('/auth/v1/token?grant_type=password', anonKey, { email, password });
    const session = await signedIn.json().catch(() => ({}));
    if (!signedIn.ok || !session.access_token) {
      if (action === 'signin') return response(401, { error: 'Username or password is incorrect.' });
      console.error('New account could not start a session:', session.code || session.error);
      return response(502, { error: 'Account created, but sign-in failed. Try signing in.' });
    }
    return response(200, { session });
  } catch (error) {
    console.error('Username auth request failed:', error.message);
    return response(400, { error: 'Could not process the authentication request.' });
  }
};
