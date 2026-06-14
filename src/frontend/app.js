const { useState } = React;
const e = React.createElement;

// ESTACIÓN 1: APERTURA - Guión literal del blueprint (chileno)
const APERTURA_SCRIPT = `Hola {clientName}, soy {advisorName}, asesor patrimonial en OneKey. Gracias por tu tiempo.

Esta reunión es el primer paso para lograr tu objetivo, sea inversión, crecimiento patrimonial o compra de una propiedad. Te voy a ser honesto desde ya: vamos a hacer algo distinto a lo que quizás esperas. Yo NO te voy a mostrar departamentos todavía.

Primero necesito entender bien tu situación, porque no estás comprando un par de zapatillas — esta es de las decisiones financieras más importantes de tu vida. Y mi análisis solo sirve si es sobre tu caso real, no sobre un folleto genérico.

Una cosa antes de partir: voy a tomar notas de la reunión para mandarte un resumen completo después. ¿Te parece bien?

Perfecto. La dinámica es simple: te voy a hacer unas preguntas, algunas personales sobre tu situación financiera. Necesito que seas lo más real posible — sin eso no puedo armarte nada serio. Al final, si lo que vemos te hace sentido, vas a poder dejar tu mejor opción asegurada. ¿De acuerdo? Partamos.`;

// ESTACIÓN 2: DISCOVERY - 8 preguntas críticas del blueprint
const DISCOVERY_QUESTIONS = [
  {
    id: 0,
    question: '¿Esta propiedad es para vivienda propia, segunda vivienda, o inversión?',
    field: 'p0',
    inputs: {
      intention: { type: 'tags', label: 'Intención', options: ['Vivienda propia', 'Segunda vivienda', 'Inversión'] }
    },
    help: 'Define el perfil base: Vivienda Propia vs. Inversión (Primera/Inversionista/Experto según otros datos).'
  },
  {
    id: 1,
    question: 'Cuéntame, ¿en qué trabajas, hace cuánto y qué edad tienes?',
    field: 'p1',
    inputs: {
      age: { type: 'number', label: 'Edad', placeholder: '40', required: true },
      job_description: { type: 'text', label: 'Descripción del trabajo', placeholder: 'Ej: Ingeniero, Vendedor, Empresario...' },
      job_type: { type: 'tags', label: 'Tipo de ocupación', options: ['Dependiente', 'Independiente', 'Empresario', 'Renta de inversiones'] },
      tenure: { type: 'tags', label: 'Antigüedad', options: ['<1 año', '1-3 años', '3+ años'] }
    },
    help: 'Estabilidad de ingreso y plazo de crédito según edad.'
  },
  {
    id: 2,
    question: '¿Cuál es aproximadamente tu renta líquida mensual? ¿Y tienes deudas activas — hipotecario, consumo, tarjetas? ¿Cuánto en total?',
    field: 'p2',
    inputs: {
      monthly_income: { type: 'number', label: 'Renta líquida mensual (CLP)', placeholder: '2000000' },
      total_debt: { type: 'number', label: 'Deuda total (CLP)', placeholder: '5000000' },
      debt_types: { type: 'tags', label: 'Tipo de deuda', options: ['Sin deudas', 'Deuda baja', 'Deuda media', 'Deuda alta', 'Morosidades'] }
    },
    help: 'Insumo directo del semáforo. La pregunta de morosidades es crítica.'
  },
  {
    id: 3,
    question: '¿Cuánto tienes disponible hoy para el pie? No es lo mismo armar estrategia con 5 millones que con 50.',
    field: 'p3',
    inputs: {
      down_payment: { type: 'number', label: 'Pie disponible (CLP)', placeholder: '15000000', required: true },
      contado: { type: 'checkbox', label: '💰 Compra al contado' }
    },
    help: 'Ancla la capacidad y alimenta el perfil y el semáforo.'
  },
  {
    id: 4,
    question: '¿Qué te motivó a buscar esto AHORA y no hace 3 años?',
    field: 'p4',
    inputs: {
      motivation: { type: 'tags', label: 'Motivación', options: ['Juntó capital', 'Cambió situación', 'Miedo a quedar atrás', 'Oportunidad puntual', 'Exploración', 'Otra'] },
      urgency: { type: 'slider', label: 'Urgencia (1-5)', min: 1, max: 5 }
    },
    help: 'Urgencia real vs exploración.'
  },
  {
    id: 5,
    question: '¿Y qué pasa si dentro de 3 años sigues sin invertir? ¿Cómo se ve tu situación?',
    field: 'p5',
    inputs: {
      pain: { type: 'tags', label: 'Dolor', options: ['Quedarse igual', 'Perder poder adquisitivo', 'Frustración', 'Miedo a vejez/retiro', 'Indiferente', 'Otra'] },
      intensity: { type: 'slider', label: 'Intensidad emocional (1-5)', min: 1, max: 5 }
    },
    help: 'Sin dolor con emoción (slider ≥3), el cliente no está listo.'
  },
  {
    id: 6,
    question: 'Aparte de la rentabilidad, ¿hay alguien específico en quien estés pensando con esto? Hijos, padres, tu retiro.',
    field: 'p6',
    inputs: {
      anchor: { type: 'tags', label: 'Ancla emocional', options: ['Hijos', 'Pareja', 'Padres', 'Retiro propio', 'Solo rentabilidad', 'Otra'] }
    },
    help: 'La motivación emocional bajo la racional. Combustible para las palancas.'
  },
  {
    id: 7,
    question: '¿Con quién más vas a tomar esta decisión?',
    field: 'p7',
    inputs: {
      decision_makers: { type: 'tags', label: 'Decisores', options: ['Solo yo', 'Pareja', 'Socio', 'Asesor financiero', 'Familia'] }
    },
    help: 'Si hay otro decisor, se incorpora ANTES de pedir reserva.'
  },
  {
    id: 8,
    question: 'Del 1 al 10, ¿qué tan listo estás para avanzar en los próximos 60 días? Y si encontráramos la opción ideal, ¿qué te llevaría a NO hacerlo?',
    field: 'p8',
    inputs: {
      readiness: { type: 'slider', label: 'Prontitud (1-10)', min: 1, max: 10 },
      friction: { type: 'tags', label: 'Frenos', options: ['Nada me frena', 'Necesito ver números', 'Miedo al crédito', 'Dudas del proyecto', 'Tema pareja', 'Otro'] }
    },
    help: 'Slider <7 → NO pedir reserva hoy → Nurturing. Slider ≥7 → luz verde.'
  }
];

// Mantener las 15 preguntas viejas como fallback si es necesario
const QUESTIONS = [
  {
    id: 1,
    block: 'BLOQUE 1: ACTIVACIÓN Y MOTIVACIÓN',
    text: '¿Qué te trae acá hoy? ¿De dónde nos conociste?',
    purpose: 'Detectar el punto de entrada, la fuente del lead y el nivel de motivación inicial.',
    howToListen: 'Nota el tono, la energía, si menciona un dolor específico o si es exploración general.',
    redFlags: 'Si dice "otro broker me envió", "estoy mirando en varios lados" o responde genérico.',
    completed: false,
    notes: ''
  },
  {
    id: 2,
    block: 'BLOQUE 1: ACTIVACIÓN Y MOTIVACIÓN',
    text: '¿Cuál es el propósito real detrás de esta inversión? Es decir, ¿qué quieres lograr comprando una propiedad?',
    purpose: 'Distinguir entre inversión de activo (cashflow/renta), activo crecimiento (plusvalía) o activo emocional.',
    howToListen: 'Profundiza si dice "ganar dinero". Pregunta si busca renta pasiva, apreciación, o un objetivo familiar.',
    redFlags: 'Respuestas como "no sé, solo quiero invertir" o "cualquier cosa que me haga dinero".',
    completed: false,
    notes: ''
  },
  {
    id: 3,
    block: 'BLOQUE 1: ACTIVACIÓN Y MOTIVACIÓN',
    text: '¿Cuándo necesitarías tener esto resuelto? ¿Hay una urgencia real o es algo que quieres explorar sin prisa?',
    purpose: 'Calibrar timeline y urgencia. Define si es un lead que necesita acelerar o que requiere educación lenta.',
    howToListen: 'Si dice "sin prisa", pregunta: ¿Por qué sin prisa? ¿Hay algo bloqueando?',
    redFlags: 'Si dice "lo antes posible" sin razón real, probablemente está presionado externamente.',
    completed: false,
    notes: ''
  },
  {
    id: 4,
    block: 'BLOQUE 2: SITUACIÓN FINANCIERA Y CAPACIDAD',
    text: '¿Cuéntame cómo está tu situación financiera hoy? ¿Cuál es aproximadamente tu ingreso mensual y cómo te llega? (Sueldo, honorarios, empresa, renta de inversiones, etc.)',
    purpose: 'Entender la estabilidad de ingresos y su composición. Un ingreso de $3M en sueldo es distinto a $3M de comisiones variables.',
    howToListen: 'Nota si hay ingresos recurrentes vs. variables. Si habla de comisiones, pregunta: ¿Hace cuánto tienes ese ingreso?',
    redFlags: 'Ingreso muy variable sin estabilidad = cliente de riesgo alto. Necesita más tiempo antes de comprometer.',
    completed: false,
    notes: ''
  },
  {
    id: 5,
    block: 'BLOQUE 2: SITUACIÓN FINANCIERA Y CAPACIDAD',
    text: '¿Tienes deudas activas? Hipotecario, créditos de consumo, microcréditos... ¿Cuál es aproximadamente tu monto total de deudas?',
    purpose: 'Evaluar la capacidad de endeudamiento disponible.',
    howToListen: 'Pregunta si está en Dicom. Esto afecta tasas de interés de futuro crédito.',
    redFlags: 'Deudas superiores al 60% de ingresos. Morosidades recientes (últimos 2 años).',
    completed: false,
    notes: ''
  },
  {
    id: 6,
    block: 'BLOQUE 2: SITUACIÓN FINANCIERA Y CAPACIDAD',
    text: '¿Cuánto capital tienes disponible hoy para invertir? Es decir, ¿cuánto podrías poner como pie de una compra sin afectar tu vida cotidiana?',
    purpose: 'Determinar el pie disponible y el monto máximo de compra realista.',
    howToListen: 'No es cuánto quiere invertir; es cuánto puede sin sufrir. ¿Qué porcentaje de ahorros puedes usar sin quedarte con cero reserva?',
    redFlags: 'Cliente que quiere poner más capital del que puede sin endeudarse al máximo.',
    completed: false,
    notes: ''
  },
  {
    id: 7,
    block: 'BLOQUE 2: SITUACIÓN FINANCIERA Y CAPACIDAD',
    text: '¿Tienes otros patrimonios o activos? (Otras propiedades, vehículos, inversiones, participación en sociedades, etc.)',
    purpose: 'Entender el patrimonio total del cliente. Esto define su tolerancia al riesgo.',
    howToListen: 'Pregunta desagregada: Casa donde vive, otras propiedades, acciones, fondos, participaciones en negocios.',
    redFlags: 'Patrimonio muy concentrado en una sola propiedad = riesgo de volatilidad alta.',
    completed: false,
    notes: ''
  },
  {
    id: 8,
    block: 'BLOQUE 3: EXPERIENCIA Y CONOCIMIENTO',
    text: '¿Has invertido en propiedades antes? Si es así, ¿cuál fue la experiencia? ¿Resultó bien o te quedó una lección importante?',
    purpose: 'Detectar experiencia previa y aprender de sus errores o aciertos.',
    howToListen: 'Si dice "bien", pregunta qué hizo bien. Si dice "desastre", pregunta qué aprendió.',
    redFlags: 'Malas experiencias previas sin aprendizaje = cliente resentido, necesita reencuadre.',
    completed: false,
    notes: ''
  },
  {
    id: 9,
    block: 'BLOQUE 3: EXPERIENCIA Y CONOCIMIENTO',
    text: '¿Entiendes cómo funciona una hipoteca? Me refiero a CAE, tasa, cuota inicial, cómo se calcula... ¿Es algo que dominas o es un área donde necesitarías ayuda?',
    purpose: 'Evaluar el nivel de conocimiento financiero del cliente. Determina cuánta educación debe incluir el proceso.',
    howToListen: 'Si dice "domino", pregunta: ¿Entiendes la diferencia entre tasa de interés y CAE?',
    redFlags: 'Respuestas vagas o contradictoras = cliente que necesitará mucha educación.',
    completed: false,
    notes: ''
  },
  {
    id: 10,
    block: 'BLOQUE 3: EXPERIENCIA Y CONOCIMIENTO',
    text: '¿Conoces indicadores como CAP RATE, ROI, plusvalía? ¿Los usas para evaluar una oportunidad o eso no está en tu radar?',
    purpose: 'Medir el nivel de sofisticación del inversor. Define el nivel de detalle en análisis de proyectos.',
    howToListen: 'Novato = no conoce nada (OK). Intermedio = escuchó algo pero no lo aplica. Avanzado = usa métricas para decidir.',
    redFlags: 'Afirma dominar métodos pero no puede explicarlos = probablemente no entiende.',
    completed: false,
    notes: ''
  },
  {
    id: 11,
    block: 'BLOQUE 4: TOLERANCIA AL RIESGO Y REALISMO',
    text: 'En una escala de 1 a 10, donde 1 es "quiero una inversión súper segura" y 10 es "quiero apalancamiento al máximo", ¿dónde te sitúas?',
    purpose: 'Calibrar la tolerancia emocional al riesgo.',
    howToListen: 'Pregunta de seguimiento: ¿Por qué elegiste ese número? ¿Hay algún evento que te pone nervioso?',
    redFlags: 'Alguien que dice "10" pero tiene ingreso variable y mucha deuda = cliente de riesgo alto.',
    completed: false,
    notes: ''
  },
  {
    id: 12,
    block: 'BLOQUE 4: TOLERANCIA AL RIESGO Y REALISMO',
    text: 'Imagina que inviertes en una propiedad de arriendo y tienes 2-3 meses sin inquilino. ¿Cómo lo manejarías? ¿Puedes cubrir el dividendo?',
    purpose: 'Medir la capacidad real de asumir volatilidad.',
    howToListen: '"Claro, tengo fondo de emergencia" = sano. "No sé, espero que no pase" = red flag.',
    redFlags: 'Cliente que no puede resistir 2-3 meses sin inquilino = necesita productos más seguros.',
    completed: false,
    notes: ''
  },
  {
    id: 13,
    block: 'BLOQUE 4: TOLERANCIA AL RIESGO Y REALISMO',
    text: '¿Cuál es realista tu expectativa de ganancia con esta inversión? Si dices "quiero ganar 10% anual", ¿en cuánto tiempo y en qué te basas?',
    purpose: 'Detectar y corregir expectativas mal calibradas.',
    howToListen: '"Depende, quiero ver qué oportunidades hay" = maduro. "He escuchado que se gana 15-20% fácil" = naive.',
    redFlags: 'Expectativas de 20%+ sin entender riesgo = cliente que se va a frustrar.',
    completed: false,
    notes: ''
  },
  {
    id: 14,
    block: 'BLOQUE 5: OBJECIONES Y MOTIVACIÓN VERDADERA',
    text: '¿Cuál es tu mayor preocupación o miedo con este proceso? ¿Hay algo que te genera duda al considerar invertir?',
    purpose: 'Sacar las objeciones reales a la luz. Las que no preguntas aparecen al final como blockers.',
    howToListen: '"Me da miedo meterme en una mala deuda" = miedo a decisiones malas. Oportunidad: posicionar diagnóstico como blindaje.',
    redFlags: 'Silencio o respuesta superficial = cliente guardándose información.',
    completed: false,
    notes: ''
  },
  {
    id: 15,
    block: 'BLOQUE 5: OBJECIONES Y MOTIVACIÓN VERDADERA',
    text: '¿Si al final del proceso descubrimos que no es el momento para invertir, estás OK con eso? ¿O esperas que sí o sí haya compra?',
    purpose: 'Identificar si el cliente está abierto a un "no" o si es de presión.',
    howToListen: '"Estoy abierto" = cliente sano. "No, voy a comprar sí o sí" = cliente presionado, probablemente tóxico.',
    redFlags: 'Si no está abierto a un "no", será cliente difícil de manejar.',
    completed: false,
    notes: ''
  }
];

const Header = ({ step, advisorName, clientName, completedCount }) => {
  const showProgress = step === 'questions';
  const getStepLabel = () => {
    if (step === 'apertura') return 'Estación 1: Apertura';
    if (step === 'questions') return 'Estación 2: Discovery';
    return 'OneKey Setter';
  };

  return e('div', { style: { background: '#383838', color: '#fff', padding: '16px 32px', borderBottom: '1px solid #4d5c61', position: 'sticky', top: 0, zIndex: 100 } },
    e('div', { style: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      e('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        e('span', { style: { fontSize: '18px', fontWeight: '300', letterSpacing: '-0.5px' } }, 'onekey'),
        e('span', { style: { fontSize: '12px', color: '#aaa', fontWeight: '400' } }, getStepLabel())
      ),
      showProgress && e('div', { style: { textAlign: 'right' } },
        e('p', { style: { margin: '0 0 6px', fontSize: '11px', color: '#aaa', fontWeight: '500' } }, advisorName && clientName ? clientName + ' • ' + completedCount + '/8' : 'Progreso'),
        e('div', { style: { width: '120px', background: '#515266', height: '3px', borderRadius: '2px', overflow: 'hidden' } },
          e('div', { style: { background: '#d1dfdf', height: '100%', width: (completedCount / 8 * 100) + '%', transition: 'width 0.3s' } })
        )
      )
    )
  );
};

const Footer = () => {
  return e('div', { style: { background: '#383838', color: '#fff', padding: '24px 32px', borderTop: '1px solid #4d5c61', marginTop: '0' } },
    e('div', { style: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      e('div', null,
        e('p', { style: { margin: '0', fontSize: '12px', color: '#aaa' } }, '© 2026 OneKey. Todos los derechos reservados.')
      ),
      e('div', { style: { display: 'flex', gap: '24px' } },
        e('a', { href: '#', style: { fontSize: '12px', color: '#d1dfdf', textDecoration: 'none' } }, 'Privacidad'),
        e('a', { href: '#', style: { fontSize: '12px', color: '#d1dfdf', textDecoration: 'none' } }, 'Términos'),
        e('a', { href: '#', style: { fontSize: '12px', color: '#d1dfdf', textDecoration: 'none' } }, 'Soporte')
      )
    )
  );
};

function Dashboard() {
  const [step, setStep] = useState('setup');
  const [advisorName, setAdvisorName] = useState('');
  const [clientName, setClientName] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [reunionMode, setReunionMode] = useState('2_reuniones');
  const [consentGiven, setConsentGiven] = useState(false);

  // ESTACIÓN 2: Discovery responses
  const [discoveryAnswers, setDiscoveryAnswers] = useState({
    p0: { intention: [], notes: '' },
    p1: { age: '', job_description: '', job_type: [], tenure: [], notes: '' },
    p2: { monthly_income: '', total_debt: '', debt_types: [], notes: '' },
    p3: { down_payment: '', down_payment_uf: 0, down_payment_range: '', contado: false, notes: '' },
    p4: { motivation: [], urgency: 3, notes: '' },
    p5: { pain: [], intensity: 3, notes: '' },
    p6: { anchor: [], notes: '' },
    p7: { decision_makers: [], hidden_decisor_flag: false, notes: '' },
    p8: { readiness: 5, friction: [], notes: '' }
  });
  const [expandedDiscoveryQuestion, setExpandedDiscoveryQuestion] = useState(0);
  const [focusedNoteField, setFocusedNoteField] = useState(null); // Para focus automático en "Otra"

  // ESTACIÓN 3: Profile + Capacity
  const [profileSemaforo, setProfileSemaforo] = useState(null);
  const [profileConfirmed, setProfileConfirmed] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // ESTACIÓN 4: Summary Panel
  const [summary, setSummary] = useState(null);

  // ESTACIÓN 4: Projects Form
  const [projects, setProjects] = useState([]);  // Array de proyectos guardados
  const [currentProject, setCurrentProject] = useState({
    project_number: 1,
    project_state: 'Blanco',
    comuna: '',
    address: '',
    gmaps_link: '',
    amenities: '',
    typologies: '',
    price_from_uf: '',
    local_rent_uf: '',
    appreciation_percent: '',
    image_urls: []
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  // Session recovery
  const [recentSessions, setRecentSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Load recent sessions when user enters their name
  React.useEffect(() => {
    if (advisorName.trim() && step === 'apertura' && !loadingSessions) {
      setLoadingSessions(true);
      fetch(`/api/my-sessions/${advisorName.trim()}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.sessions) {
            setRecentSessions(data.sessions);
          }
        })
        .catch(err => console.error('Fetch sessions error:', err))
        .finally(() => setLoadingSessions(false));
    }
  }, [advisorName, step]);

  // Old questions (fallback)
  const [questions, setQuestions] = useState(QUESTIONS);
  const [expandedQuestion, setExpandedQuestion] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meetNotes, setMeetNotes] = useState('');
  const [gaps, setGaps] = useState([]);
  const [validating, setValidating] = useState(false);

  // Station 5: Objeciones
  const [currentObjectionType, setCurrentObjectionType] = useState(null);
  const [objectionsCustomText, setObjectionsCustomText] = useState('');
  const [objectionsResolutionSteps, setObjectionsResolutionSteps] = useState(null);
  const [objectionsGenerating, setObjectionsGenerating] = useState(false);

  // Load summary when entering Station 4
  React.useEffect(() => {
    if (step === 'station_4_summary' && !summary && sessionId) {
      fetch(`/api/summary/${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.summary) {
            setSummary(data.summary);
          }
        })
        .catch(err => console.error('Summary fetch error:', err));
    }
  }, [step, sessionId]);

  // ESTACIÓN 1: Guardar sesión y registrar evento
  const saveSessionAndProceed = async () => {
    if (!advisorName.trim() || !clientName.trim() || !consentGiven) {
      setError('Por favor completa todos los campos y confirma el consentimiento');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Guardar sesión en Supabase (solo campos obligatorios + reunion_mode)
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setter_id: advisorName.trim(),
          client_name: clientName.trim(),
          reunion_mode: reunionMode
          // NO mandar: advisor_name, created_at, started_at, current_station, status
          // (todos tienen defaults en Supabase)
        })
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.message || 'Error al crear sesión');
      }

      const sessionData = await sessionResponse.json();
      const newSessionId = sessionData.id;
      setSessionId(newSessionId);

      // 2. Registrar evento 'station_started' para Estación 1 en session_events
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: newSessionId,
          advisor_name: advisorName.trim(),
          event_type: 'station_started',
          station_number: 1
        })
      });

      // 3. Registrar evento 'station_started' para Estación 2 (Discovery) al avanzar
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: newSessionId,
          advisor_name: advisorName.trim(),
          event_type: 'station_started',
          station_number: 2
        })
      });

      // Avanzar a Estación 2 (Discovery)
      setStep('questions');
    } catch (err) {
      setError('Error: ' + err.message);
      console.error('saveSessionAndProceed error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ESTACIÓN 3: Helper functions para detectar perfil y semáforo
  // ESTACIÓN 3: Calcular capacidad de compra basada ÚNICAMENTE en edad y renta
  // NO depende del pie - cliente puede financiar pie en construcción
  const calculateBuyingCapacity = async (sessionId) => {
    // Leer discovery_responses
    const discoveryResp = await fetch(`/api/discovery/${sessionId}`);
    const discovery = await discoveryResp.json();

    if (!discovery.success) {
      setError('Error al cargar datos de Discovery');
      return null;
    }

    const d = discovery.data;
    const clientAge = parseInt(d.p1_age) || 0;
    const monthlyIncomeClp = d.p2_monthly_income_clp || 1;

    // Leer business_config
    const configResp = await fetch('/api/business-config');
    const configData = await configResp.json();
    const config = configData.config || {};

    const annualRatePercent = parseFloat(config.ANNUAL_RATE_PERCENT || 4.0);
    const incomeToDividendRatio = parseFloat(config.INCOME_TO_DIVIDEND_RATIO || 25);
    const loanToValuePercent = parseFloat(config.LOAN_TO_VALUE_PERCENT || 80);
    const ufValueClp = parseFloat(config.UF_VALUE_CLP || 40771);

    // 1. Calcular dividendo máximo mensual (solo de renta, sin considerar pie)
    const dividendMaxClp = (monthlyIncomeClp * incomeToDividendRatio) / 100;

    // 2. Determinar plazo según edad (ÚNICO factor para plazo)
    let loanTermYears = 0;
    let ageCategory = '';
    if (clientAge <= 45) {
      loanTermYears = 30;
      ageCategory = 'hasta 45 años';
    } else if (clientAge <= 50) {
      loanTermYears = 25;
      ageCategory = '46-50 años';
    } else if (clientAge <= 55) {
      loanTermYears = 20;
      ageCategory = '51-55 años';
    } else if (clientAge <= 60) {
      loanTermYears = 15;
      ageCategory = '56-60 años';
    } else if (clientAge <= 65) {
      loanTermYears = 10;
      ageCategory = '61-65 años';
    } else {
      loanTermYears = 0;
      ageCategory = '66+ años (caso a caso)';
    }

    // 3. Fórmula de anualidad: PV = PMT × [1 - (1+i)^-n] / i
    // PMT = dividendo máximo, i = tasa mensual, n = plazo en meses
    // El pie NO entra en este cálculo - es capacidad de financiamiento, no de compra
    let maxLoanAmountClp = 0;
    if (loanTermYears > 0) {
      const monthlyRate = (annualRatePercent / 100) / 12;
      const monthCount = loanTermYears * 12;
      const numerator = 1 - Math.pow(1 + monthlyRate, -monthCount);
      const denominator = monthlyRate;
      maxLoanAmountClp = dividendMaxClp * (numerator / denominator);
    }

    // 4. Valor de la propiedad = crédito / (LTV%)
    // Si el cliente tiene pie, lo suma a esta compra; si no, financia el 100% (en blanco)
    const propertyValueClp = loanToValuePercent > 0 ? maxLoanAmountClp / (loanToValuePercent / 100) : 0;
    const affordablePropertyUf = propertyValueClp / ufValueClp;

    // 5. Dividendo estimado (lo que pagaría mensualmente)
    const estimatedDividendClp = dividendMaxClp;

    return {
      clientAge,
      ageCategory,
      loanTermYears,
      monthlyIncomeClp,
      dividendMaxClp,
      maxLoanAmountClp,
      propertyValueClp,
      affordablePropertyUf,
      estimatedDividendClp,
      annualRatePercent,
      ufValueClp
    };
  };

  const detectProfileAndSemaforo = async (sessionId) => {
    // Leer discovery_responses
    const discoveryResp = await fetch(`/api/discovery/${sessionId}`);
    const discovery = await discoveryResp.json();

    if (!discovery.success) {
      setError('Error al cargar datos de Discovery');
      return null;
    }

    const d = discovery.data;

    // Leer valores de business_config
    const configResp = await fetch('/api/business-config');
    const configData = await configResp.json();
    const config = configData.config || {};

    const ufValueClp = parseFloat(config.UF_VALUE_CLP || 41000);
    const divisor = parseFloat(config.divisor || 200);
    const greenThreshold = parseFloat(config.threshold_amarillo || 25);
    const yellowThreshold = parseFloat(config.threshold_rojo || 35);

    // ========== AUTO-DETECT PERFIL ==========
    // Primero: usar p_intention si está disponible
    const intention = d.p_intention;

    let profileDetected = null;
    let profileAlt = null;

    // Si la intención es explícita, usar eso como base
    if (intention === 'Inversión') {
      profileDetected = 'INVERSIONISTA'; // o INVERSIONISTA_EXPERTO si hay más señales
      profileAlt = 'PRIMERA_INVERSION';
    } else if (intention === 'Segunda vivienda') {
      profileDetected = 'INVERSIONISTA'; // Segunda vivienda es una forma de inversión
      profileAlt = 'VIVIENDA_PROPIA';
    } else if (intention === 'Vivienda propia') {
      profileDetected = 'VIVIENDA_PROPIA';
    } else {
      // Si no hay intención explícita, hacer auto-detección como antes
      const hasInvestmentProperties = d.p1_job_description &&
        (d.p1_job_description.toLowerCase().includes('inversión') ||
         d.p1_job_description.toLowerCase().includes('propiedad') ||
         d.p6_emotional_anchors?.includes('Solo rentabilidad'));

      const knowsIndicators = d.p1_job_description &&
        (d.p1_job_description.toLowerCase().includes('cap rate') ||
         d.p1_job_description.toLowerCase().includes('roi') ||
         d.p1_job_description.toLowerCase().includes('plusvalía'));

      const pie_uf = d.p3_down_payment_uf || 0;

      // 1. INVERSIONISTA EXPERTO
      if (hasInvestmentProperties && knowsIndicators && pie_uf >= 1500) {
        profileDetected = 'INVERSIONISTA_EXPERTO';
      }
      // 2. INVERSIONISTA
      else if (
        (hasInvestmentProperties || pie_uf >= 1000) &&
        (d.p5_pain_tags?.includes('Perder poder adquisitivo') || d.p6_emotional_anchors?.includes('Solo rentabilidad')) &&
        (d.p8_readiness_slider >= 7)
      ) {
        profileDetected = 'INVERSIONISTA';
      }
      // 3. PRIMERA INVERSIÓN
      else if (
        !hasInvestmentProperties &&
        (d.p4_motivation_tags?.length > 0 || d.p5_pain_tags?.length > 0) &&
        pie_uf >= 500 &&
        (d.p8_readiness_slider >= 6)
      ) {
        profileDetected = 'PRIMERA_INVERSION';
      }
      // 4. VIVIENDA PROPIA (o default si dudoso)
      else {
        profileDetected = 'VIVIENDA_PROPIA';
      }

      // Si hay duda: mostrar TOP 2
      if (!profileDetected || (knowsIndicators && !hasInvestmentProperties)) {
        // Ambiguo: mostrar Inversionista vs Primera Inversión
        profileDetected = 'INVERSIONISTA';
        profileAlt = 'PRIMERA_INVERSION';
      }
    }

    // ========== CALCULATE BUYING CAPACITY ==========
    // Llamar a calculateBuyingCapacity para obtener datos de capacidad
    const capacity = await calculateBuyingCapacity(sessionId);

    if (!capacity) {
      setError('Error al calcular capacidad de compra');
      return null;
    }

    return {
      profileDetected,
      profileAlt,
      capacity: {
        clientAge: capacity.clientAge,
        ageCategory: capacity.ageCategory,
        loanTermYears: capacity.loanTermYears,
        monthlyIncomeClp: capacity.monthlyIncomeClp,
        dividendMaxClp: capacity.dividendMaxClp,
        maxLoanAmountClp: capacity.maxLoanAmountClp,
        propertyValueClp: capacity.propertyValueClp,
        affordablePropertyUf: capacity.affordablePropertyUf,
        estimatedDividendClp: capacity.estimatedDividendClp,
        annualRatePercent: capacity.annualRatePercent,
        ufValueClp: capacity.ufValueClp
      }
    };
  };

  // Helper: calcular rango de pie automáticamente
  const calculateDownPaymentRange = (clp) => {
    const amount = parseFloat(clp) || 0;
    if (amount <= 0) return '🔴 No tiene pie / negativo';
    if (amount <= 5000000) return '$0 – $5MM';
    if (amount <= 15000000) return '$5MM – $15MM';
    if (amount <= 30000000) return '$15MM – $30MM';
    if (amount <= 50000000) return '$30MM – $50MM';
    if (amount <= 80000000) return '$50MM – $80MM';
    return '$80MM+';
  };

  // ESTACIÓN 4: Upload images via backend endpoint
  const uploadProjectImages = async (files) => {
    if (!files || files.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sessionId', sessionId);

        const uploadResp = await fetch('/api/upload-project-image', {
          method: 'POST',
          body: formData
        });

        if (!uploadResp.ok) {
          const errorData = await uploadResp.json();
          throw new Error(`Error uploading ${file.name}: ${errorData.details || errorData.message}`);
        }

        const uploadData = await uploadResp.json();
        if (uploadData.success && uploadData.url) {
          uploadedUrls.push(uploadData.url);
        }
      }
    } catch (err) {
      setError('Error al subir imágenes: ' + err.message);
      console.error('Image upload error:', err);
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  // ESTACIÓN 4: Save project
  const saveProject = async () => {
    if (!currentProject.comuna || !currentProject.address || !currentProject.typologies || !currentProject.price_from_uf) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectResp = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          project_number: currentProject.project_number,
          project_state: currentProject.project_state,
          comuna: currentProject.comuna,
          address: currentProject.address,
          gmaps_link: currentProject.gmaps_link,
          amenities: currentProject.amenities,
          typologies: currentProject.typologies,
          price_from_uf: parseFloat(currentProject.price_from_uf),
          local_rent_uf: currentProject.local_rent_uf ? parseFloat(currentProject.local_rent_uf) : null,
          appreciation_percent: currentProject.appreciation_percent ? parseFloat(currentProject.appreciation_percent) : null,
          image_urls: currentProject.image_urls
        })
      });

      if (!projectResp.ok) {
        throw new Error('Error al guardar proyecto');
      }

      // Agregar a array de proyectos
      setProjects([...projects, { ...currentProject, project_number: currentProject.project_number }]);

      // Limpiar formulario si se pueden agregar más (máximo 3)
      if (currentProject.project_number < 3) {
        setCurrentProject({
          project_number: currentProject.project_number + 1,
          project_state: 'Blanco',
          comuna: '',
          address: '',
          gmaps_link: '',
          amenities: '',
          typologies: '',
          price_from_uf: '',
          local_rent_uf: '',
          appreciation_percent: '',
          image_urls: []
        });
        setError(null);
      } else {
        // Avanzar a la vista de presentación
        setStep('station_4_projects_view');
      }
    } catch (err) {
      setError('Error: ' + err.message);
      console.error('Save project error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ESTACIÓN 4: Load projects for session
  const loadProjects = async () => {
    if (projectsLoaded) return;

    try {
      const resp = await fetch(`/api/projects/${sessionId}`);
      const data = await resp.json();
      if (data.success && data.projects) {
        setProjects(data.projects);
      }
      setProjectsLoaded(true);
    } catch (err) {
      console.error('Load projects error:', err);
    }
  };

  // ESTACIÓN 5: Manejar objeción
  const handleObjection = async (objectionType) => {
    setCurrentObjectionType(objectionType);
    setObjectionsGenerating(true);
    setError(null);

    try {
      const payload = {
        session_id: sessionId,
        objection_type: objectionType,
        triggered_from_station: 4,
        profile: summary?.profile || 'Desconocido'
      };

      // Si es objeción nueva, agregar el texto
      if (objectionType === 'NUEVA') {
        payload.objection_text = objectionsCustomText;
      }

      const resp = await fetch('/api/objections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error('Error al procesar objeción');
      }

      const data = await resp.json();
      setObjectionsResolutionSteps(data.resolution_steps);
    } catch (err) {
      setError('Error: ' + err.message);
      console.error('Objection error:', err);
    } finally {
      setObjectionsGenerating(false);
    }
  };

  // ESTACIÓN 2: Actualizar respuesta de Discovery
  const updateDiscoveryAnswer = (field, key, value) => {
    setDiscoveryAnswers(prev => ({
      ...prev,
      [field]: { ...prev[field], [key]: value }
    }));

    // P3: calcular UF y rango automáticamente cuando cambia down_payment
    if (field === 'p3' && key === 'down_payment') {
      const downPaymentClp = parseFloat(value) || 0;
      const ufValue = downPaymentClp / 41000; // UF ref configurable
      const range = calculateDownPaymentRange(downPaymentClp);
      setDiscoveryAnswers(prev => ({
        ...prev,
        p3: { ...prev.p3, down_payment_uf: ufValue, down_payment_range: range }
      }));
    }

    // P7: marcar flag automático si no es "Solo yo"
    if (field === 'p7' && key === 'decision_makers') {
      const hasHiddenDecision = Array.isArray(value) && !value.includes('Solo yo') && value.length > 0;
      setDiscoveryAnswers(prev => ({
        ...prev,
        p7: { ...prev.p7, hidden_decisor_flag: hasHiddenDecision }
      }));
    }

    // P4, P5, P6: focus automático al campo de notas si se selecciona "Otra"
    if ((field === 'p4' && key === 'motivation') || (field === 'p5' && key === 'pain') || (field === 'p6' && key === 'anchor')) {
      if (Array.isArray(value) && value.includes('Otra')) {
        setFocusedNoteField(field); // Enfocar el campo de notas de esa pregunta
      }
    }
  };

  // Verificar si una pregunta está completada (al menos un valor)
  const isDiscoveryQuestionComplete = (field) => {
    const answer = discoveryAnswers[field];
    switch (field) {
      case 'p0':
        return answer.intention.length > 0;
      case 'p1':
        return answer.age !== '' && (answer.job_type.length > 0 || answer.tenure.length > 0 || answer.job_description.trim() !== '');
      case 'p2':
        return answer.debt_types.length > 0 || answer.monthly_income !== '' || answer.total_debt !== '';
      case 'p3':
        // P3: OBLIGATORIO tener valor numérico en down_payment
        return answer.down_payment !== '' && parseFloat(answer.down_payment) > 0;
      case 'p4':
        return answer.motivation.length > 0 || answer.urgency !== 3;
      case 'p5':
        return answer.pain.length > 0 || answer.intensity !== 3;
      case 'p6':
        return answer.anchor.length > 0;
      case 'p7':
        return answer.decision_makers.length > 0;
      case 'p8':
        return answer.readiness !== 5 || answer.friction.length > 0;
      default:
        return false;
    }
  };

  // Contar preguntas completadas (9 total: p0 + p1-p8)
  const discoveryCompletedCount = ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].filter(isDiscoveryQuestionComplete).length;
  const allDiscoveryComplete = discoveryCompletedCount === 9;

  // ESTACIÓN 3: Guardar Profile + Semáforo y avanzar
  const saveProfileSemaforoAndProceed = async () => {
    if (!profileConfirmed) {
      setError('Por favor confirma el perfil');
      return;
    }

    if (!profileSemaforo) {
      setError('Error: No se detectó el perfil. Recarga la página e intenta de nuevo.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const capacity = profileSemaforo.capacity || {};

      // Guardar en profile_semaforo con datos de capacidad
      const profileResp = await fetch('/api/profile-semaforo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          profile_detected: selectedProfile,
          profile_corrected_by_advisor: selectedProfile !== profileSemaforo.profileDetected ? selectedProfile : false,
          traffic_light: 'N/A', // Ya no se usa; capacidad reemplaza al semáforo
          semaforo_rationale: 'Reemplazado por capacidad de compra',
          loan_term_years: capacity.loanTermYears,
          max_loan_amount_clp: capacity.maxLoanAmountClp,
          affordable_property_uf: capacity.affordablePropertyUf,
          estimated_dividend_clp: capacity.estimatedDividendClp,
          meeting_1_ended_at: reunionMode === '2_reuniones' ? new Date().toISOString() : null,
          meeting_2_scheduled_at: null
        })
      });

      if (!profileResp.ok) {
        throw new Error('Error al guardar perfil y capacidad');
      }

      // Registrar evento 'station_completed' para Estación 3
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          advisor_name: advisorName.trim(),
          event_type: 'station_completed',
          station_number: 3
        })
      });

      // Registrar evento de corrección si aplica
      if (selectedProfile !== profileSemaforo.profileDetected) {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            advisor_name: advisorName.trim(),
            event_type: 'profile_corrected',
            station_number: 3,
            metadata: {
              original: profileSemaforo.profileDetected,
              corrected: selectedProfile
            }
          })
        });
      }

      setStep('station_4_summary');
    } catch (err) {
      setError('Error: ' + err.message);
      console.error('saveProfileSemaforoAndProceed error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ESTACIÓN 2: Guardar Discovery
  const saveDiscoveryAndProceed = async () => {
    if (!allDiscoveryComplete) {
      setError('Por favor completa todas las 9 preguntas antes de continuar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construir objeto discovery_notes como JSON { "p1": "...", "p2": "...", ... "p8": "" }
      const discoveryNotes = {
        p1: discoveryAnswers.p1.notes || '',
        p2: discoveryAnswers.p2.notes || '',
        p3: discoveryAnswers.p3.notes || '',
        p4: discoveryAnswers.p4.notes || '',
        p5: discoveryAnswers.p5.notes || '',
        p6: discoveryAnswers.p6.notes || '',
        p7: discoveryAnswers.p7.notes || '',
        p8: discoveryAnswers.p8.notes || ''
      };

      // Guardar respuestas de Discovery en Supabase
      const discoveryResponse = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          p_intention: discoveryAnswers.p0.intention[0] || null,
          p1_age: discoveryAnswers.p1.age ? parseInt(discoveryAnswers.p1.age) : null,
          p1_job_description: discoveryAnswers.p1.job_description,
          p1_job_type: discoveryAnswers.p1.job_type[0] || null,
          p1_tenure: discoveryAnswers.p1.tenure[0] || null,
          p2_monthly_income_clp: discoveryAnswers.p2.monthly_income ? parseFloat(discoveryAnswers.p2.monthly_income) : null,
          p2_total_debt_clp: discoveryAnswers.p2.total_debt ? parseFloat(discoveryAnswers.p2.total_debt) : null,
          p2_debt_types: discoveryAnswers.p2.debt_types,
          p3_down_payment_clp: discoveryAnswers.p3.down_payment ? parseFloat(discoveryAnswers.p3.down_payment) : null,
          p3_down_payment_uf: discoveryAnswers.p3.down_payment_uf || null,
          p3_down_payment_range: discoveryAnswers.p3.down_payment_range || null,
          p4_motivation_tags: discoveryAnswers.p4.motivation,
          p4_urgency_slider: discoveryAnswers.p4.urgency,
          p5_pain_tags: discoveryAnswers.p5.pain,
          p5_emotional_intensity_slider: discoveryAnswers.p5.intensity,
          p6_emotional_anchors: discoveryAnswers.p6.anchor,
          p7_decision_makers: discoveryAnswers.p7.decision_makers,
          p7_has_hidden_decisor: discoveryAnswers.p7.hidden_decisor_flag,
          p8_readiness_slider: discoveryAnswers.p8.readiness,
          p8_friction_tags: discoveryAnswers.p8.friction,
          discovery_notes: discoveryNotes
        })
      });

      if (!discoveryResponse.ok) {
        const errorData = await discoveryResponse.json();
        throw new Error(errorData.message || 'Error al guardar Discovery');
      }

      // Registrar evento 'station_completed' para Estación 2
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          advisor_name: advisorName.trim(),
          event_type: 'station_completed',
          station_number: 2
        })
      });

      // Registrar evento 'station_started' para Estación 3
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          advisor_name: advisorName.trim(),
          event_type: 'station_started',
          station_number: 3
        })
      });

      // Auto-detectar perfil y capacidad
      const profileData = await detectProfileAndSemaforo(sessionId);
      if (profileData) {
        setProfileSemaforo(profileData);
        setSelectedProfile(profileData.profileDetected);
      }

      // Avanzar a Estación 3 (Perfil + Semáforo)
      setStep('profile_semaforo');
    } catch (err) {
      setError('Error: ' + err.message);
      console.error('saveDiscoveryAndProceed error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionComplete = (id) => {
    setQuestions(questions.map(q => q.id === id ? {...q, completed: !q.completed} : q));
  };

  const updateQuestionNotes = (id, notes) => {
    setQuestions(questions.map(q => q.id === id ? {...q, notes} : q));
  };

  const completedCount = questions.filter(q => q.completed).length;
  const canAnalyze = completedCount >= 10;

  const handleAnalyze = async () => {
    if (!clientName.trim() || !advisorName.trim()) {
      setError('Por favor ingresa nombre del cliente y asesor');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const questionsText = questions.map(q => {
        if (!q.completed) return '';
        return `Pregunta ${q.id}: ${q.text}\nRespuesta: ${q.notes || '(sin notas)'}`;
      }).filter(t => t).join('\n\n');

      const fullText = `Asesor: ${advisorName}\nCliente: ${clientName}\n\n${questionsText}`;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          advisorName,
          clientName
        })
      });

      const data = await response.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setStep('results');
      } else {
        setError('Error en el análisis: ' + (data.error || 'desconocido'));
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!meetNotes.trim()) {
      setError('Por favor pega las notas de Gemini de Meet');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetNotes,
          questions: questions.map(q => ({ id: q.id, text: q.text, notes: q.notes }))
        })
      });

      const data = await response.json();
      if (data.gaps) {
        setGaps(data.gaps);
      } else {
        setError('Error en la validación: ' + (data.error || 'desconocido'));
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!analysis) return;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="margin: 0 0 8px; font-size: 32px; color: #000;">Informe de Evaluación</h1>
          <p style="margin: 0; font-size: 14px; color: #666;">OneKey - Asesoría Patrimonial</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 14px; color: #666; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 12px;">INFORMACIÓN DEL CLIENTE</h2>
          <p style="margin: 8px 0;"><strong>Nombre:</strong> ${clientName}</p>
          <p style="margin: 8px 0;"><strong>Asesor:</strong> ${advisorName}</p>
          <p style="margin: 8px 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 14px; color: #666; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 12px;">PUNTUACIÓN GENERAL</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="background: #000; color: #fff; padding: 16px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #aaa;">Score General</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold;">${analysis.score_general}/100</p>
            </div>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #666;">Calificación</p>
              <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1b5e20;">${analysis.pai_qualification}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 14px; color: #666; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 12px;">INDICADORES</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${Object.entries(analysis.scores || {}).map(([key, val]) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; text-align: left;">${key.replace(/_/g, ' ')}</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${val}%</td>
              </tr>
            `).join('')}
          </table>
        </div>

        ${analysis.red_flags && analysis.red_flags.length > 0 ? `
          <div style="margin-bottom: 24px; background: #ffebee; padding: 16px; border-left: 3px solid #ef5350; border-radius: 4px;">
            <h2 style="margin: 0 0 12px; font-size: 14px; color: #b71c1c; text-transform: uppercase;">⚠️ Puntos de Atención</h2>
            <ul style="margin: 0; padding-left: 20px;">
              ${analysis.red_flags.map(flag => `<li style="margin: 8px 0; color: #b71c1c;">${flag}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${analysis.positive_signals && analysis.positive_signals.length > 0 ? `
          <div style="margin-bottom: 24px; background: #e8f5e9; padding: 16px; border-left: 3px solid #1b5e20; border-radius: 4px;">
            <h2 style="margin: 0 0 12px; font-size: 14px; color: #1b5e20; text-transform: uppercase;">✓ Señales Positivas</h2>
            <ul style="margin: 0; padding-left: 20px;">
              ${analysis.positive_signals.map(sig => `<li style="margin: 8px 0; color: #1b5e20;">✓ ${sig}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center;">
          <p style="margin: 0;">Informe generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
          <p style="margin: 8px 0 0;">OneKey © 2026</p>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);

    const opt = {
      margin: 10,
      filename: `Informe_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      document.body.removeChild(element);
    });
  };

  const QualBadge = ({ q }) => {
    const styles = {
      'Apto': { bg: '#e8f5e9', text: '#1b5e20', border: '#81c784' },
      'Necesita educación': { bg: '#fff3e0', text: '#e65100', border: '#ffb74d' },
      'No apto': { bg: '#ffebee', text: '#b71c1c', border: '#ef5350' }
    };
    const style = styles[q] || { bg: '#f5f5f5', text: '#424242', border: '#bdbdbd' };
    return e('span', {
      style: { background: style.bg, color: style.text, border: '1px solid ' + style.border, padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block' }
    }, q);
  };

  // Setup Screen
  if (step === 'setup') {
    return e('div', { style: { background: 'linear-gradient(135deg, #f7f7f7 0%, #f0f2f5 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      e('div', { style: { background: '#fff', borderRadius: '12px', padding: '48px', boxShadow: '0 8px 32px rgba(56,56,56,0.12)', maxWidth: '400px', width: '90%' } },
        e('div', { style: { marginBottom: '32px' } },
          e('div', { style: { fontSize: '28px', fontWeight: '300', color: '#383838', marginBottom: '16px', letterSpacing: '-0.5px' } }, 'onekey'),
          e('h1', { style: { margin: '0 0 8px', fontSize: '28px', fontWeight: '700', color: '#000' } }, 'OneKey Setter'),
          e('p', { style: { margin: '0', fontSize: '14px', color: '#666' } }, 'Estación 1: Apertura')
        ),
        e('div', { style: { marginBottom: '20px' } },
          e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' } }, 'Nombre del Asesor'),
          e('input', {
            value: advisorName,
            onChange: (evt) => setAdvisorName(evt.target.value),
            placeholder: 'Tu nombre',
            style: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }
          })
        ),
        e('div', { style: { marginBottom: '32px' } },
          e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' } }, 'Nombre del Cliente'),
          e('input', {
            value: clientName,
            onChange: (evt) => setClientName(evt.target.value),
            placeholder: 'Nombre del cliente',
            style: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }
          })
        ),
        e('button', {
          onClick: () => setStep('apertura'),
          disabled: !advisorName.trim() || !clientName.trim(),
          style: { width: '100%', padding: '14px', background: (advisorName.trim() && clientName.trim()) ? '#000' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: (advisorName.trim() && clientName.trim()) ? 'pointer' : 'not-allowed' }
        }, 'Iniciar Sesión')
      )
    );
  }

  // ESTACIÓN 1: APERTURA
  if (step === 'apertura') {
    const script = APERTURA_SCRIPT.replace('{clientName}', clientName).replace('{advisorName}', advisorName);
    const canProceed = consentGiven && advisorName.trim() && clientName.trim();

    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step: 'apertura', advisorName, clientName, completedCount: 0 }),
      e('main', { style: { flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '48px 32px', width: '100%' } },
        // Banner de estado
        e('div', { style: { background: '#383838', color: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '24px' } },
          e('p', { style: { margin: '0', fontSize: '13px', fontWeight: '600' } }, '📍 ESTACIÓN 1: APERTURA')
        ),

        // Sesiones recientes
        recentSessions.length > 0 && e('div', { style: { background: '#e8f5e9', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px', borderLeft: '4px solid #1b5e20' } },
          e('p', { style: { margin: '0 0 16px', fontSize: '13px', fontWeight: '600', color: '#1b5e20', textTransform: 'uppercase' } }, '📋 MIS SESIONES RECIENTES'),
          e('div', { style: { display: 'grid', gap: '12px' } },
            ...recentSessions.slice(0, 5).map(sess =>
              e('button', {
                onClick: async () => {
                  setLoading(true);
                  setSessionId(sess.id);
                  setClientName(sess.client_name);
                  setReunionMode(sess.reunion_mode);
                  // Jump to Station 4 if session is complete (has projects)
                  if (sess.progress >= 60) {
                    setStep('station_4_summary');
                  } else {
                    setStep('questions');
                  }
                  setLoading(false);
                },
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#fff',
                  border: '1px solid #c8e6c9',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  textAlign: 'left'
                }
              },
                e('div', null,
                  e('div', { style: { fontWeight: '600', color: '#000', marginBottom: '4px' } }, sess.client_name),
                  e('div', { style: { fontSize: '11px', color: '#666' } }, sess.stage + ' • ' + (sess.reunion_mode === '2_reuniones' ? '2 reuniones' : '1 reunión'))
                ),
                e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                  e('div', { style: { fontSize: '11px', fontWeight: '600', color: '#1b5e20', textAlign: 'right', minWidth: '40px' } }, sess.progress + '%'),
                  e('div', { style: { width: '60px', height: '4px', background: '#c8e6c9', borderRadius: '2px', overflow: 'hidden' } },
                    e('div', { style: { height: '100%', background: '#1b5e20', width: sess.progress + '%', transition: 'width 0.3s' } })
                  )
                )
              )
            )
          ),
          e('button', {
            onClick: () => { setRecentSessions([]); },
            style: { marginTop: '12px', width: '100%', padding: '10px', background: 'transparent', border: '1px solid #1b5e20', color: '#1b5e20', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
          }, '+ Nueva sesión')
        ),

        // Guión
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' } },
          e('p', { style: { fontSize: '16px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap', margin: '0' } }, script)
        ),

        // Selector de modo reunión
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' } },
          e('p', { style: { margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#333' } }, 'Modo de la reunión'),
          e('div', { style: { display: 'flex', gap: '12px' } },
            e('label', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: reunionMode === '2_reuniones' ? '2px solid #000' : '1px solid #ddd', borderRadius: '6px', background: reunionMode === '2_reuniones' ? '#f5f5f5' : '#fff' } },
              e('input', {
                type: 'radio',
                name: 'reunion_mode',
                value: '2_reuniones',
                checked: reunionMode === '2_reuniones',
                onChange: () => setReunionMode('2_reuniones'),
                style: { cursor: 'pointer' }
              }),
              e('span', { style: { fontSize: '13px', fontWeight: '500', color: '#000' } }, '2 reuniones (Discovery separado)')
            ),
            e('label', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: reunionMode === '1_reunion' ? '2px solid #000' : '1px solid #ddd', borderRadius: '6px', background: reunionMode === '1_reunion' ? '#f5f5f5' : '#fff' } },
              e('input', {
                type: 'radio',
                name: 'reunion_mode',
                value: '1_reunion',
                checked: reunionMode === '1_reunion',
                onChange: () => setReunionMode('1_reunion'),
                style: { cursor: 'pointer' }
              }),
              e('span', { style: { fontSize: '13px', fontWeight: '500', color: '#000' } }, '1 reunión (todo seguido)')
            )
          )
        ),

        // Checkbox de consentimiento
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px', borderLeft: '3px solid #1b5e20' } },
          e('label', { style: { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' } },
            e('input', {
              type: 'checkbox',
              checked: consentGiven,
              onChange: (evt) => setConsentGiven(evt.target.checked),
              style: { width: '20px', height: '20px', cursor: 'pointer', marginTop: '2px', flexShrink: 0 }
            }),
            e('div', null,
              e('p', { style: { margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: '#000' } }, '✓ Cliente dio consentimiento de notas'),
              e('p', { style: { margin: '0', fontSize: '12px', color: '#666' } }, 'Confirma que el cliente autorizó tomar notas de la reunión para el resumen posterior.')
            )
          )
        ),

        // Error si existe
        error && e('div', { style: { background: '#ffebee', borderRadius: '8px', padding: '16px', marginBottom: '24px', borderLeft: '3px solid #ef5350' } },
          e('p', { style: { margin: '0', fontSize: '13px', color: '#b71c1c' } }, '❌ ' + error)
        )
      ),

      e('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px 32px', display: 'flex', gap: '12px', width: '100%' } },
        e('button', {
          onClick: () => setStep('setup'),
          style: { flex: 1, padding: '14px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
        }, 'Volver'),
        e('button', {
          onClick: saveSessionAndProceed,
          disabled: !canProceed || loading,
          style: { flex: 1, padding: '14px', background: canProceed && !loading ? '#000' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: canProceed && !loading ? 'pointer' : 'not-allowed' }
        }, loading ? 'Iniciando...' : '✓ Consentimiento dado → Continuar a Discovery')
      ),
      e(Footer)
    );
  }

  // ESTACIÓN 3: PERFIL + SEMÁFORO
  if (step === 'profile_semaforo' && profileSemaforo) {
    const profileColors = {
      'INVERSIONISTA_EXPERTO': '#1b5e20',
      'INVERSIONISTA': '#2196f3',
      'PRIMERA_INVERSION': '#ff9800',
      'VIVIENDA_PROPIA': '#9c27b0'
    };

    const profileLabels = {
      'INVERSIONISTA_EXPERTO': 'Inversionista Experto',
      'INVERSIONISTA': 'Inversionista',
      'PRIMERA_INVERSION': 'Primera Inversión',
      'VIVIENDA_PROPIA': 'Vivienda Propia'
    };

    const capacity = profileSemaforo.capacity || {};
    const showCaseByCase = capacity.loanTermYears === 0; // Edad 66+

    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step: 'profile_semaforo', advisorName, clientName, completedCount: 0 }),
      e('main', { style: { flex: 1, maxWidth: '1000px', margin: '0 auto', padding: '32px', width: '100%' } },
        // Banner
        e('div', { style: { background: '#383838', color: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '24px' } },
          e('p', { style: { margin: '0', fontSize: '13px', fontWeight: '600' } }, '📍 ESTACIÓN 3: PERFIL + CAPACIDAD DE COMPRA')
        ),

        // PERFIL
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
          e('p', { style: { margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#000' } }, '👤 PERFIL DETECTADO'),
          e('div', { style: { background: profileColors[profileSemaforo.profileDetected] || '#ccc', color: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '16px', fontWeight: '600' } }, profileLabels[profileSemaforo.profileDetected]),
          profileSemaforo.profileAlt && e('div', { style: { background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px', color: '#666' } },
            e('p', { style: { margin: '0 0 8px', fontWeight: '600' } }, '⚠️ ¿Cuál te parece más acertado?'),
            e('div', { style: { display: 'flex', gap: '8px' } },
              e('button', {
                onClick: () => setSelectedProfile(profileSemaforo.profileDetected),
                style: { flex: 1, padding: '8px', background: selectedProfile === profileSemaforo.profileDetected ? profileColors[profileSemaforo.profileDetected] : '#f0f0f0', color: selectedProfile === profileSemaforo.profileDetected ? '#fff' : '#000', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }
              }, profileLabels[profileSemaforo.profileDetected]),
              e('button', {
                onClick: () => setSelectedProfile(profileSemaforo.profileAlt),
                style: { flex: 1, padding: '8px', background: selectedProfile === profileSemaforo.profileAlt ? profileColors[profileSemaforo.profileAlt] : '#f0f0f0', color: selectedProfile === profileSemaforo.profileAlt ? '#fff' : '#000', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }
              }, profileLabels[profileSemaforo.profileAlt])
            )
          ),
          e('div', { style: { display: 'flex', gap: '12px' } },
            e('button', {
              onClick: () => setProfileConfirmed(true),
              style: { flex: 1, padding: '12px', background: profileConfirmed ? '#1b5e20' : '#e0e0e0', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
            }, profileConfirmed ? '✅ Perfil Confirmado' : '✓ Confirmar Perfil')
          )
        ),

        // CAPACIDAD DE COMPRA
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
          e('p', { style: { margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#000' } }, '💰 CAPACIDAD DE COMPRA ESTIMADA'),
          showCaseByCase ?
            e('div', { style: { background: '#fff3e0', padding: '16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #ff9800' } },
              e('p', { style: { margin: '0', fontSize: '14px', fontWeight: '600', color: '#e65100' } }, '⚠️ ' + capacity.ageCategory),
              e('p', { style: { margin: '8px 0 0', fontSize: '13px', color: '#bf360c' } }, 'Requiere evaluación caso a caso por edad y plazo. Conversemos con el equipo de crédito.')
            ) :
            e('div', { style: { background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #1b5e20' } },
              e('p', { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#000' } }, 'Con tu renta y condiciones financieras:'),
              e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' } },
                e('div', null,
                  e('p', { style: { margin: '0 0 4px', fontSize: '11px', color: '#666', fontWeight: '600' } }, '💳 Crédito máximo:'),
                  e('p', { style: { margin: '0', fontSize: '16px', fontWeight: '700', color: '#1b5e20' } }, '$' + (capacity.maxLoanAmountClp || 0).toLocaleString('es-CL', {maximumFractionDigits: 0}) + ' CLP')
                ),
                e('div', null,
                  e('p', { style: { margin: '0 0 4px', fontSize: '11px', color: '#666', fontWeight: '600' } }, '🏠 Propiedad alcanzable:'),
                  e('p', { style: { margin: '0', fontSize: '16px', fontWeight: '700', color: '#1b5e20' } }, '~UF ' + (capacity.affordablePropertyUf || 0).toLocaleString('es-CL', {maximumFractionDigits: 0}))
                ),
                e('div', null,
                  e('p', { style: { margin: '0 0 4px', fontSize: '11px', color: '#666', fontWeight: '600' } }, '📅 Plazo:'),
                  e('p', { style: { margin: '0', fontSize: '16px', fontWeight: '700', color: '#1b5e20' } }, capacity.loanTermYears + ' años')
                ),
                e('div', null,
                  e('p', { style: { margin: '0 0 4px', fontSize: '11px', color: '#666', fontWeight: '600' } }, '💰 Dividendo estimado:'),
                  e('p', { style: { margin: '0', fontSize: '16px', fontWeight: '700', color: '#1b5e20' } }, '$' + (capacity.estimatedDividendClp || 0).toLocaleString('es-CL', {maximumFractionDigits: 0}) + '/mes')
                )
              ),
              e('p', { style: { margin: '12px 0 0', fontSize: '11px', color: '#999', fontStyle: 'italic' } }, '📌 Estimado conservador a tasa ' + capacity.annualRatePercent + '% anual (mercado real ~3,9%). No es una oferta de crédito. Confirmar con banco.')
            )
        ),

        // Botones de acción
        e('div', { style: { display: 'flex', gap: '12px' } },
          e('button', {
            onClick: () => setStep('questions'),
            style: { flex: 1, padding: '14px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
          }, 'Volver a Discovery'),
          e('button', {
            onClick: saveProfileSemaforoAndProceed,
            disabled: !profileConfirmed || loading,
            style: { flex: 1, padding: '14px', background: (profileConfirmed && !loading) ? '#1b5e20' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: (profileConfirmed && !loading) ? 'pointer' : 'not-allowed' }
          }, loading ? 'Guardando...' : '✓ Confirmar y Continuar')
        ),

        error && e('div', { style: { background: '#ffebee', borderRadius: '8px', padding: '16px', marginTop: '24px', borderLeft: '3px solid #ef5350' } },
          e('p', { style: { margin: '0', fontSize: '13px', color: '#b71c1c' } }, '❌ ' + error)
        )
      ),
      e(Footer)
    );
  }

  // ESTACIÓN 4: FORMULARIO DE PROYECTOS (PARTE B)
  if (step === 'station_4_projects_form') {
    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step: 'station_4_projects', advisorName, clientName, completedCount: 0 }),
      e('main', { style: { flex: 1, maxWidth: '900px', margin: '0 auto', padding: '32px', width: '100%' } },
        // Banner
        e('div', { style: { background: '#383838', color: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '24px' } },
          e('p', { style: { margin: '0', fontSize: '13px', fontWeight: '600' } }, '📍 ESTACIÓN 4 PARTE B: CARGAR PROYECTOS (' + (projects.length + 1) + '/3)')
        ),

        // Formulario
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' } },
          e('h3', { style: { margin: '0 0 20px', color: '#000', fontSize: '16px', fontWeight: '600' } }, 'Proyecto ' + currentProject.project_number),

          // Estado
          e('div', { style: { marginBottom: '16px' } },
            e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' } }, 'Estado del proyecto'),
            e('select', {
              value: currentProject.project_state,
              onChange: (evt) => setCurrentProject({ ...currentProject, project_state: evt.target.value }),
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
            },
              e('option', null, 'Blanco'),
              e('option', null, 'Verde'),
              e('option', null, 'Entrega inmediata')
            )
          ),

          // Comuna y Dirección (2 columnas)
          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' } },
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' } }, 'Comuna *'),
              e('input', {
                type: 'text',
                value: currentProject.comuna,
                onChange: (evt) => setCurrentProject({ ...currentProject, comuna: evt.target.value }),
                placeholder: 'Ej: Las Condes',
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            ),
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' } }, 'Dirección *'),
              e('input', {
                type: 'text',
                value: currentProject.address,
                onChange: (evt) => setCurrentProject({ ...currentProject, address: evt.target.value }),
                placeholder: 'Ej: Av. Kennedy 5555',
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            )
          ),

          // Google Maps link
          e('div', { style: { marginBottom: '16px' } },
            e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' } }, 'Link a Google Maps'),
            e('input', {
              type: 'text',
              value: currentProject.gmaps_link,
              onChange: (evt) => setCurrentProject({ ...currentProject, gmaps_link: evt.target.value }),
              placeholder: 'https://maps.google.com/...',
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
            })
          ),

          // Amenities
          e('div', { style: { marginBottom: '16px' } },
            e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' } }, 'Amenities (Ej: Piscina, Gimnasio)'),
            e('input', {
              type: 'text',
              value: currentProject.amenities,
              onChange: (evt) => setCurrentProject({ ...currentProject, amenities: evt.target.value }),
              placeholder: 'Piscina, Gimnasio, Terraza...',
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
            })
          ),

          // Tipologías
          e('div', { style: { marginBottom: '16px' } },
            e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' } }, 'Tipologías *'),
            e('input', {
              type: 'text',
              value: currentProject.typologies,
              onChange: (evt) => setCurrentProject({ ...currentProject, typologies: evt.target.value }),
              placeholder: 'Ej: 1D, 2D, 3D',
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
            })
          ),

          // Precios (3 columnas)
          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' } },
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' } }, 'Precio desde (UF) *'),
              e('input', {
                type: 'number',
                value: currentProject.price_from_uf,
                onChange: (evt) => setCurrentProject({ ...currentProject, price_from_uf: evt.target.value }),
                placeholder: '3000',
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            ),
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' } }, 'Arriendo zona (UF/mes)'),
              e('input', {
                type: 'number',
                value: currentProject.local_rent_uf,
                onChange: (evt) => setCurrentProject({ ...currentProject, local_rent_uf: evt.target.value }),
                placeholder: '20',
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            ),
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' } }, 'Plusvalía (%)'),
              e('input', {
                type: 'number',
                value: currentProject.appreciation_percent,
                onChange: (evt) => setCurrentProject({ ...currentProject, appreciation_percent: evt.target.value }),
                placeholder: '3',
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            )
          ),

          // Upload de imágenes
          e('div', { style: { marginBottom: '16px', padding: '16px', background: '#f9f9f9', borderRadius: '6px', border: '2px dashed #ddd' } },
            e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '10px' } }, '📸 Subir imágenes del proyecto'),
            e('input', {
              type: 'file',
              multiple: true,
              accept: 'image/*',
              onChange: async (evt) => {
                const files = Array.from(evt.target.files);
                if (files.length > 0) {
                  const urls = await uploadProjectImages(files);
                  setCurrentProject({ ...currentProject, image_urls: [...currentProject.image_urls, ...urls] });
                }
              },
              disabled: uploadingImages,
              style: { width: '100%', cursor: uploadingImages ? 'not-allowed' : 'pointer' }
            }),
            uploadingImages && e('p', { style: { margin: '8px 0 0', fontSize: '12px', color: '#1b5e20' } }, '⏳ Subiendo imágenes...'),
            currentProject.image_urls.length > 0 && e('p', { style: { margin: '8px 0 0', fontSize: '12px', color: '#1b5e20' } }, '✓ ' + currentProject.image_urls.length + ' imagen(es) subida(s)')
          ),

          // Mensajes
          error && e('div', { style: { background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px' } }, error),

          // Botones
          e('div', { style: { display: 'flex', gap: '12px' } },
            e('button', {
              onClick: saveProject,
              disabled: loading || uploadingImages,
              style: { flex: 1, padding: '12px', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }
            }, loading ? '⏳ Guardando...' : (projects.length < 3 ? 'Guardar y agregar otro' : 'Guardar proyecto')),
            projects.length > 0 && e('button', {
              onClick: () => { loadProjects(); setStep('station_4_projects_view'); },
              style: { flex: 1, padding: '12px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
            }, 'Ver proyectos cargados (' + projects.length + ')')
          )
        )
      ),
      e(Footer)
    );
  }

  // ESTACIÓN 5: OBJECIONES
  if (step === 'station_5_objections') {
    const PREBUILT_OBJECTIONS = {
      PENSAR_CON_PAREJA: { titulo: 'Lo voy a pensar / lo converso con mi pareja', icon: '💭' },
      CARO_ESPERAR: { titulo: 'Está caro / mejor espero que bajen las tasas', icon: '💰' },
      COMPARAR_PROYECTOS: { titulo: 'Quiero comparar con otros proyectos', icon: '⚖️' },
      SOLO_INFO: { titulo: 'Solo quiero info, no quiero reunión', icon: '📧' },
      VER_PRESENCIAL: { titulo: 'Quiero ir a verlo antes de decidir', icon: '👁️' }
    };

    // Si está mostrando los pasos de resolución
    if (objectionsResolutionSteps) {
      return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
        e(Header, { step: 'station_5', advisorName, clientName, completedCount: 0 }),
        e('main', { style: { flex: 1, maxWidth: '1000px', margin: '0 auto', padding: '32px', width: '100%' } },
          // Loop de 5 pasos (marco fijo)
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' } },
            e('h2', { style: { margin: '0 0 20px', color: '#000', fontSize: '16px', fontWeight: '600' } }, '🎯 Loop de 5 Pasos para Desarmar Objeción'),

            // Paso 1: Acuerdo
            e('div', { style: { marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' } },
              e('p', { style: { margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: '#1b5e20', textTransform: 'uppercase' } }, '1️⃣ ACUERDO'),
              e('p', { style: { margin: '0', fontSize: '14px', color: '#333', lineHeight: '1.6' } }, objectionsResolutionSteps.paso_1_acuerdo || objectionsResolutionSteps.paso_1_acuerdo)
            ),

            // Paso 2: Aislamiento
            e('div', { style: { marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' } },
              e('p', { style: { margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: '#1b5e20', textTransform: 'uppercase' } }, '2️⃣ AISLAMIENTO'),
              e('p', { style: { margin: '0', fontSize: '14px', color: '#333', lineHeight: '1.6' } }, objectionsResolutionSteps.paso_2_aislamiento)
            ),

            // Paso 3: Indagación
            e('div', { style: { marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' } },
              e('p', { style: { margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: '#1b5e20', textTransform: 'uppercase' } }, '3️⃣ INDAGACIÓN'),
              e('p', { style: { margin: '0', fontSize: '14px', color: '#333', lineHeight: '1.6' } }, objectionsResolutionSteps.paso_3_indagacion)
            ),

            // Paso 4: Reframe
            e('div', { style: { marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' } },
              e('p', { style: { margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: '#1b5e20', textTransform: 'uppercase' } }, '4️⃣ REFRAME'),
              e('p', { style: { margin: '0', fontSize: '14px', color: '#333', lineHeight: '1.6' } }, objectionsResolutionSteps.paso_4_reframe)
            ),

            // Paso 5: Test de cierre
            e('div', null,
              e('p', { style: { margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: '#1b5e20', textTransform: 'uppercase' } }, '5️⃣ TEST DE CIERRE'),
              e('p', { style: { margin: '0', fontSize: '14px', color: '#333', lineHeight: '1.6' } }, objectionsResolutionSteps.paso_5_test)
            )
          ),

          // Botones de acción
          e('div', { style: { display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' } },
            e('button', {
              onClick: () => { setObjectionsResolutionSteps(null); setCurrentObjectionType(null); },
              style: { padding: '12px 24px', background: '#fff', border: '1px solid #1b5e20', color: '#1b5e20', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
            }, '← Otra objeción'),
            e('button', {
              onClick: () => { setObjectionsResolutionSteps(null); setCurrentObjectionType(null); setStep('station_4_projects_view'); },
              style: { padding: '12px 24px', background: '#1b5e20', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
            }, 'Objeción resuelta ✓')
          )
        ),
        e(Footer)
      );
    }

    // Mostrar selector de las 5 objeciones o formulario para nueva
    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step: 'station_5', advisorName, clientName, completedCount: 0 }),
      e('main', { style: { flex: 1, maxWidth: '900px', margin: '0 auto', padding: '32px', width: '100%' } },
        e('div', { style: { background: '#ff9800', color: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '24px' } },
          e('p', { style: { margin: '0', fontSize: '13px', fontWeight: '600' } }, '⚠️ ESTACIÓN 5: OBJECIONES')
        ),

        // Las 5 grandes pre-resueltas
        e('div', null,
          e('h3', { style: { margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#000' } }, '5 OBJECIONES GRANDES (guiones listos)'),
          e('div', { style: { display: 'grid', gap: '12px', marginBottom: '24px' } },
            ...Object.entries(PREBUILT_OBJECTIONS).map(([key, obj]) =>
              e('button', {
                onClick: () => handleObjection(key),
                disabled: objectionsGenerating,
                style: {
                  padding: '16px',
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#000',
                  transition: 'all 0.2s',
                  opacity: objectionsGenerating && currentObjectionType !== key ? 0.6 : 1
                }
              },
                e('p', { style: { margin: '0 0 4px' } }, obj.icon + ' ' + obj.titulo)
              )
            )
          )
        ),

        // Objeción nueva
        e('div', null,
          e('h3', { style: { margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#000' } }, 'OBJECIÓN NUEVA (genera IA)'),
          e('textarea', {
            value: objectionsCustomText,
            onChange: (evt) => setObjectionsCustomText(evt.target.value),
            placeholder: 'Escribe la objeción que plantó el cliente...',
            style: {
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              marginBottom: '12px',
              boxSizing: 'border-box',
              minHeight: '80px',
              resize: 'vertical'
            },
            disabled: objectionsGenerating
          }),
          e('button', {
            onClick: () => handleObjection('NUEVA'),
            disabled: !objectionsCustomText.trim() || objectionsGenerating,
            style: {
              padding: '12px 24px',
              background: objectionsGenerating ? '#ccc' : '#ff9800',
              border: 'none',
              color: '#fff',
              borderRadius: '6px',
              cursor: objectionsGenerating ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }
          }, objectionsGenerating ? '⏳ Generando (3-5 seg)...' : '🤖 Generar respuesta con IA')
        ),

        error && e('div', { style: { background: '#ffebee', border: '1px solid #ef5350', borderRadius: '6px', padding: '12px', marginTop: '16px', color: '#c62828' } }, error)
      ),
      e(Footer)
    );
  }

  // ESTACIÓN 4: PARTE C - Vista de Proyectos
  if (step === 'station_4_projects_view') {
    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step: 'station_4_projects', advisorName, clientName, completedCount: 0 }),
      e('main', { style: { flex: 1, maxWidth: '1100px', margin: '0 auto', padding: '32px', width: '100%' } },
        // Banner
        e('div', { style: { background: '#1b5e20', color: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '24px' } },
          e('p', { style: { margin: '0', fontSize: '13px', fontWeight: '600' } }, '📋 ESTACIÓN 4 PARTE C: PRESENTACIÓN DE PROYECTOS')
        ),

        // Tabs de proyectos
        projects && projects.length > 0 ? e('div', null,
          // Tab headers
          e('div', { style: { display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #ddd', paddingBottom: '0' } },
            ...projects.map((proj, idx) =>
              e('button', {
                onClick: () => setCurrentProject(proj),
                style: {
                  padding: '12px 20px',
                  background: currentProject.project_number === proj.project_number ? '#1b5e20' : '#fff',
                  color: currentProject.project_number === proj.project_number ? '#fff' : '#000',
                  border: '1px solid #ddd',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }
              }, 'Proyecto ' + (idx + 1))
            )
          ),

          // Tab content - Selected project card
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } },
            // Título
            e('h2', { style: { margin: '0 0 20px', color: '#000', fontSize: '18px', fontWeight: '600' } }, 'Proyecto ' + currentProject.project_number),

            // Grid 2 columnas
            e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' } },
              // Columna izquierda - Datos principales
              e('div', null,
                e('h3', { style: { margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase' } }, '📍 Ubicación'),
                e('div', { style: { fontSize: '14px', lineHeight: '1.6', color: '#333' } },
                  e('p', { style: { margin: '0 0 4px' } }, '🏠 Estado: ' + (currentProject.project_state || 'N/A')),
                  e('p', { style: { margin: '0 0 4px' } }, '🏘️ Comuna: ' + (currentProject.comuna || 'N/A')),
                  e('p', { style: { margin: '0 0 8px' } }, '🛣️ Dirección: ' + (currentProject.address || 'N/A')),
                  currentProject.gmaps_link && e('a', { href: currentProject.gmaps_link, target: '_blank', style: { color: '#1b5e20', textDecoration: 'none', fontWeight: '500' } }, '→ Ver en Google Maps')
                ),

                e('hr', { style: { border: 'none', borderTop: '1px solid #eee', margin: '16px 0' } }),

                e('h3', { style: { margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase' } }, '💰 Valores'),
                e('div', { style: { fontSize: '14px', lineHeight: '1.6', color: '#333' } },
                  e('p', { style: { margin: '0 0 4px' } }, '💵 Desde: UF ' + (currentProject.price_from_uf || 'N/A')),
                  currentProject.local_rent_uf && e('p', { style: { margin: '0 0 4px' } }, '🏪 Arriendo local: UF ' + currentProject.local_rent_uf),
                  currentProject.appreciation_percent && e('p', { style: { margin: '0' } }, '📈 Apreciación: ' + currentProject.appreciation_percent + '%')
                )
              ),

              // Columna derecha - Detalles
              e('div', null,
                e('h3', { style: { margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase' } }, '🏗️ Detalles'),
                e('div', { style: { fontSize: '14px', lineHeight: '1.8', color: '#333' } },
                  e('p', { style: { margin: '0 0 8px' } }, '📐 Tipologías:'),
                  e('p', { style: { margin: '0 0 12px', color: '#666', fontSize: '13px' } }, currentProject.typologies || 'No especificadas'),

                  currentProject.amenities && (
                    e('p', { style: { margin: '0 0 8px' } }, '✨ Amenities:'),
                    e('p', { style: { margin: '0 0 12px', color: '#666', fontSize: '13px' } }, currentProject.amenities)
                  )
                )
              )
            ),

            // Imágenes si existen
            currentProject.image_urls && currentProject.image_urls.length > 0 && (
              e('div', null,
                e('hr', { style: { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' } }),
                e('h3', { style: { margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase' } }, '📸 Galería'),
                e('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' } },
                  ...currentProject.image_urls.map(url =>
                    e('img', { src: url, style: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px' } })
                  )
                )
              )
            )
          )
        ) : (
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#999' } },
            e('p', null, 'No hay proyectos cargados')
          )
        ),

        // Botones de acción
        e('div', { style: { display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center', flexWrap: 'wrap' } },
          e('button', {
            onClick: () => setStep('station_4_projects_form'),
            style: { padding: '12px 24px', background: '#fff', border: '1px solid #1b5e20', color: '#1b5e20', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
          }, '← Agregar más proyectos'),
          e('button', {
            onClick: () => setStep('station_5_objections'),
            style: { padding: '12px 24px', background: '#fff', border: '1px solid #ff9800', color: '#ff9800', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
          }, '⚠️ Apareció una objeción'),
          e('button', {
            onClick: () => { /* TODO: Cierre y siguiente flujo */ setStep('apertura'); },
            style: { padding: '12px 24px', background: '#1b5e20', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
          }, 'Finalizar presentación →')
        )
      ),
      e(Footer)
    );
  }

  // ESTACIÓN 4: RESUMEN (Panel)
  if (step === 'station_4_summary') {
    if (!summary) {
      return e('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' } },
        e('p', null, 'Cargando resumen...')
      );
    }

    const intentionLabel = summary.intention === 'Vivienda propia' ? '🏠 Vivienda Propia'
                         : summary.intention === 'Segunda vivienda' ? '🏖️ Segunda Vivienda'
                         : '🏢 Inversión';

    const profileColors = {
      'INVERSIONISTA_EXPERTO': '#1b5e20',
      'INVERSIONISTA': '#2196f3',
      'PRIMERA_INVERSION': '#ff9800',
      'VIVIENDA_PROPIA': '#9c27b0'
    };

    const profileLabels = {
      'INVERSIONISTA_EXPERTO': 'Inversionista Experto',
      'INVERSIONISTA': 'Inversionista',
      'PRIMERA_INVERSION': 'Primera Inversión',
      'VIVIENDA_PROPIA': 'Vivienda Propia'
    };

    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step: 'station_4_summary', advisorName, clientName, completedCount: 0 }),
      e('main', { style: { flex: 1, maxWidth: '1400px', margin: '0 auto', padding: '32px', width: '100%' } },
        // Banner
        e('div', { style: { background: '#383838', color: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '24px' } },
          e('p', { style: { margin: '0', fontSize: '13px', fontWeight: '600' } }, '📍 ESTACIÓN 4: PROYECTO + PALANCAS + ANCLAJE')
        ),

        // PANEL DE RESUMEN - Grid de 3 columnas
        e('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' } },
          // Col 1: INTENCIÓN + PERFIL
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' } }, '🎯 Intención'),
            e('p', { style: { margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#000' } }, intentionLabel),
            e('p', { style: { margin: '0 0 8px', fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase' } }, 'Perfil'),
            e('div', { style: { background: profileColors[summary.profile] || '#ccc', color: '#fff', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '13px', fontWeight: '600' } }, profileLabels[summary.profile])
          ),

          // Col 2: SITUACIÓN
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' } }, '💼 Situación'),
            e('div', { style: { fontSize: '12px', lineHeight: '1.6', color: '#333' } },
              e('div', null, '📊 ' + summary.jobType + ' • ' + summary.age + ' años'),
              e('div', null, '💰 Renta: $' + (summary.monthlyIncome || 0).toLocaleString('es-CL')),
              e('div', null, '📉 Deuda: $' + (summary.totalDebt || 0).toLocaleString('es-CL')),
              e('div', null, '💳 Pie: $' + (summary.downPayment || 0).toLocaleString('es-CL'))
            )
          ),

          // Col 3: MOTIVACIÓN + DOLOR
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' } }, '💭 Motivación + Dolor'),
            e('div', { style: { fontSize: '12px', lineHeight: '1.6', color: '#333' } },
              e('div', null, '🎯 ' + (summary.motivation && summary.motivation[0] ? summary.motivation[0] : 'N/A')),
              e('div', null, '😣 ' + (summary.pain && summary.pain[0] ? summary.pain[0] : 'N/A')),
              e('div', null, '💭 Ancla: ' + (summary.anchors && summary.anchors[0] ? summary.anchors[0] : 'N/A'))
            )
          )
        ),

        // Segunda fila: DECISOR + PRONTITUD + CAPACIDAD
        e('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' } },
          // Decisor
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' } }, '👥 Decisor'),
            e('div', { style: { fontSize: '12px', lineHeight: '1.6', color: '#333' } },
              e('div', null, summary.decisionMakers && summary.decisionMakers.join(', ')),
              summary.hasHiddenDecision && e('div', { style: { color: '#e67e22', fontWeight: '600', marginTop: '8px' } }, '⚠️ Hay decisor oculto')
            )
          ),

          // Prontitud + Frenos
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' } }, '⚡ Prontitud'),
            e('div', { style: { fontSize: '12px', lineHeight: '1.6', color: '#333' } },
              e('div', { style: { fontSize: '18px', fontWeight: '700', color: '#1b5e20' } }, summary.readiness + '/10'),
              e('div', { style: { marginTop: '8px' } }, summary.friction && summary.friction.length > 0 ? '🔴 Frenos: ' + summary.friction.join(', ') : '✅ Sin frenos')
            )
          ),

          // Capacidad
          e('div', { style: { background: '#e8f5e9', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #1b5e20' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: '#1b5e20', textTransform: 'uppercase' } }, '💳 Capacidad'),
            e('div', { style: { fontSize: '12px', lineHeight: '1.8', color: '#333' } },
              e('div', null, e('span', { style: { fontWeight: '600' } }, 'Crédito: '), '$' + (summary.maxLoan || 0).toLocaleString('es-CL')),
              e('div', null, e('span', { style: { fontWeight: '600' } }, 'Propiedad: '), 'UF ' + (summary.affordablePropertyUF || 0).toLocaleString('es-CL', {maximumFractionDigits: 0})),
              e('div', null, e('span', { style: { fontWeight: '600' } }, 'Dividendo: '), '$' + (summary.estimatedDividend || 0).toLocaleString('es-CL') + '/mes'),
              e('div', null, e('span', { style: { fontWeight: '600' } }, 'Plazo: '), summary.loanTermYears + ' años')
            )
          )
        ),

        // Botón continuar
        e('div', { style: { display: 'flex', gap: '12px', marginTop: '24px' } },
          e('button', {
            onClick: () => setStep('questions'),
            style: { flex: 1, padding: '14px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
          }, '← Volver a Discovery'),
          e('button', {
            onClick: () => setStep('station_4_projects_form'),
            style: { flex: 1, padding: '14px', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
          }, 'Continuar a Proyectos →')
        )
      ),
      e(Footer)
    );
  }

  // ESTACIÓN 2: DISCOVERY
  if (step === 'questions') {
    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step: 'discovery', advisorName, clientName, completedCount: discoveryCompletedCount }),
      e('main', { style: { flex: 1, maxWidth: '1400px', margin: '0 auto', padding: '32px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 250px', gap: '24px' } },
        // Main content
        e('div', null,
          // Banner rojo fijo: CERO PROPIEDADES
          e('div', { style: { background: '#b71c1c', color: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontWeight: '600', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' } },
            e('span', { style: { fontSize: '18px' } }, '🚫'),
            e('span', null, 'CERO PROPIEDADES HASTA TERMINAR ESTA ESTACIÓN')
          ),

          // Preguntas
          ...DISCOVERY_QUESTIONS.map((q, idx) =>
            e('div', { key: q.id, style: { background: '#fff', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' } },
              e('div', {
                onClick: () => setExpandedDiscoveryQuestion(expandedDiscoveryQuestion === idx ? -1 : idx),
                style: { padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: isDiscoveryQuestionComplete(`p${q.id}`) ? '#e8f5e9' : '#fff', borderLeft: isDiscoveryQuestionComplete(`p${q.id}`) ? '3px solid #1b5e20' : '3px solid #ddd' }
              },
                e('div', { style: { flex: 1 } },
                  e('div', { style: { fontSize: '15px', fontWeight: '600', color: '#000' } }, (isDiscoveryQuestionComplete(`p${q.id}`) ? '✓ ' : '') + 'P' + q.id + ': ' + q.question)
                ),
                e('span', { style: { fontSize: '20px', color: '#666' } }, expandedDiscoveryQuestion === idx ? '−' : '+')
              ),
              expandedDiscoveryQuestion === idx && e('div', { style: { padding: '16px', borderTop: '1px solid #eee', background: '#fafafa' } },
                (() => {
                  const field = `p${q.id}`;
                  const answer = discoveryAnswers[field];

                  return e('div', null,
                    e('p', { style: { margin: '0 0 12px', fontSize: '12px', color: '#666' } }, '💡 ' + q.help),

                    // Inputs dinámicos según tipo
                    [
                      ...Object.entries(q.inputs).map(([key, input]) => {
                      // ESPECIAL: P3 (down_payment)
                      if (field === 'p3' && key === 'down_payment') {
                        return e('div', { key, style: { marginBottom: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' } },
                          e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#000', marginBottom: '8px' } }, '💰 ' + input.label + ' (OBLIGATORIO)'),
                          e('input', {
                            type: 'number',
                            value: answer[key] || '',
                            onChange: (evt) => updateDiscoveryAnswer(field, key, evt.target.value),
                            placeholder: input.placeholder || '',
                            style: { width: '100%', padding: '10px', border: '2px solid ' + (answer[key] ? '#1b5e20' : '#ddd'), borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff', marginBottom: '12px', fontWeight: '500' }
                          }),
                          // Mostrar cálculos automáticos
                          answer[key] && parseFloat(answer[key]) > 0 && e('div', { style: { background: '#e8f5e9', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #1b5e20' } },
                            e('p', { style: { margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#1b5e20' } }, '✓ Rango detectado automáticamente:'),
                            e('p', { style: { margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#1b5e20' } }, answer.down_payment_range || '—'),
                            e('p', { style: { margin: '0', fontSize: '11px', color: '#558b2f' } }, 'UF: ' + (answer.down_payment_uf ? answer.down_payment_uf.toFixed(2) : '0'))
                          )
                        );
                      }

                      // ESPECIAL: P3 (contado checkbox)
                      if (field === 'p3' && key === 'contado') {
                        return e('div', { key, style: { marginBottom: '12px' } },
                          e('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' } },
                            e('input', {
                              type: 'checkbox',
                              checked: answer[key] || false,
                              onChange: (evt) => updateDiscoveryAnswer(field, key, evt.target.checked),
                              style: { width: '18px', height: '18px', cursor: 'pointer' }
                            }),
                            e('span', null, '💰 ' + input.label)
                          )
                        );
                      }

                      // Normal: text input
                      if (input.type === 'text') {
                        return e('div', { key, style: { marginBottom: '12px' } },
                          e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '6px' } }, input.label),
                          e('input', {
                            type: 'text',
                            value: answer[key] || '',
                            onChange: (evt) => updateDiscoveryAnswer(field, key, evt.target.value),
                            placeholder: input.placeholder || '',
                            style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }
                          })
                        );
                      }

                      // Normal: number input
                      if (input.type === 'number') {
                        return e('div', { key, style: { marginBottom: '12px' } },
                          e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '6px' } }, input.label),
                          e('input', {
                            type: 'number',
                            value: answer[key] || '',
                            onChange: (evt) => updateDiscoveryAnswer(field, key, evt.target.value),
                            placeholder: input.placeholder || '',
                            style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }
                          })
                        );
                      }

                      // Normal: tags (NO para P3 down_payment_range - eso es automático)
                      if (input.type === 'tags') {
                        return e('div', { key, style: { marginBottom: '12px' } },
                          e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '8px' } }, input.label),
                          e('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                            input.options.map(opt =>
                              e('button', {
                                key: opt,
                                onClick: () => {
                                  const currentArray = answer[key] || [];
                                  const newArray = currentArray.includes(opt) ? currentArray.filter(t => t !== opt) : [...currentArray, opt];
                                  updateDiscoveryAnswer(field, key, newArray);
                                },
                                style: { padding: '8px 12px', background: (answer[key] || []).includes(opt) ? '#000' : '#f0f0f0', color: (answer[key] || []).includes(opt) ? '#fff' : '#000', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }
                              }, opt)
                            )
                          )
                        );
                      }

                      // Normal: slider
                      if (input.type === 'slider') {
                        return e('div', { key, style: { marginBottom: '12px' } },
                          e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '8px' } }, input.label + ' (' + (answer[key] || input.min) + ')'),
                          e('input', {
                            type: 'range',
                            min: input.min,
                            max: input.max,
                            value: answer[key] || input.min,
                            onChange: (evt) => updateDiscoveryAnswer(field, key, parseInt(evt.target.value)),
                            style: { width: '100%', cursor: 'pointer' }
                          })
                        );
                      }

                      // Normal: checkbox
                      if (input.type === 'checkbox') {
                        return e('div', { key, style: { marginBottom: '12px' } },
                          e('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' } },
                            e('input', {
                              type: 'checkbox',
                              checked: answer[key] || false,
                              onChange: (evt) => updateDiscoveryAnswer(field, key, evt.target.checked),
                              style: { width: '18px', height: '18px', cursor: 'pointer' }
                            }),
                            e('span', null, input.label)
                          )
                        );
                      }

                      return null;
                    }),
                      // Campo de notas siempre visible (debajo de los inputs)
                      e('div', { key: 'notes', style: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' } },
                        e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '6px' } }, '📝 Notas (opcional)'),
                        e('textarea', {
                          ref: focusedNoteField === field ? (el) => el && el.focus() : null,
                          value: answer.notes || '',
                          onChange: (evt) => updateDiscoveryAnswer(field, 'notes', evt.target.value),
                          placeholder: 'Resumir lo que respondió el cliente, matices que los tags no cubren...',
                          rows: 3,
                          style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none', background: focusedNoteField === field ? '#fffbf0' : '#fff', transition: 'all 0.2s' }
                        })
                      )
                    ]
                  );
                })()
              )
            )
          ),

          // Botones de acción
          e('div', { style: { display: 'flex', gap: '12px', marginTop: '32px' } },
            e('button', {
              onClick: () => setStep('apertura'),
              style: { flex: 1, padding: '14px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
            }, 'Volver a Apertura'),
            e('button', {
              onClick: saveDiscoveryAndProceed,
              disabled: !allDiscoveryComplete || loading,
              style: { flex: 1, padding: '14px', background: allDiscoveryComplete && !loading ? '#1b5e20' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: allDiscoveryComplete && !loading ? 'pointer' : 'not-allowed' }
            }, loading ? 'Guardando...' : '✓ Discovery Completo → Continuar a Perfil')
          ),

          error && e('div', { style: { background: '#ffebee', borderRadius: '8px', padding: '16px', marginTop: '24px', borderLeft: '3px solid #ef5350' } },
            e('p', { style: { margin: '0', fontSize: '13px', color: '#b71c1c' } }, '❌ ' + error)
          )
        ),

        // Panel lateral: Qué escuchar + Si se desvía
        e('aside', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          // Qué escuchar (fijo)
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'sticky', top: '16px' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: '#000' } }, '👂 Qué escuchar'),
            e('ul', { style: { margin: '0', paddingLeft: '16px', fontSize: '12px', color: '#666', lineHeight: '1.6' } },
              e('li', null, 'Silencios productivos: deja pensar'),
              e('li', null, 'Toma nota visible'),
              e('li', null, 'Si abre dolor: "Cuéntame más"')
            )
          ),

          // Si se desvía (acordeón)
          e('div', { style: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('button', {
              onClick: () => setExpandedDiscoveryQuestion(expandedDiscoveryQuestion === -2 ? -1 : -2),
              style: { width: '100%', padding: '12px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
            },
              e('span', null, '⚠️ Si se desvía'),
              e('span', { style: { fontSize: '16px' } }, expandedDiscoveryQuestion === -2 ? '−' : '+')
            ),
            expandedDiscoveryQuestion === -2 && e('div', { style: { padding: '12px', borderTop: '1px solid #eee', background: '#fafafa', fontSize: '12px', color: '#666' } },
              e('p', { style: { margin: '0 0 8px', fontWeight: '600' } }, '"¿Y qué departamentos tienen?"'),
              e('p', { style: { margin: '0 0 12px', color: '#999', fontSize: '11px' } }, '"Ya llegamos a eso, promete. Dos preguntas más."'),
              e('p', { style: { margin: '0 0 8px', fontWeight: '600' } }, '"No quiero dar números"'),
              e('p', { style: { margin: '0', color: '#999', fontSize: '11px' } }, '"Un rango aproximado me basta para blindar tu caso."')
            )
          )
        )
      ),
      e(Footer)
    );
  }

  // OLD Questions Screen (fallback, will be removed after phase 2)
  if (step === 'questions_old') {
    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step, advisorName, clientName, completedCount }),
      e('main', { style: { flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px', width: '100%' } },
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
          e('div', { style: { width: '100%', background: '#e0e0e0', height: '4px', borderRadius: '2px', overflow: 'hidden' } },
            e('div', { style: { background: '#000', height: '100%', width: (completedCount / 15 * 100) + '%', transition: 'width 0.3s' } })
          )
        ),
        ...questions.map((q, idx) =>
          e('div', { key: q.id, style: { background: '#fff', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' } },
            (() => {
              const gap = gaps.find(g => g.questionId === q.id);
              const borderColor = gap ? (gap.covered ? '#1b5e20' : '#ffc107') : (q.completed ? '#1b5e20' : '#ddd');
              const borderStyle = gap && !gap.covered ? '3px solid ' + borderColor : (q.completed ? '3px solid #1b5e20' : '3px solid #ddd');
              const bgColor = gap && !gap.covered ? '#fffbf0' : (q.completed ? '#e8f5e9' : '#fff');
              return e('div', {
                onClick: () => setExpandedQuestion(expandedQuestion === idx ? -1 : idx),
                style: { padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: bgColor, borderLeft: borderStyle }
              },
                e('div', { style: { flex: 1 } },
                  e('div', { style: { fontSize: '12px', color: '#666', fontWeight: '500', marginBottom: '4px' } }, q.block),
                  e('div', { style: { fontSize: '15px', fontWeight: '600', color: '#000' } }, (gap && !gap.covered ? '⚠️ ' : (q.completed ? '✓ ' : '')) + 'P' + q.id + ': ' + q.text)
                ),
                e('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                  gap && !gap.covered && e('span', { style: { fontSize: '11px', color: '#ffc107', fontWeight: '600' } }, 'Más info'),
                  e('input', {
                    type: 'checkbox',
                    checked: q.completed,
                    onChange: (evt) => {
                      evt.stopPropagation();
                      toggleQuestionComplete(q.id);
                    },
                    style: { width: '20px', height: '20px', cursor: 'pointer', marginLeft: '12px', marginTop: '2px' }
                  })
                )
              );
            })(),
            expandedQuestion === idx && e('div', { style: { padding: '16px', borderTop: '1px solid #eee', background: '#fafafa' } },
              e('div', { style: { marginBottom: '16px' } },
                e('p', { style: { margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#666' } }, 'Propósito'),
                e('p', { style: { margin: '0', fontSize: '13px', color: '#333' } }, q.purpose)
              ),
              e('div', { style: { marginBottom: '16px' } },
                e('p', { style: { margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#666' } }, 'Cómo escuchar'),
                e('p', { style: { margin: '0', fontSize: '13px', color: '#333' } }, q.howToListen)
              ),
              q.redFlags && e('div', { style: { marginBottom: '16px', padding: '12px', background: '#ffebee', borderRadius: '6px', borderLeft: '3px solid #ef5350' } },
                e('p', { style: { margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#b71c1c' } }, 'Red Flags'),
                e('p', { style: { margin: '0', fontSize: '13px', color: '#b71c1c' } }, q.redFlags)
              ),
              gaps.find(g => g.questionId === q.id && !g.covered) && e('div', { style: { marginBottom: '16px', padding: '12px', background: '#fffbf0', borderRadius: '6px', borderLeft: '3px solid #ffc107' } },
                e('p', { style: { margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#856404' } }, '💡 Información adicional de Meet:'),
                e('p', { style: { margin: '0', fontSize: '13px', color: '#856404' } }, gaps.find(g => g.questionId === q.id && !g.covered).suggestion)
              ),
              e('label', { style: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px' } }, 'Notas de la respuesta'),
              e('textarea', {
                value: q.notes,
                onChange: (evt) => updateQuestionNotes(q.id, evt.target.value),
                placeholder: 'Resumir lo que respondió el cliente...',
                rows: 3,
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none', background: '#fff' }
              })
            )
          )
        ),
        e('div', { style: { background: '#f0f4f8', borderRadius: '8px', padding: '16px', marginBottom: '24px', marginTop: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #d0dce6' } },
          e('p', { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#000' } }, '📋 Validar con Notas de Gemini (Opcional)'),
          e('p', { style: { margin: '0 0 12px', fontSize: '12px', color: '#666' } }, 'Si tomaste notas automáticas en Google Meet, puedes pegarlas aquí para detectar gaps.'),
          e('textarea', {
            value: meetNotes,
            onChange: (evt) => setMeetNotes(evt.target.value),
            placeholder: 'Pega aquí las notas automáticas que Gemini tomó en Google Meet...',
            rows: 4,
            style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none', background: '#fff', marginBottom: '12px' }
          }),
          e('button', {
            onClick: handleValidate,
            disabled: validating || !meetNotes.trim(),
            style: { padding: '10px 16px', background: (validating || !meetNotes.trim()) ? '#ccc' : '#0066cc', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: (validating || !meetNotes.trim()) ? 'not-allowed' : 'pointer' }
          }, validating ? 'Validando...' : 'Validar Completitud')
        ),
        gaps.length > 0 && e('div', { style: { background: '#fff3cd', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', borderLeft: '3px solid #ffc107' } },
          e('p', { style: { margin: '0', fontSize: '13px', color: '#856404', fontWeight: '500' } }, '⚠️ ' + gaps.filter(g => !g.covered).length + ' pregunta(s) con información adicional de Meet')
        )
      ),
      e('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px 32px', display: 'flex', gap: '12px', width: '100%' } },
        e('button', {
          onClick: () => setStep('setup'),
          style: { flex: 1, padding: '14px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600' }
        }, 'Volver'),
        e('button', {
          onClick: handleAnalyze,
          disabled: !canAnalyze || loading,
          style: { flex: 1, padding: '14px', background: (canAnalyze && !loading) ? '#1b5e20' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: (canAnalyze && !loading) ? 'pointer' : 'not-allowed' }
        }, loading ? 'Analizando...' : 'Analizar Sesión (' + completedCount + '/15)')
      ),
      e(Footer)
    );
  }

  // Results Screen
  if (step === 'results' && analysis) {
    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step, advisorName, clientName, completedCount }),
      e('main', { style: { flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px', width: '100%' } },
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
          e('p', { style: { margin: '0', fontSize: '14px', color: '#666' } }, 'Cliente'),
          e('p', { style: { margin: '0', fontSize: '18px', fontWeight: '600', color: '#000' } }, clientName)
        ),
        e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' } },
          e('div', { style: { background: '#000', color: '#fff', borderRadius: '8px', padding: '16px' } },
            e('p', { style: { margin: '0 0 8px', fontSize: '12px', color: '#aaa' } }, 'Score General'),
            e('p', { style: { margin: '0', fontSize: '32px', fontWeight: 'bold' } }, analysis.score_general + '/100')
          ),
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('p', { style: { margin: '0 0 8px', fontSize: '12px', color: '#666' } }, 'Calificación'),
            e(QualBadge, { q: analysis.pai_qualification })
          )
        ),
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
          e('p', { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#000' } }, 'Indicadores'),
          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            ...Object.entries(analysis.scores || {}).map(([key, val]) =>
              e('div', { key, style: { padding: '12px', background: '#f5f5f5', borderRadius: '6px' } },
                e('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                  e('span', { style: { fontSize: '12px', fontWeight: '500', color: '#666' } }, key.replace(/_/g, ' ')),
                  e('span', { style: { fontSize: '12px', fontWeight: 'bold', color: '#000' } }, val + '%')
                ),
                e('div', { style: { width: '100%', background: '#ddd', height: '3px', borderRadius: '2px', overflow: 'hidden' } },
                  e('div', { style: { background: '#000', height: '100%', width: val + '%' } })
                )
              )
            )
          )
        ),
        analysis.red_flags && analysis.red_flags.length > 0 && e('div', { style: { background: '#ffebee', borderRadius: '8px', padding: '16px', borderLeft: '3px solid #ef5350', marginBottom: '16px' } },
          e('p', { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#b71c1c' } }, 'Puntos de Atención'),
          e('ul', { style: { margin: '0', paddingLeft: '20px' } },
            ...analysis.red_flags.map((flag, idx) => e('li', { key: idx, style: { color: '#b71c1c', fontSize: '13px', marginBottom: '6px' } }, flag))
          )
        ),
        analysis.positive_signals && analysis.positive_signals.length > 0 && e('div', { style: { background: '#e8f5e9', borderRadius: '8px', padding: '16px', borderLeft: '3px solid #1b5e20', marginBottom: '16px' } },
          e('p', { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#1b5e20' } }, 'Señales Positivas'),
          e('ul', { style: { margin: '0', paddingLeft: '20px' } },
            ...analysis.positive_signals.map((sig, idx) => e('li', { key: idx, style: { color: '#1b5e20', fontSize: '13px', marginBottom: '6px' } }, '✓ ' + sig))
          )
        ),
        e('div', { style: { display: 'flex', gap: '12px' } },
          e('button', {
            onClick: handleDownloadPDF,
            style: { flex: 1, padding: '14px', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
          }, '📥 Descargar PDF'),
          e('button', {
            onClick: () => {
              setStep('questions');
              setQuestions(QUESTIONS.map(q => ({...q, completed: false, notes: ''})));
              setExpandedQuestion(0);
              setAnalysis(null);
            },
            style: { flex: 1, padding: '14px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
          }, 'Nueva Sesión')
        )
      ),
      e(Footer)
    );
  }

  return e('div', { style: { background: '#fafafa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    e('div', { style: { textAlign: 'center', color: '#666' } },
      e('p', null, error || 'Cargando...')
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(e(Dashboard));
