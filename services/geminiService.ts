
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly as required by instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Basic tasks use gemini-3-flash-preview
const modelId = 'gemini-3-flash-preview';

export const getHabitSuggestions = async (goal: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Sugira 3 hábitos diários simples e acionáveis para atingir este objetivo: "${goal}". Retorne apenas os nomes dos hábitos, curtos e diretos.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    // Access .text property directly (not as a function)
    const jsonStr = response.text?.trim() || '{"suggestions": []}';
    const json = JSON.parse(jsonStr);
    return json.suggestions || [];
  } catch (error) {
    console.error("Erro ao buscar sugestões de hábitos:", error);
    return [];
  }
};

export const getBookReview = async (title: string, author: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Escreva um resumo muito breve (máximo 30 palavras) e motivador sobre o livro "${title}" de ${author}. Em Português.`,
    });
    // Access .text property directly
    return response.text || "Não foi possível gerar o resumo.";
  } catch (error) {
    console.error("Erro ao gerar review:", error);
    return "Erro ao conectar com a IA.";
  }
};

export const breakDownTask = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Quebre a tarefa "${taskTitle}" em 3 sub-tarefas menores e acionáveis. Retorne JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    // Access .text property directly
    const jsonStr = response.text?.trim() || '{"suggestions": []}';
    const json = JSON.parse(jsonStr);
    return json.suggestions || [];
  } catch (error) {
    console.error("Erro ao quebrar tarefa:", error);
    return [];
  }
};
