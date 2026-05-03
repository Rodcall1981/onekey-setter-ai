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
    alert('✅ Sesión guardada: ' + clientName);
  };

  const QualBadge = ({ q }) => {
    const colors = { 'Apto': 'green', 'Necesita educación': 'yellow', 'No apto': 'red' };
    const color = colors[q] || 'gray';
    return e('span', { className: `px-4 py-2 rounded-lg bg-${color}-100 text-${color}-800 border border-${color}-300 font-bold` }, q);
  };

  return e('div', { className: 'min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8' },
    e('div', { className: 'max-w-7xl mx-auto' },
      e('h1', { className: 'text-4xl font-bold text-slate-900 mb-2' }, '🎯 OneKey - Setter Dashboard'),
      e('p', { className: 'text-slate-600 mb-8' }, 'Sistema inteligente de calificación'),

      e('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-8' },
        // Panel INPUT
        e('div', { className: 'lg:col-span-1' },
          e('div', { className: 'bg-white rounded-lg shadow-lg p-6 sticky top-8' },
            e('h2', { className: 'text-lg font-semibold mb-4' }, '📝 Nueva Sesión'),
            
            e('input', {
              value: clientName,
              onChange: (evt) => setClientName(evt.target.value),
              placeholder: 'Nombre del cliente',
              className: 'w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500',
              disabled: !!analysis
            }),
            
            e('textarea', {
              value: inputText,
              onChange: (evt) => setInputText(evt.target.value),
              className: 'w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500',
              rows: 6,
              placeholder: 'Pega la conversación...',
              disabled: !!analysis
            }),
            
            !analysis && e('button', {
              onClick: handleAnalyze,
              disabled: loading || !inputText.trim(),
              className: 'w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400'
            }, loading ? '⏳ Analizando...' : '🚀 Analizar'),
            
            analysis && e('div', { className: 'space-y-2' },
              e('button', {
                onClick: handleSaveSession,
                className: 'w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold'
              }, '💾 Guardar Sesión'),
              e('button', {
                onClick: () => { setAnalysis(null); setInputText(''); setClientName(''); },
                className: 'w-full bg-slate-400 text-white py-2 rounded-lg hover:bg-slate-500 mt-2'
              }, '🔄 Nueva Sesión')
            )
          )
        ),

        // Panel RESULTADOS
        e('div', { className: 'lg:col-span-2' },
          error && e('div', { className: 'bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6' }, error),

          analysis && e('div', { className: 'space-y-6' },
            // Progress
            e('div', { className: 'bg-white rounded-lg shadow p-6' },
              e('div', { className: 'flex justify-between items-center mb-3' },
                e('h3', { className: 'font-semibold text-lg' }, '📊 Progreso'),
                e('span', { className: 'text-2xl font-bold text-blue-600' }, (analysis.questions_answered || 0) + '/15')
              ),
              e('div', { className: 'w-full bg-slate-200 rounded-full h-3' },
                e('div', { className: 'bg-blue-600 h-3 rounded-full', style: { width: ((analysis.questions_answered || 0) / 15 * 100) + '%' } })
              )
            ),

            // Score + Qualification
            e('div', { className: 'grid grid-cols-2 gap-4' },
              e('div', { className: 'bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow p-6 text-white' },
                e('p', { className: 'text-sm opacity-90' }, 'Score General'),
                e('p', { className: 'text-4xl font-bold' }, analysis.score_general + '/100')
              ),
              e('div', { className: 'bg-white rounded-lg shadow p-6 flex flex-col justify-center' },
                e('p', { className: 'text-sm text-slate-600 mb-2' }, 'Calificación PAI'),
                e(QualBadge, { q: analysis.pai_qualification })
              )
            ),

            // Scores detallados
            e('div', { className: 'bg-white rounded-lg shadow p-6' },
              e('h3', { className: 'text-lg font-semibold mb-4' }, '📊 Scores'),
              e('div', { className: 'grid grid-cols-2 gap-4' },
                Object.entries(analysis.scores || {}).map(([key, val]) => 
                  e('div', { key },
                    e('div', { className: 'flex justify-between mb-1' },
                      e('span', { className: 'text-sm font-medium' }, key.replace(/_/g, ' ')),
                      e('span', { className: 'text-sm font-bold text-blue-600' }, val + '/100')
                    ),
                    e('div', { className: 'w-full bg-slate-200 rounded-full h-2' },
                      e('div', { className: 'bg-blue-600 h-2 rounded-full', style: { width: val + '%' } })
                    )
                  )
                )
              )
            ),

            // Aprobación
            analysis.approval_capacity && e('div', { className: 'bg-indigo-50 rounded-lg shadow p-6 border-l-4 border-indigo-500' },
              e('h3', { className: 'text-lg font-semibold mb-3 text-indigo-700' }, '💰 Capacidad Aprobación'),
              e('p', { className: 'text-2xl font-bold text-indigo-900' }, 'UF ' + (analysis.approval_capacity || 0).toFixed(0)),
              e('p', { className: 'text-sm text-indigo-600 mt-2' }, '(Sueldo ÷ 800)')
            ),

            // Tipo inversión
            analysis.investment_type && e('div', { className: 'bg-emerald-50 rounded-lg shadow p-6 border-l-4 border-emerald-500' },
              e('h3', { className: 'text-lg font-semibold mb-3 text-emerald-700' }, '🏠 Tipo de Inversión'),
              e('p', { className: 'text-xl font-bold text-emerald-900' }, analysis.investment_type)
            ),

            // Red Flags
            analysis.red_flags && analysis.red_flags.length > 0 && e('div', { className: 'bg-red-50 rounded-lg shadow p-6 border-l-4 border-red-500' },
              e('h3', { className: 'text-lg font-semibold mb-3 text-red-700' }, '🚨 Red Flags'),
              e('ul', { className: 'space-y-2' },
                analysis.red_flags.map((flag, idx) => e('li', { key: idx, className: 'text-red-700 flex items-start text-sm' }, e('span', { className: 'mr-2' }, '⚠️'), flag))
              )
            ),

            // Positivas
            analysis.positive_signals && analysis.positive_signals.length > 0 && e('div', { className: 'bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500' },
              e('h3', { className: 'text-lg font-semibold mb-3 text-green-700' }, '✅ Señales Positivas'),
              e('ul', { className: 'space-y-2' },
                analysis.positive_signals.map((sig, idx) => e('li', { key: idx, className: 'text-green-700 flex items-start text-sm' }, e('span', { className: 'mr-2' }, '✓'), sig))
              )
            ),

            // Recomendaciones
            e('div', { className: 'bg-purple-50 rounded-lg shadow p-6 border-l-4 border-purple-500' },
              e('h3', { className: 'text-lg font-semibold mb-3 text-purple-700' }, '💡 Recomendaciones'),
              e('div', { className: 'mb-4' },
                e('p', { className: 'font-semibold text-purple-900 mb-2' }, '📌 Próxima pregunta:'),
                e('p', { className: 'text-purple-800 italic' }, analysis.next_question_recommended)
              ),
              e('div', { className: 'bg-white rounded p-3 border border-purple-200' },
                e('p', { className: 'font-semibold text-purple-900 mb-2' }, '🎯 Estrategia:'),
                e('p', { className: 'text-purple-800 text-sm' }, analysis.tactical_note)
              ),
              analysis.closing_phrases && e('div', { className: 'mt-4 bg-purple-100 rounded p-3' },
                e('p', { className: 'font-semibold text-purple-900 mb-2' }, '💬 Frases:'),
                e('ul', { className: 'space-y-1' },
                  (analysis.closing_phrases || []).map((phrase, idx) => e('li', { key: idx, className: 'text-purple-800 text-sm' }, '• "' + phrase + '"'))
                )
              )
            )
          )
        )
      ),

      // Historial
      sessions.length > 0 && e('div', { className: 'mt-12 bg-white rounded-lg shadow-lg p-6' },
        e('h2', { className: 'text-2xl font-bold mb-6' }, '📋 Historial'),
        e('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          sessions.map((s) => e('div', { key: s.id, className: 'border border-slate-300 rounded-lg p-4 hover:shadow-lg' },
            e('p', { className: 'font-bold text-lg' }, s.clientName),
            e('p', { className: 'text-sm text-slate-600' }, s.timestamp),
            e('div', { className: 'mt-3 flex justify-between items-center' },
              e('span', { className: 'text-2xl font-bold text-blue-600' }, s.score + '/100'),
              e(QualBadge, { q: s.qualification })
            )
          ))
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(e(Dashboard));
