const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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
    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Supabase error:', error.message);
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

module.exports = { saveAnalysis, saveClientProfile, saveSession, registerEvent };
