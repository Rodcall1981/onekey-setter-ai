const { createClient } = require('@supabase/supabase-js');

// Debug: verificar variables de entorno
console.log('=== SUPABASE CLIENT INITIALIZATION ===');
console.log('SUPABASE_URL defined:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_URL value (first 50 chars):', process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 50) + '...' : 'UNDEFINED');
console.log('SUPABASE_URL length:', process.env.SUPABASE_URL ? process.env.SUPABASE_URL.length : 0);
console.log('SUPABASE_URL has trailing slash:', process.env.SUPABASE_URL ? process.env.SUPABASE_URL.endsWith('/') : 'N/A');
console.log('SUPABASE_KEY defined:', !!process.env.SUPABASE_KEY);
console.log('SUPABASE_KEY length:', process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : 0);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

console.log('Supabase client created:', !!supabase);
console.log('=== END SUPABASE INIT ===');

const saveAnalysis = async (sessionData) => {
  try {
    const { data, error } = await supabase
      .from('analysis_logs')
      .insert([sessionData]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Supabase error:', error.message);
    return { success: false, error: error.message };
  }
};

const saveClientProfile = async (profileData) => {
  try {
    const { data, error } = await supabase
      .from('client_profiles')
      .insert([profileData]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Supabase error:', error.message);
    return { success: false, error: error.message };
  }
};

const saveSession = async (sessionData) => {
  try {
    console.log('\n--- saveSession START ---');
    console.log('Inserting data:', JSON.stringify(sessionData));
    console.log('Table name: sessions');
    console.log('Supabase client valid:', !!supabase);
    console.log('Supabase URL:', process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : 'UNDEFINED');

    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select();

    console.log('Response - data:', data);
    console.log('Response - error:', error);

    if (error) {
      console.error('❌ Supabase insert error:');
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      console.error('  Details:', error.details);
      console.error('  Hint:', error.hint);
      console.error('  Full error object:', JSON.stringify(error, null, 2));
      throw error;
    }
    console.log('✅ saveSession - success, returned data:', data);
    console.log('--- saveSession END ---\n');
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('❌ Supabase error (catch block):', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    console.log('--- saveSession END (ERROR) ---\n');
    return { success: false, error: error.message };
  }
};

// ESTACIÓN 1: Registrar evento de sesión
const registerEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('session_events')
      .insert([eventData])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Supabase error:', error.message);
    return { success: false, error: error.message };
  }
};

// ESTACIÓN 2: Guardar Discovery responses
const saveDiscovery = async (discoveryData) => {
  try {
    console.log('saveDiscovery - inserting data:', discoveryData);
    const { data, error } = await supabase
      .from('discovery_responses')
      .insert([discoveryData])
      .select();

    if (error) {
      console.error('Supabase discovery insert error:', error.code, error.message, error.details);
      throw error;
    }
    console.log('saveDiscovery - success, returned data:', data);
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Supabase discovery error (catch):', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { saveAnalysis, saveClientProfile, saveSession, registerEvent, saveDiscovery };
