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
    id: 1,
    question: 'Cuéntame, ¿en qué trabajas y hace cuánto?',
    field: 'p1',
    inputs: {
      job_description: { type: 'text', label: 'Descripción del trabajo', placeholder: 'Ej: Ingeniero, Vendedor, Empresario...' },
      job_type: { type: 'tags', label: 'Tipo de ocupación', options: ['Dependiente', 'Independiente', 'Empresario', 'Renta de inversiones'] },
      tenure: { type: 'tags', label: 'Antigüedad', options: ['<1 año', '1-3 años', '3+ años'] }
    },
    help: 'Estabilidad de ingreso, base del semáforo crediticio.'
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
      down_payment: { type: 'number', label: 'Pie disponible (CLP)', placeholder: '15000000' },
      down_payment_range: { type: 'tags', label: 'Rango', options: ['🔴 No tiene pie / negativo', '$0 – $5MM', '$5MM – $15MM', '$15MM – $30MM', '$30MM – $50MM', '$50MM – $80MM', '$80MM+', '💰 Compra al contado'] }
    },
    help: 'Ancla la capacidad y alimenta el perfil y el semáforo.'
  },
  {
    id: 4,
    question: '¿Qué te motivó a buscar esto AHORA y no hace 3 años?',
    field: 'p4',
    inputs: {
      motivation: { type: 'tags', label: 'Motivación', options: ['Juntó capital', 'Cambió situación', 'Miedo a quedar atrás', 'Oportunidad puntual', 'Exploración'] },
      urgency: { type: 'slider', label: 'Urgencia (1-5)', min: 1, max: 5 }
    },
    help: 'Urgencia real vs exploración.'
  },
  {
    id: 5,
    question: '¿Y qué pasa si dentro de 3 años sigues sin invertir? ¿Cómo se ve tu situación?',
    field: 'p5',
    inputs: {
      pain: { type: 'tags', label: 'Dolor', options: ['Quedarse igual', 'Perder poder adquisitivo', 'Frustración', 'Miedo a vejez/retiro', 'Indiferente'] },
      intensity: { type: 'slider', label: 'Intensidad emocional (1-5)', min: 1, max: 5 }
    },
    help: 'Sin dolor con emoción (slider ≥3), el cliente no está listo.'
  },
  {
    id: 6,
    question: 'Aparte de la rentabilidad, ¿hay alguien específico en quien estés pensando con esto? Hijos, padres, tu retiro.',
    field: 'p6',
    inputs: {
      anchor: { type: 'tags', label: 'Ancla emocional', options: ['Hijos', 'Pareja', 'Padres', 'Retiro propio', 'Solo rentabilidad'] }
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
    p1: { job_description: '', job_type: [], tenure: [] },
    p2: { monthly_income: '', total_debt: '', debt_types: [] },
    p3: { down_payment: '', down_payment_uf: 0, down_payment_range: [] },
    p4: { motivation: [], urgency: 3 },
    p5: { pain: [], intensity: 3 },
    p6: { anchor: [] },
    p7: { decision_makers: [], hidden_decisor_flag: false },
    p8: { readiness: 5, friction: [] }
  });
  const [expandedDiscoveryQuestion, setExpandedDiscoveryQuestion] = useState(0);

  // Old questions (fallback)
  const [questions, setQuestions] = useState(QUESTIONS);
  const [expandedQuestion, setExpandedQuestion] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meetNotes, setMeetNotes] = useState('');
  const [gaps, setGaps] = useState([]);
  const [validating, setValidating] = useState(false);

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

  // ESTACIÓN 2: Actualizar respuesta de Discovery
  const updateDiscoveryAnswer = (field, key, value) => {
    setDiscoveryAnswers(prev => ({
      ...prev,
      [field]: { ...prev[field], [key]: value }
    }));

    // P3: calcular UF automáticamente
    if (field === 'p3' && key === 'down_payment') {
      const downPaymentClp = parseFloat(value) || 0;
      const ufValue = downPaymentClp / 41000; // UF ref configurable
      setDiscoveryAnswers(prev => ({
        ...prev,
        p3: { ...prev.p3, down_payment_uf: ufValue }
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
  };

  // Verificar si una pregunta está completada (al menos un valor)
  const isDiscoveryQuestionComplete = (field) => {
    const answer = discoveryAnswers[field];
    switch (field) {
      case 'p1':
        return answer.job_type.length > 0 || answer.tenure.length > 0 || answer.job_description.trim() !== '';
      case 'p2':
        return answer.debt_types.length > 0 || answer.monthly_income !== '' || answer.total_debt !== '';
      case 'p3':
        return answer.down_payment_range.length > 0 || answer.down_payment !== '';
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

  // Contar preguntas completadas
  const discoveryCompletedCount = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].filter(isDiscoveryQuestionComplete).length;
  const allDiscoveryComplete = discoveryCompletedCount === 8;

  // ESTACIÓN 2: Guardar Discovery
  const saveDiscoveryAndProceed = async () => {
    if (!allDiscoveryComplete) {
      setError('Por favor completa todas las 8 preguntas antes de continuar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Guardar respuestas de Discovery en Supabase
      const discoveryResponse = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          p1_job_description: discoveryAnswers.p1.job_description,
          p1_job_type: discoveryAnswers.p1.job_type[0] || null,
          p1_tenure: discoveryAnswers.p1.tenure[0] || null,
          p2_monthly_income_clp: discoveryAnswers.p2.monthly_income ? parseFloat(discoveryAnswers.p2.monthly_income) : null,
          p2_total_debt_clp: discoveryAnswers.p2.total_debt ? parseFloat(discoveryAnswers.p2.total_debt) : null,
          p2_debt_types: discoveryAnswers.p2.debt_types,
          p3_down_payment_clp: discoveryAnswers.p3.down_payment ? parseFloat(discoveryAnswers.p3.down_payment) : null,
          p3_down_payment_uf: discoveryAnswers.p3.down_payment_uf || null,
          p3_down_payment_range: discoveryAnswers.p3.down_payment_range[0] || null,
          p4_motivation_tags: discoveryAnswers.p4.motivation,
          p4_urgency_slider: discoveryAnswers.p4.urgency,
          p5_pain_tags: discoveryAnswers.p5.pain,
          p5_emotional_intensity_slider: discoveryAnswers.p5.intensity,
          p6_emotional_anchors: discoveryAnswers.p6.anchor,
          p7_decision_makers: discoveryAnswers.p7.decision_makers,
          p7_has_hidden_decisor: discoveryAnswers.p7.hidden_decisor_flag,
          p8_readiness_slider: discoveryAnswers.p8.readiness,
          p8_friction_tags: discoveryAnswers.p8.friction
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
                    Object.entries(q.inputs).map(([key, input]) => {
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
                      } else if (input.type === 'number') {
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
                      } else if (input.type === 'tags') {
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
                      } else if (input.type === 'slider') {
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
                      return null;
                    })
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
