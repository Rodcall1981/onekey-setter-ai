const express = require('express');
const router = express.Router();
const { analyzeConversation } = require('../services/claudeService');
const { saveAnalysis, saveSession, registerEvent, saveDiscovery } = require('../services/supabaseService');
const { validateCompleteness } = require('../services/geminiService');

router.post('/analyze', async (req, res) => {
  try {
    const { text, session_id } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Text required',
        message: 'Envía un "text" en el body'
      });
    }

    // Llamar a Claude para análisis
    const analysis = await analyzeConversation(text);

    if (!analysis.success) {
      return res.status(500).json({
        error: 'Analysis failed',
        details: analysis.error
      });
    }

    // Guardar en Supabase si tenemos datos estructurados
    if (analysis.data) {
      const logData = {
        session_id: session_id || null,
        transcription: analysis.data.transcription_partial || text,
        questions_answered: analysis.data.questions_answered || 0,
        scores: analysis.data.scores || {},
        red_flags: analysis.data.red_flags || [],
        positive_signals: analysis.data.positive_signals || [],
        next_question: analysis.data.next_question_recommended || '',
        tactical_note: analysis.data.tactical_note || ''
      };

      await saveAnalysis(logData);
    }

    res.json({
      success: true,
      analysis: analysis.data || analysis.raw,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { meetNotes, questions } = req.body;

    if (!meetNotes || !questions) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Requiere "meetNotes" y "questions" en el body'
      });
    }

    const result = await validateCompleteness({ meetNotes, questions });

    if (!result.success) {
      return res.status(500).json({
        error: 'Validation failed',
        details: result.error
      });
    }

    res.json({
      success: true,
      gaps: result.gaps,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Validate route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 1: Crear sesión
router.post('/sessions', async (req, res) => {
  try {
    const { setter_id, client_name, reunion_mode } = req.body;

    if (!setter_id || !client_name) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Requiere "setter_id" y "client_name"'
      });
    }

    const sessionData = {
      setter_id,
      client_name
    };

    // Enviar reunion_mode solo si viene (para sobrescribir el default si aplica)
    if (reunion_mode) {
      sessionData.reunion_mode = reunion_mode;
    }

    const result = await saveSession(sessionData);

    if (!result.success) {
      console.error('Supabase session error:', result.error);
      return res.status(500).json({
        error: 'Failed to create session',
        details: result.error
      });
    }

    res.json({
      success: true,
      id: result.data.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sessions route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Registrar evento de sesión
router.post('/events', async (req, res) => {
  try {
    const { session_id, advisor_name, event_type, station_number, metadata } = req.body;

    if (!session_id || !advisor_name || !event_type) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Requiere "session_id", "advisor_name" y "event_type"'
      });
    }

    const result = await registerEvent({
      session_id,
      advisor_name,
      event_type,
      station_number: station_number || null,
      metadata: metadata || {}
    });

    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to register event',
        details: result.error
      });
    }

    res.json({
      success: true,
      id: result.data.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Events route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 2: Guardar Discovery responses
router.post('/discovery', async (req, res) => {
  try {
    const { session_id, ...discoveryData } = req.body;

    if (!session_id) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Requiere "session_id"'
      });
    }

    const result = await saveDiscovery({
      session_id,
      ...discoveryData
    });

    if (!result.success) {
      console.error('Supabase discovery error:', result.error);
      return res.status(500).json({
        error: 'Failed to save discovery',
        details: result.error
      });
    }

    res.json({
      success: true,
      id: result.data.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Discovery route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 3: Obtener Discovery responses para perfil detection
router.get('/discovery/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Requiere "sessionId" en URL'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data: dataArray, error } = await supabase
      .from('discovery_responses')
      .select('*')
      .eq('session_id', sessionId)
      .limit(1);

    if (error) {
      console.error('Supabase discovery fetch error:', error.message);
      return res.status(500).json({
        error: 'Failed to fetch discovery',
        details: error.message
      });
    }

    const data = dataArray && dataArray.length > 0 ? dataArray[0] : {};

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Discovery fetch route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 3: Obtener business config constants
router.get('/business-config', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data, error } = await supabase
      .from('business_config')
      .select('config_key, config_value')
      .in('config_key', ['UF_VALUE_CLP', 'SEMAFORO_DIVIDEND_DIVISOR', 'SEMAFORO_GREEN_THRESHOLD_PERCENT', 'SEMAFORO_YELLOW_THRESHOLD_PERCENT']);

    if (error) {
      console.error('Supabase config fetch error:', error.message);
      return res.status(500).json({
        error: 'Failed to fetch config',
        details: error.message
      });
    }

    // Convertir array a object
    const config = {};
    (data || []).forEach(item => {
      config[item.config_key] = parseFloat(item.config_value);
    });

    res.json({
      success: true,
      config: {
        UF_VALUE_CLP: config.UF_VALUE_CLP || 41000,
        divisor: config.SEMAFORO_DIVIDEND_DIVISOR || 200,
        threshold_amarillo: config.SEMAFORO_GREEN_THRESHOLD_PERCENT || 25,
        threshold_rojo: config.SEMAFORO_YELLOW_THRESHOLD_PERCENT || 35
      }
    });

  } catch (error) {
    console.error('Config fetch route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 3: Guardar Profile + Semáforo
router.post('/profile-semaforo', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const {
      session_id,
      profile_detected,
      profile_corrected_by_advisor,
      traffic_light,
      semaforo_rationale,
      estimated_dividend_uf,
      dividend_to_income_percent,
      meeting_1_ended_at,
      meeting_2_scheduled_at,
      loan_term_years,
      max_loan_amount_clp,
      affordable_property_uf,
      estimated_dividend_clp
    } = req.body;

    if (!session_id) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Requiere "session_id"'
      });
    }

    const profileData = {
      session_id,
      profile_detected,
      profile_corrected_by_advisor,
      traffic_light,
      semaforo_rationale,
      estimated_dividend_uf,
      dividend_to_income_percent,
      meeting_1_ended_at,
      meeting_2_scheduled_at,
      loan_term_years,
      max_loan_amount_clp,
      affordable_property_uf,
      estimated_dividend_clp
    };

    const { data, error } = await supabase
      .from('profile_semaforo')
      .insert([profileData])
      .select();

    if (error) {
      console.error('Supabase profile insert error:', error.message);
      return res.status(500).json({
        error: 'Failed to save profile',
        details: error.message
      });
    }

    res.json({
      success: true,
      id: data[0].id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Profile-semaforo route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 4: Obtener resumen para panel (discovery + perfil + capacidad)
router.get('/summary/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Requiere "sessionId"'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // Get discovery data
    const { data: discoveryArray, error: discError } = await supabase
      .from('discovery_responses')
      .select('*')
      .eq('session_id', sessionId)
      .limit(1);

    const discovery = discoveryArray && discoveryArray.length > 0 ? discoveryArray[0] : null;

    if (discError) {
      return res.status(500).json({
        error: 'Failed to fetch discovery',
        details: discError.message
      });
    }

    if (!discovery) {
      return res.status(404).json({
        error: 'No discovery data found',
        details: 'Session ID not found in discovery_responses'
      });
    }

    // Get profile + capacity data
    const { data: profileArray, error: profError } = await supabase
      .from('profile_semaforo')
      .select('*')
      .eq('session_id', sessionId)
      .limit(1);

    const profile = profileArray && profileArray.length > 0 ? profileArray[0] : null;

    if (profError) {
      return res.status(500).json({
        error: 'Failed to fetch profile',
        details: profError.message
      });
    }

    if (!profile) {
      return res.status(404).json({
        error: 'No profile data found',
        details: 'Session ID not found in profile_semaforo'
      });
    }

    // Build summary object
    const summary = {
      intention: discovery.p_intention || 'N/A',
      profile: profile.profile_detected,
      age: discovery.p1_age,
      jobType: discovery.p1_job_type,
      jobDescription: discovery.p1_job_description,
      tenure: discovery.p1_tenure,
      monthlyIncome: discovery.p2_monthly_income_clp,
      totalDebt: discovery.p2_total_debt_clp,
      debtTypes: discovery.p2_debt_types,
      downPayment: discovery.p3_down_payment_clp,
      downPaymentUF: discovery.p3_down_payment_uf,
      motivation: discovery.p4_motivation_tags,
      pain: discovery.p5_pain_tags,
      emotionalIntensity: discovery.p5_emotional_intensity_slider,
      anchors: discovery.p6_emotional_anchors,
      decisionMakers: discovery.p7_decision_makers,
      hasHiddenDecision: discovery.p7_has_hidden_decisor,
      readiness: discovery.p8_readiness_slider,
      friction: discovery.p8_friction_tags,
      maxLoan: profile.max_loan_amount_clp,
      affordablePropertyUF: profile.affordable_property_uf,
      estimatedDividend: profile.estimated_dividend_clp,
      loanTermYears: profile.loan_term_years
    };

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Summary route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 4: Guardar proyectos
router.post('/projects', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const {
      session_id,
      project_number,
      project_state,
      comuna,
      address,
      gmaps_link,
      amenities,
      typologies,
      price_from_uf,
      local_rent_uf,
      appreciation_percent,
      image_urls
    } = req.body;

    if (!session_id || !project_number || !project_state || !comuna || !address || !typologies || !price_from_uf) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Requiere: session_id, project_number, project_state, comuna, address, typologies, price_from_uf'
      });
    }

    const projectData = {
      session_id,
      project_number,
      project_state,
      comuna,
      address,
      gmaps_link: gmaps_link || null,
      amenities: amenities || null,
      typologies,
      price_from_uf: parseFloat(price_from_uf),
      local_rent_uf: local_rent_uf ? parseFloat(local_rent_uf) : null,
      appreciation_percent: appreciation_percent ? parseFloat(appreciation_percent) : null,
      image_urls: image_urls || []
    };

    const { data, error } = await supabase
      .from('station4_projects')
      .insert([projectData])
      .select();

    if (error) {
      console.error('Supabase project insert error:', error.message);
      return res.status(500).json({
        error: 'Failed to save project',
        details: error.message
      });
    }

    res.json({
      success: true,
      id: data[0].id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Project save route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 4: Obtener proyectos de una sesión
router.get('/projects/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Requiere "sessionId"'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data, error } = await supabase
      .from('station4_projects')
      .select('*')
      .eq('session_id', sessionId)
      .order('project_number', { ascending: true });

    if (error) {
      console.error('Supabase projects fetch error:', error.message);
      return res.status(500).json({
        error: 'Failed to fetch projects',
        details: error.message
      });
    }

    res.json({
      success: true,
      projects: data || []
    });

  } catch (error) {
    console.error('Projects fetch route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 4: Upload image to Storage
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-project-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        details: 'Requiere un archivo en el campo "file"'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const sessionId = req.body.sessionId || 'temp';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${sessionId}_${timestamp}_${randomStr}_${req.file.originalname}`;

    const { data, error } = await supabase
      .storage
      .from('station4_project_images')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return res.status(500).json({
        error: 'Failed to upload image',
        details: error.message
      });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/station4_project_images/${filename}`;

    res.json({
      success: true,
      url: publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

module.exports = router;
