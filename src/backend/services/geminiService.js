const { GoogleGenerativeAI } = require('@google/generative-ai');

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function validateCompleteness({ meetNotes, questions }) {
  try {
    const questionsText = questions
      .map(q => `Pregunta ${q.id}: ${q.text}\nNotas del asesor: ${q.notes || '(vacío)'}`)
      .join('\n\n');

    const prompt = `Eres un asistente de análisis de reuniones de asesoría patrimonial.

Se realizaron las siguientes preguntas a un cliente con estas notas del asesor:
${questionsText}

Estas son las notas automáticas que Gemini capturó en Google Meet:
${meetNotes}

Analiza si las notas de Meet contienen información ADICIONAL relevante que NO está capturada en las notas del asesor para cada pregunta.

Responde SOLO con JSON válido (sin markdown, sin explicación):
{
  "gaps": [
    { "questionId": 1, "covered": true, "suggestion": "" },
    { "questionId": 2, "covered": false, "suggestion": "Descripción de qué falta" }
  ]
}

Incluye TODAS las ${questions.length} preguntas en el array.`;

    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      gaps: parsedResponse.gaps || []
    };
  } catch (error) {
    console.error('Error in validateCompleteness:', error.message);
    return {
      success: false,
      error: error.message,
      gaps: []
    };
  }
}

module.exports = {
  validateCompleteness
};
