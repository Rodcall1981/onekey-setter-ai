const { useState } = React;
const e = React.createElement;

function Dashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [inputText, setInputText] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = () => {
    if (!clientName.trim() || !analysis) {
      alert('Ingresa nombre del cliente');
      return;
    }
    const newSession = {
      id: Date.now(),
      clientName,
      timestamp: new Date().toLocaleString('es-CL'),
      score: analysis.score_general,
      qualification: analysis.pai_qualification,
      analysis
    };
    setSessions([newSession, ...sessions]);
    setClientName('');
    setInputText('');
    setAnalysis(null);
    alert('Sesión guardada: ' + clientName);
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

  return e('div', { style: { background: '#fafafa', minHeight: '100vh' } },
    // Header
    e('div', { style: { background: '#000', color: '#fff', padding: '24px 32px', borderBottom: '1px solid #333' } },
      e('div', { style: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        e('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          e('div', { style: { width: '32px', height: '32px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#000' } }, 'OK'),
          e('div', null,
            e('h1', { style: { margin: '0', fontSize: '20px', fontWeight: '600' } }, 'OneKey'),
            e('p', { style: { margin: '2px 0 0', fontSize: '12px', color: '#aaa' } }, 'Setter Dashboard')
          )
        )
      )
    ),

    e('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '32px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' } },
      // Panel INPUT
      e('div', null,
        e('div', { style: { background: '#fff', borderRadius: '8px', padding: '24px', position: 'sticky', top: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
          e('h2', { style: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#000' } }, 'Nueva Sesión'),

          e('input', {
            value: clientName,
            onChange: (evt) => setClientName(evt.target.value),
            placeholder: 'Nombre del cliente',
            disabled: !!analysis,
            style: {
              width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px',
              fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff'
            }
          }),

          e('textarea', {
            value: inputText,
            onChange: (evt) => setInputText(evt.target.value),
            placeholder: 'Pega la conversación...',
            rows: 8,
            disabled: !!analysis,
            style: {
              width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px',
              fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none', background: '#fff'
            }
          }),

          !analysis && e('button', {
            onClick: handleAnalyze,
            disabled: loading || !inputText.trim(),
            style: {
              width: '100%', padding: '12px', background: loading || !inputText.trim() ? '#ccc' : '#000', color: '#fff',
              border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px'
            }
          }, loading ? 'Analizando...' : 'Analizar'),

          analysis && e('div', { style: { display: 'flex', gap: '8px', flexDirection: 'column' } },
            e('button', {
              onClick: handleSaveSession,
              style: { padding: '12px', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600' }
            }, 'Guardar Sesión'),
            e('button', {
              onClick: () => { setAnalysis(null); setInputText(''); setClientName(''); },
              style: { padding: '12px', background: '#555', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600' }
            }, 'Nueva Sesión')
          )
        )
      ),

      // Panel RESULTADOS
      e('div', null,
        error && e('div', { style: { background: '#ffebee', border: '1px solid #ef5350', color: '#b71c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' } }, error),

        analysis && e('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          // Progress
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' } },
              e('p', { style: { margin: '0', fontSize: '14px', fontWeight: '600', color: '#666' } }, 'Progreso'),
              e('span', { style: { fontSize: '18px', fontWeight: 'bold', color: '#000' } }, (analysis.questions_answered || 0) + '/15')
            ),
            e('div', { style: { width: '100%', background: '#e0e0e0', height: '4px', borderRadius: '2px', overflow: 'hidden' } },
              e('div', { style: { background: '#000', height: '100%', width: ((analysis.questions_answered || 0) / 15 * 100) + '%' } })
            )
          ),

          // Score + Qualification
          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            e('div', { style: { background: '#000', color: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
              e('p', { style: { margin: '0 0 8px', fontSize: '12px', color: '#aaa' } }, 'Score General'),
              e('p', { style: { margin: '0', fontSize: '32px', fontWeight: 'bold' } }, analysis.score_general + '/100')
            ),
            e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
              e('p', { style: { margin: '0 0 8px', fontSize: '12px', color: '#666' } }, 'Calificación'),
              e(QualBadge, { q: analysis.pai_qualification })
            )
          ),

          // Scores detallados
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
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

          // Aprobación
          analysis.approval_capacity && e('div', { style: { background: '#f5f5f5', borderRadius: '8px', padding: '16px', borderLeft: '3px solid #000' } },
            e('p', { style: { margin: '0 0 8px', fontSize: '12px', color: '#666' } }, 'Capacidad de Aprobación'),
            e('p', { style: { margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#000' } }, 'UF ' + (analysis.approval_capacity || 0).toFixed(0))
          ),

          // Tipo inversión
          analysis.investment_type && e('div', { style: { background: '#f5f5f5', borderRadius: '8px', padding: '16px', borderLeft: '3px solid #000' } },
            e('p', { style: { margin: '0 0 8px', fontSize: '12px', color: '#666' } }, 'Tipo de Inversión'),
            e('p', { style: { margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#000' } }, analysis.investment_type)
          ),

          // Red Flags
          analysis.red_flags && analysis.red_flags.length > 0 && e('div', { style: { background: '#ffebee', borderRadius: '8px', padding: '16px', borderLeft: '3px solid #ef5350' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#b71c1c' } }, 'Puntos de Atención'),
            e('ul', { style: { margin: '0', paddingLeft: '20px' } },
              ...analysis.red_flags.map((flag, idx) => e('li', { key: idx, style: { color: '#b71c1c', fontSize: '13px', marginBottom: '6px' } }, flag))
            )
          ),

          // Positivas
          analysis.positive_signals && analysis.positive_signals.length > 0 && e('div', { style: { background: '#e8f5e9', borderRadius: '8px', padding: '16px', borderLeft: '3px solid #1b5e20' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#1b5e20' } }, 'Señales Positivas'),
            e('ul', { style: { margin: '0', paddingLeft: '20px' } },
              ...analysis.positive_signals.map((sig, idx) => e('li', { key: idx, style: { color: '#1b5e20', fontSize: '13px', marginBottom: '6px' } }, '✓ ' + sig))
            )
          ),

          // Recomendaciones
          e('div', { style: { background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('p', { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#000' } }, 'Recomendaciones'),
            e('div', { style: { marginBottom: '12px' } },
              e('p', { style: { margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#666' } }, 'Próxima pregunta'),
              e('p', { style: { margin: '0', fontSize: '13px', color: '#333', fontStyle: 'italic' } }, analysis.next_question_recommended)
            ),
            e('div', { style: { background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '12px' } },
              e('p', { style: { margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#666' } }, 'Estrategia'),
              e('p', { style: { margin: '0', fontSize: '13px', color: '#333' } }, analysis.tactical_note)
            ),
            analysis.closing_phrases && e('div', null,
              e('p', { style: { margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: '#666' } }, 'Frases de Cierre'),
              e('ul', { style: { margin: '0', paddingLeft: '20px' } },
                ...(analysis.closing_phrases || []).map((phrase, idx) => e('li', { key: idx, style: { fontSize: '13px', color: '#333', marginBottom: '4px' } }, '"' + phrase + '"'))
              )
            )
          )
        )
      )
    ),

    // Historial
    e('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px 32px' } },
      sessions.length > 0 && e('div', null,
        e('h2', { style: { margin: '40px 0 16px', fontSize: '18px', fontWeight: '600', color: '#000' } }, 'Historial de Sesiones'),
        e('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' } },
          ...sessions.map((s) => e('div', { key: s.id, style: { background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } },
            e('p', { style: { margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#000' } }, s.clientName),
            e('p', { style: { margin: '0 0 12px', fontSize: '12px', color: '#999' } }, s.timestamp),
            e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
              e('span', { style: { fontSize: '20px', fontWeight: 'bold', color: '#000' } }, s.score + '/100'),
              e(QualBadge, { q: s.qualification })
            )
          ))
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(e(Dashboard));
