const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function analyzeConversation(text) {
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2000,
      thinking: { type: 'adaptive' },
      system: `Devuelve JSON válido con: transcription_partial, questions_answered (0-15), scores (capacidad_financiera, conocimiento, tolerancia_riesgo, claridad_objetivos, disposicion_pai), score_general, red_flags, positive_signals, next_question_recommended, tactical_note, monthly_salary (número o null), approval_capacity (sueldo/800 o null), has_savings, has_dicom, contract_type, investment_type, pai_qualification ("Apto" si >=70, "Necesita educación" si 50-69, "No apto" si <50), closing_phrases (array).`,
      messages: [{ role: 'user', content: 'Analiza: ' + text }]
    });

    const responseText = message.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    const analysis = JSON.parse(responseText);
    return { success: true, data: analysis };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { analyzeConversation };
