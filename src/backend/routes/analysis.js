const express = require('express');
const router = express.Router();
const { analyzeConversation } = require('../services/claudeService');
const { saveAnalysis } = require('../services/supabaseService');
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

module.exports = router;
