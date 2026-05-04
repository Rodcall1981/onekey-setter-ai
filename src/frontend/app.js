const { useState } = React;
const e = React.createElement;

const INTRO_SCRIPT = `Hola {clientName}, soy {advisorName}, asesor patrimonial en OneKey.

Esta reunión es el primer paso para lograr tu objetivo de inversión, crecimiento patrimonial o compra de una propiedad.

En esta reunión tendremos una primera conversación, donde setearemos tus expectativas, donde además espero conocerte mejor y ver qué tan preparado estás para este paso.

Porque como decimos acá, no estás comprando un par de zapatillas, es de las inversiones más importantes de la vida.

Así que te voy a dar un par de indicaciones antes de comenzar, ¿estás de acuerdo?

Este es un programa integral de inversión inmobiliaria, analizaremos tu perfil de inversión, que va desde conservador a arriesgado.

Además, necesito que tus respuestas sean lo más real para poder determinar qué nivel de conocimiento tienes del mercado inmobiliario.

También debes entender que acá mi compromiso es contigo y con tu futuro. Esta es nuestra primera reunión, veremos si calificas para continuar con el programa OneKey.`;

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
  return e('div', { style: { background: '#383838', color: '#fff', padding: '16px 32px', borderBottom: '1px solid #4d5c61', position: 'sticky', top: 0, zIndex: 100 } },
    e('div', { style: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      e('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        e('span', { style: { fontSize: '18px', fontWeight: '300', letterSpacing: '-0.5px' } }, 'onekey'),
        e('span', { style: { fontSize: '12px', color: '#aaa', fontWeight: '400' } }, 'Paso 1: Sistema Arquitectura Patrimonial')
      ),
      showProgress && e('div', { style: { textAlign: 'right' } },
        e('p', { style: { margin: '0 0 6px', fontSize: '11px', color: '#aaa', fontWeight: '500' } }, advisorName && clientName ? clientName + ' • ' + completedCount + '/15' : 'Progreso'),
        e('div', { style: { width: '120px', background: '#515266', height: '3px', borderRadius: '2px', overflow: 'hidden' } },
          e('div', { style: { background: '#d1dfdf', height: '100%', width: (completedCount / 15 * 100) + '%', transition: 'width 0.3s' } })
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
  const [questions, setQuestions] = useState(QUESTIONS);
  const [expandedQuestion, setExpandedQuestion] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meetNotes, setMeetNotes] = useState('');
  const [gaps, setGaps] = useState([]);
  const [validating, setValidating] = useState(false);

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
          e('p', { style: { margin: '0', fontSize: '14px', color: '#666' } }, 'Diagnóstico Inicial')
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
          onClick: () => setStep('intro'),
          disabled: !advisorName.trim() || !clientName.trim(),
          style: { width: '100%', padding: '14px', background: (advisorName.trim() && clientName.trim()) ? '#000' : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: (advisorName.trim() && clientName.trim()) ? 'pointer' : 'not-allowed' }
        }, 'Iniciar Sesión')
      )
    );
  }

  // Intro Screen
  if (step === 'intro') {
    const script = INTRO_SCRIPT.replace('{clientName}', clientName).replace('{advisorName}', advisorName);
    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step, advisorName, clientName, completedCount }),
      e('main', { style: { flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '48px 32px', width: '100%' } },
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' } },
          e('p', { style: { fontSize: '16px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap', margin: '0' } }, script)
        ),
        e('div', { style: { display: 'flex', gap: '12px' } },
          e('button', {
            onClick: () => setStep('setup'),
            style: { flex: 1, padding: '14px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600' }
          }, 'Volver'),
          e('button', {
            onClick: () => setStep('questions'),
            style: { flex: 1, padding: '14px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600' }
          }, 'Comenzar Preguntas')
        )
      ),
      e(Footer)
    );
  }

  // Questions Screen
  if (step === 'questions') {
    return e('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to right, #f7f7f7 0%, #f0f2f5 50%, #e8eef5 100%)' } },
      e(Header, { step, advisorName, clientName, completedCount }),
      e('main', { style: { flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px', width: '100%' } },
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
          e('div', { style: { width: '100%', background: '#e0e0e0', height: '4px', borderRadius: '2px', overflow: 'hidden' } },
            e('div', { style: { background: '#000', height: '100%', width: (completedCount / 15 * 100) + '%', transition: 'width 0.3s' } })
          )
        ),
        e('div', { style: { background: '#f0f4f8', borderRadius: '8px', padding: '16px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #d0dce6' } },
          e('p', { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#000' } }, '📋 Notas de Gemini de Meet'),
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
                  e('div', { style: { fontSize: '15px', fontWeight: '600', color: '#000' } }, (gap && !gap.covered ? '⚠️ ' : (q.completed ? '✓ ' : '')) + 'P' + q.id + ': ' + q.text.substring(0, 60) + '...')
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
        e('button', {
          onClick: () => {
            setStep('questions');
            setQuestions(QUESTIONS.map(q => ({...q, completed: false, notes: ''})));
            setExpandedQuestion(0);
            setAnalysis(null);
          },
          style: { width: '100%', padding: '14px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600' }
        }, 'Nueva Sesión')
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
