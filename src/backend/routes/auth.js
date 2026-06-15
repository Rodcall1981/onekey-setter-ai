const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/google/callback', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'No credential provided' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const nombre = payload.name;

    const allowedDomains = ['lupchile.com', 'onekeybroker.com', 'lupar.cl'];
    const domain = email.split('@')[1];

    if (!allowedDomains.includes(domain)) {
      return res.status(403).json({
        error: 'Email domain not authorized',
        message: 'Solo @lupchile.com, @onekeybroker.com, @lupar.cl'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let { data: usuario, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') {
      const { data: newUser, error: insertError } = await supabase
        .from('admin_users')
        .insert([{
          email: email,
          nombre: nombre,
          role: 'ejecutivo',
          estado: 'activo'
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      usuario = newUser;
    } else if (error) {
      throw error;
    }

    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('email', email);

    const jwtToken = jwt.sign(
      {
        email: usuario.email,
        role: usuario.role,
        adminId: usuario.id
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      jwt: jwtToken,
      email: usuario.email,
      nombre: usuario.nombre,
      role: usuario.role
    });

  } catch (err) {
    console.error('OAuth error:', err);
    return res.status(500).json({
      error: 'Authentication failed',
      message: err.message
    });
  }
});

router.get('/verify-token', verifyJWT, (req, res) => {
  return res.json({
    valid: true,
    email: req.user.email,
    role: req.user.role
  });
});

router.post('/logout', verifyJWT, (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out'
  });
});

router.post('/invite', verifyJWT, async (req, res) => {
  try {
    const { email, nombre } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can invite' });
    }

    const allowedDomains = ['lupchile.com', 'onekeybroker.com', 'lupar.cl'];
    const domain = email.split('@')[1];

    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({ error: 'Email domain not allowed' });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: existing } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const { data: newAdmin, error } = await supabase
      .from('admin_users')
      .insert([{
        email: email,
        nombre: nombre,
        role: 'admin',
        estado: 'activo',
        invitado_por: req.user.email
      }])
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: `Invitation sent to ${email}`
    });

  } catch (err) {
    console.error('Invite error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.verifyJWT = verifyJWT;
