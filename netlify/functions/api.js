import { getFirebase } from './firebaseAdmin.js';

// Netlify Function entrypoint
export async function handler(event, context) {
  try {
    const { db } = getFirebase();
    const { httpMethod, path } = event;

    // Normalize path (Netlify passes full path like '/.netlify/functions/api/...')
    const apiPath = path.replace(/^\/.netlify\/functions\/api/, '');

    // Simple router
    if (apiPath.startsWith('/services')) {
      return await handleCollection(db.ref('services'), apiPath, httpMethod, event);
    }
    if (apiPath.startsWith('/categories')) {
      return await handleCollection(db.ref('categories'), apiPath, httpMethod, event);
    }
    if (apiPath.startsWith('/admin/users')) {
      return await handleUsers(db, apiPath, httpMethod, event);
    }
    if (apiPath.startsWith('/banners')) {
      return await handleCollection(db.ref('banners'), apiPath, httpMethod, event);
    }
    // Public list endpoints
    if (apiPath.startsWith('/deals')) {
      return await handleCollection(db.ref('deals'), apiPath, httpMethod, event);
    }
    if (apiPath.startsWith('/weekdeals')) {
      return await handleCollection(db.ref('weekdeals'), apiPath, httpMethod, event);
    }
    if (apiPath.startsWith('/products')) {
      return await handleCollection(db.ref('products'), apiPath, httpMethod, event);
    }
    if (apiPath.startsWith('/brands')) {
      return await handleCollection(db.ref('brands'), apiPath, httpMethod, event);
    }
    if (apiPath === '/admin/login' && httpMethod === 'POST') {
      // Minimal stub to avoid 404 during migration; implement real auth later
      return json(200, { success: true, message: 'Logged in (stub)' });
    }
    if (apiPath.startsWith('/admin/products')) {
      return await handleCollection(db.ref('products'), apiPath.replace('/admin', ''), httpMethod, event);
    }
    if (apiPath.startsWith('/admin/deals')) {
      return await handleCollection(db.ref('deals'), apiPath.replace('/admin', ''), httpMethod, event);
    }
    if (apiPath.startsWith('/admin/weekdeals')) {
      return await handleCollection(db.ref('weekdeals'), apiPath.replace('/admin', ''), httpMethod, event);
    }

    return json(404, { message: 'Not Found', path: apiPath });
  } catch (err) {
    console.error('Function error:', err);
    return json(500, { message: 'Internal Server Error', error: err.message });
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify(body),
  };
}

async function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

// Generic collection handler: supports
// GET /collection -> list
// POST /collection -> add
// PUT /collection/:id -> update
// DELETE /collection/:id -> delete
async function handleCollection(ref, apiPath, method, event) {
  const id = extractId(apiPath);

  if (method === 'OPTIONS') return json(204, {});

  if (method === 'GET') {
    if (id) {
      const snap = await ref.child(id).get();
      if (!snap.exists()) return json(404, { message: 'Not found' });
      return json(200, { id, ...snap.val() });
    }
    const snap = await ref.get();
    const data = snap.val() || {};
    const list = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
    return json(200, list);
  }

  if (method === 'POST') {
    const body = await parseBody(event);
    const newRef = ref.push();
    const payload = { ...body, created_at: Date.now() };
    await newRef.set(payload);
    return json(201, { id: newRef.key, ...payload });
  }

  if (method === 'PUT') {
    if (!id) return json(400, { message: 'ID is required' });
    const body = await parseBody(event);
    const updateRef = ref.child(id);
    const snap = await updateRef.get();
    if (!snap.exists()) return json(404, { message: 'Not found' });
    await updateRef.update({ ...body, updated_at: Date.now() });
    const updated = (await updateRef.get()).val();
    return json(200, { id, ...updated });
  }

  if (method === 'DELETE') {
    if (!id) return json(400, { message: 'ID is required' });
    await ref.child(id).remove();
    return json(200, { message: 'Deleted' });
  }

  return json(405, { message: 'Method Not Allowed' });
}

function extractId(apiPath) {
  const parts = apiPath.split('/').filter(Boolean); // remove empty
  // apiPath like '/services' or '/services/:id'
  if (parts.length >= 2) return parts[1];
  return null;
}

// Users admin handlers (minimal):
// GET /admin/users -> list
// POST /admin/users -> create
// DELETE /admin/users/:id -> delete
async function handleUsers(db, apiPath, method, event) {
  const ref = db.ref('users');
  const id = extractId(apiPath.replace('/admin', ''));

  if (method === 'OPTIONS') return json(204, {});

  if (method === 'GET') {
    const snap = await ref.get();
    const data = snap.val() || {};
    const list = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
    // Simple pagination placeholders (frontend expects shape sometimes)
    return json(200, { users: list, pagination: { totalPages: 1 } });
  }

  if (method === 'POST') {
    const body = await parseBody(event);
    // Basic unique email check
    const email = (body.email || '').toLowerCase();
    if (!email) return json(400, { message: 'Email is required' });

    const snap = await ref.orderByChild('email').equalTo(email).get();
    if (snap.exists()) return json(400, { message: 'Email already exists' });

    const newRef = ref.push();
    const payload = {
      username: body.username || '',
      email,
      phone: body.phone || '',
      address: body.address || '',
      bio: body.bio || '',
      is_admin: !!body.is_admin,
      created_at: Date.now(),
    };
    await newRef.set(payload);
    return json(201, { user: { id: newRef.key, ...payload } });
  }

  if (method === 'DELETE') {
    if (!id) return json(400, { message: 'ID is required' });
    await ref.child(id).remove();
    return json(200, { message: 'Deleted' });
  }

  return json(405, { message: 'Method Not Allowed' });
}
