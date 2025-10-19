const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa el cliente de Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generateResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error al generar respuesta con Gemini:', error);
    return 'Lo siento, no pude procesar tu solicitud en este momento.';
  }
}

module.exports = { generateResponse };
