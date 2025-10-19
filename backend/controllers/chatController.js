const { generateResponse } = require('../services/geminiService');

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const response = await generateResponse(message);
    res.json({ response });
  } catch (error) {
    console.error('Error en el controlador de chat:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

module.exports = { chatWithAI };
