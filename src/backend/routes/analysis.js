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

// ESTACIÓN 1: Obtener sesiones recientes del setter
router.get('/my-sessions/:setterId', async (req, res) => {
  try {
    const { setterId } = req.params;

    if (!setterId) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Requiere "setterId"'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // Obtener sesiones del setter, últimas 15, ordenadas por fecha
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, client_name, reunion_mode, created_at')
      .eq('setter_id', setterId)
      .order('created_at', { ascending: false })
      .limit(15);

    if (error) {
      console.error('Supabase sessions fetch error:', error.message);
      return res.status(500).json({
        error: 'Failed to fetch sessions',
        details: error.message
      });
    }

    // Enriquecer con progreso de cada sesión
    const enrichedSessions = await Promise.all((sessions || []).map(async (session) => {
      // Verificar si tiene discovery
      const { data: discovery } = await supabase
        .from('discovery_responses')
        .select('id')
        .eq('session_id', session.id)
        .single();

      // Verificar si tiene profile
      const { data: profile } = await supabase
        .from('profile_semaforo')
        .select('id')
        .eq('session_id', session.id)
        .single();

      // Verificar si tiene proyectos
      const { data: projects } = await supabase
        .from('station4_projects')
        .select('id')
        .eq('session_id', session.id);

      // Calcular progreso
      let progress = 0;
      let stage = 'S1'; // Station 1

      if (discovery) {
        progress = 30;
        stage = 'S2';
      }
      if (profile) {
        progress = 60;
        stage = 'S3';
      }
      if (projects && projects.length > 0) {
        progress = 100;
        stage = 'S4';
      }

      return {
        id: session.id,
        client_name: session.client_name,
        reunion_mode: session.reunion_mode,
        progress: progress,
        stage: stage,
        has_projects: (projects || []).length > 0,
        created_at: session.created_at
      };
    }));

    res.json({
      success: true,
      sessions: enrichedSessions
    });

  } catch (error) {
    console.error('My sessions route error:', error);
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

    // Build summary object from available data (even if partial)
    const summary = discovery ? {
      intention: discovery.p_intention || 'N/A',
      profile: profile?.profile_detected || 'Pendiente',
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
      maxLoan: profile?.max_loan_amount_clp || null,
      affordablePropertyUF: profile?.affordable_property_uf || null,
      estimatedDividend: profile?.estimated_dividend_clp || null,
      loanTermYears: profile?.loan_term_years || null
    } : null;

    // If no data at all, return empty but valid response
    if (!discovery && !profile) {
      return res.json({
        success: true,
        summary: {}
      });
    }

    res.json({
      success: true,
      summary: summary || {}
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
      process.env.SUPABASE_SERVICE_ROLE_KEY
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
      process.env.SUPABASE_SERVICE_ROLE_KEY
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
      process.env.SUPABASE_SERVICE_ROLE_KEY
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

// ESTACIÓN 5: OBJECIONES
const config = require('../config');
const { Anthropic } = require('@anthropic-ai/sdk');

// Las 5 objeciones grandes pre-resueltas (texto fijo del blueprint)
const PREBUILT_OBJECTIONS = {
  PENSAR_CON_PAREJA: {
    tipo: 'PENSAR_CON_PAREJA',
    titulo: 'Lo voy a pensar / lo converso con mi pareja',
    pasos: {
      paso_1_acuerdo: 'Por supuesto, una decisión así se piensa, y conversarla en pareja es lo correcto.',
      paso_2_aislamiento: 'Antes de cerrar, déjame asegurarme: además de conversarlo con tu pareja, ¿hay algo más del proyecto, del flujo o del proceso que necesites resolver?',
      paso_3_indagacion: 'Para que la conversación con tu pareja sea productiva, ¿qué crees que va a querer saber ella/él? Porque la pareja suele tener 2-3 preguntas específicas, y si no las llevas resueltas, queda en "mejor lo pensamos más".',
      paso_4_reframe: 'Lo que mejor funciona es una llamada de 20 minutos con tu pareja. Yo le explico lo mismo que a ti — tú no tienes que ser el vendedor de tu propia inversión. ¿Mañana o pasado?',
      paso_5_test: '¿Te calza martes 7 o miércoles 8?'
    }
  },
  CARO_ESPERAR: {
    tipo: 'CARO_ESPERAR',
    titulo: 'Está caro / mejor espero que bajen las tasas',
    pasos: {
      paso_1_acuerdo: 'Te entiendo, es lo que mucha gente está pensando ahora.',
      paso_2_aislamiento: '¿Es el precio del departamento lo que se siente caro, o es la cuota mensual lo que te preocupa? Son dos cosas distintas.',
      paso_3_indagacion: '¿Con qué estás comparando para decir caro? ¿Otro proyecto, el precio de hace 2 años, tu presupuesto inicial?',
      paso_4_reframe: 'Hace 2 años este modelo costaba UF X. Hoy UF Y. Subió Z%. El año que viene, con esa tendencia, UF W. Esperar te sale más caro que comprar caro. [Alternativo: Las tasas bajaron fuerte por última vez en XXXX. ¿Sabes qué pasó con los precios? Subieron X%. Cuando bajan las tasas sube la demanda, suben los precios y desaparece el inventario bueno. Esperar la tasa perfecta es llegar tarde.]',
      paso_5_test: '¿Vemos las dos formas de financiar para que veas la cuota concreta y decidas desde ahí?'
    }
  },
  COMPARAR_PROYECTOS: {
    tipo: 'COMPARAR_PROYECTOS',
    titulo: 'Quiero comparar con otros proyectos',
    pasos: {
      paso_1_acuerdo: 'Excelente, eso es lo que haría un buen inversor. Comparar mal es peor que no comparar.',
      paso_2_aislamiento: '¿Qué proyectos específicos estás viendo? Te pregunto porque conozco casi todos los activos en venta en Santiago y te puedo ahorrar el análisis.',
      paso_3_indagacion: '¿Qué criterios estás usando? Porque la mayoría compara precio por m², y ese es el que MENOS importa para inversión.',
      paso_4_reframe: 'Para inversión importan: cap rate proyectado, tasa de captura de la comuna, plusvalía histórica vs proyectada, perfil del arrendatario, y costo total (no precio inicial). Te propongo algo: dame los 2-3 que estás viendo y armo la comparación con criterios reales. Si el otro gana, te lo digo y te ayudo a llevarlo. Mi negocio es que inviertas bien, no que inviertas conmigo.',
      paso_5_test: '¿Te calza tener el comparativo para el viernes?'
    }
  },
  SOLO_INFO: {
    tipo: 'SOLO_INFO',
    titulo: 'Solo quiero info, no quiero reunión / mándame todo',
    pasos: {
      paso_1_acuerdo: 'Claro, nadie quiere sentirse presionado.',
      paso_2_aislamiento: '¿Qué es lo que no quieres que pase si nos juntamos a revisar tu caso?',
      paso_3_indagacion: '(Escucha: casi siempre "que me presionen")',
      paso_4_reframe: 'Te propongo algo distinto: en vez de mandarte 30 PDFs que vas a filtrar solo, hagamos 15 minutos donde te entrego el análisis personalizado de TU situación. Si al minuto 14 sientes que no aporta, cortas. ¿Justo?',
      paso_5_test: '¿Tienes esos 15 minutos esta semana o la próxima?'
    }
  },
  VER_PRESENCIAL: {
    tipo: 'VER_PRESENCIAL',
    titulo: 'Quiero ir a verlo antes de decidir',
    pasos: {
      paso_1_acuerdo: 'Me parece perfecto, y de hecho te lo recomiendo — una inversión así hay que verla en persona.',
      paso_2_aislamiento: 'Antes de coordinar la visita, déjame preguntarte: si vas, te gusta lo que ves y los números te cierran, ¿hay algo más que te frenaría para avanzar?',
      paso_3_indagacion: '(Si dice "no, nada más" = interés real, cierra con la visita. Si menciona algo más = ESE es el punto real, loopealo primero)',
      paso_4_reframe: 'Hagamos esto: dejas la reserva de $100.000 ahora, congelamos la unidad, y vamos juntos a verla. Si en persona no te convence, te devuelvo el 100% ahí mismo y sin preguntas. Así no arriesgas nada, y te aseguras de que la unidad siga disponible cuando la veas — porque si la dejas suelta, perfectamente la toma otro antes de tu visita.',
      paso_5_test: '¿Te parece? Dejamos la reserva y coordinamos la visita para [día]. ¿Te calza [opción A] o [opción B]?'
    }
  }
};

router.post('/objections', async (req, res) => {
  try {
    const { session_id, objection_type, objection_text, triggered_from_station, profile } = req.body;

    if (!session_id || !objection_type || !triggered_from_station) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Requiere: session_id, objection_type, triggered_from_station'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let resolution_steps = {};
    let is_predefined = false;
    let ai_generated = false;

    // MODO A: Objeciones pre-resueltas (5 grandes)
    if (PREBUILT_OBJECTIONS[objection_type]) {
      resolution_steps = PREBUILT_OBJECTIONS[objection_type].pasos;
      is_predefined = true;
    }
    // MODO B: Objeción nueva (llamar a Claude Haiku)
    else if (objection_type === config.OBJECTION_TYPES.NUEVA) {
      if (!objection_text) {
        return res.status(400).json({
          error: 'Missing objection text',
          message: 'Para objeción nueva, requiere: objection_text'
        });
      }

      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          return res.status(500).json({
            error: 'Missing ANTHROPIC_API_KEY',
            details: 'ANTHROPIC_API_KEY not configured in environment'
          });
        }

        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });

        const prompt = `Eres un asesor inmobiliario chileno (sector ejecutivo/clase media alta). El cliente objetó: "${objection_text}".

Usa el loop de 5 pasos (Acuerdo, Aislamiento, Indagación, Reframe, Test) en CHILENO NATURAL Y DIRECTO, como hablamos en reuniones reales. Sin formalidades, sin "Cachai", sin jerga exagerada. Tono profesional pero cercano.

Máximo 1-2 frases por paso. Si necesitas datos que no tienes, usa [DATO].

Responde SOLO en JSON:
{
  "paso_1_acuerdo": "frase aquí",
  "paso_2_aislamiento": "frase aquí",
  "paso_3_indagacion": "frase aquí",
  "paso_4_reframe": "frase aquí",
  "paso_5_test": "frase aquí"
}`;

        const message = await anthropic.messages.create({
          model: config.AI.OBJECTIONS_MODEL,
          max_tokens: config.AI.OBJECTIONS_MAX_TOKENS,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        let responseText = message.content[0].text;

        // Extraer JSON del bloque markdown si viene envuelto (```json ... ```)
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                         responseText.match(/```\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          responseText = jsonMatch[1];
        }

        resolution_steps = JSON.parse(responseText);
        ai_generated = true;
      } catch (aiError) {
        console.error('Claude Haiku error:', aiError.message);
        return res.status(500).json({
          error: 'Failed to generate objection handling',
          details: aiError.message
        });
      }
    } else {
      return res.status(400).json({
        error: 'Invalid objection type',
        message: 'Debe ser una de: ' + Object.keys(config.OBJECTION_TYPES).join(', ')
      });
    }

    // Guardar en BD (sin created_at — usa default now())
    const { data, error } = await supabase
      .from('objections')
      .insert([{
        session_id,
        objection_text: objection_text || PREBUILT_OBJECTIONS[objection_type]?.titulo || objection_type,
        objection_type,
        resolution_steps,
        is_predefined,
        ai_generated,
        triggered_from_station
      }])
      .select();

    if (error) {
      console.error('Supabase objection insert error:', error.message);
      return res.status(500).json({
        error: 'Failed to save objection',
        details: error.message
      });
    }

    res.json({
      success: true,
      objection_id: data?.[0]?.id,
      resolution_steps,
      is_predefined,
      ai_generated
    });

  } catch (error) {
    console.error('Objections route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ESTACIÓN 6: CIERRE + RESERVA
router.post('/closing', async (req, res) => {
  try {
    const {
      session_id,
      closing_type,
      closing_script_used,
      reservation_offered,
      reservation_accepted,
      reservation_amount_paid_clp,
      day_0_promise_scheduled_at,
      advisor_checklist_completed
    } = req.body;

    if (!session_id || typeof reservation_offered !== 'boolean' || !closing_type) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Requiere: session_id, closing_type, reservation_offered (true/false)'
      });
    }

    if (reservation_offered && !reservation_accepted && !day_0_promise_scheduled_at) {
      // Si ofreció pero no aceptó, day_0 no es requerido
    } else if (reservation_accepted && !day_0_promise_scheduled_at) {
      return res.status(400).json({
        error: 'Missing day 0 scheduling',
        message: 'Si reservó, requiere agendar day_0_promise_scheduled_at'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Guardar en closing (sin created_at — usa default now())
    const closingData = {
      session_id,
      closing_type,
      closing_script_used: closing_script_used || null,
      reservation_offered,
      reservation_accepted: reservation_accepted || false,
      reservation_amount_paid_clp: reservation_amount_paid_clp || null,
      day_0_promise_scheduled_at: day_0_promise_scheduled_at || null,
      advisor_checklist_completed: advisor_checklist_completed || false,
      completed_at: new Date().toISOString()
    };

    const { data: closingResult, error: closingError } = await supabase
      .from('closing')
      .insert([closingData])
      .select();

    if (closingError) {
      console.error('Supabase closing insert error:', closingError.message);
      return res.status(500).json({
        error: 'Failed to save closing',
        details: closingError.message
      });
    }

    // Registrar evento station_completed (6)
    const eventData = {
      session_id,
      event_type: 'station_completed',
      station_number: 6,
      data: {
        reservation_offered,
        reservation_accepted,
        closing_type
      }
    };

    const { error: eventError } = await supabase
      .from('session_events')
      .insert([eventData]);

    if (eventError) {
      console.error('Event insert error:', eventError.message);
      // No fallar si el evento no se guarda, pero loguearlo
    }

    res.json({
      success: true,
      closing: closingResult?.[0],
      result: reservation_accepted ? 'RESERVÓ' : (reservation_offered ? 'OFRECÍ_NO' : 'NO_OFRECÍ')
    });

  } catch (error) {
    console.error('Closing route error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

module.exports = router;
