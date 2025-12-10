import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper model selection based on complexity
const modelId = 'gemini-2.5-flash';

export const getHabitSuggestions = async (goal: string): Promise<string[]> => {
  if (!apiKey) return ["Configure sua API Key para receber sugestões."];

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

    const json = JSON.parse(response.text || '{"suggestions": []}');
    return json.suggestions;
  } catch (error) {
    console.error("Erro ao buscar sugestões de hábitos:", error);
    return [];
  }
};

export const getBookReview = async (title: string, author: string): Promise<string> => {
  if (!apiKey) return "Configure sua API Key para gerar resumos.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Escreva um resumo muito breve (máximo 30 palavras) e motivador sobre o livro "${title}" de ${author}. Em Português.`,
    });
    return response.text || "Não foi possível gerar o resumo.";
  } catch (error) {
    console.error("Erro ao gerar review:", error);
    return "Erro ao conectar com a IA.";
  }
};

export const breakDownTask = async (taskTitle: string): Promise<string[]> => {
  if (!apiKey) return [];

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
    const json = JSON.parse(response.text || '{"suggestions": []}');
    return json.suggestions;
  } catch (error) {
    return [];
  }
};
