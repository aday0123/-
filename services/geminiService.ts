import { GoogleGenAI, Type } from "@google/genai";
import { Quiz1Question, Quiz2Question, ImageStyle } from '../types';

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export async function generateDefinitionQuiz(words: string[], apiKey: string): Promise<Quiz1Question[]> {
  if (!apiKey) throw new Error("API Key is required.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `為以下每個中文詞彙生成一個正確的解釋和三個看起來合理但錯誤的干擾選項。詞彙列表：${words.join('、')}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quizzes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                correctDefinition: { type: Type.STRING },
                distractors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['word', 'correctDefinition', 'distractors']
            },
          },
        },
        required: ['quizzes']
      },
    },
  });

  const jsonResponse = JSON.parse(response.text);

  if (!jsonResponse.quizzes || !Array.isArray(jsonResponse.quizzes)) {
    throw new Error("無效的 API 回應格式");
  }

  return jsonResponse.quizzes.map((quiz: any) => ({
    word: quiz.word,
    correctDefinition: quiz.correctDefinition,
    options: shuffleArray([quiz.correctDefinition, ...quiz.distractors]),
  }));
}


export async function generateSentenceQuiz(words: string[], apiKey: string): Promise<Quiz2Question[]> {
  if (!apiKey) throw new Error("API Key is required.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `對於以下每個中文詞彙，請生成一個具體、簡單、生活化的例句，適合語言能力較弱的學生。例句要包含'____'，讓該詞彙可以填入其中。例句後面必須跟著一個用小括號括起來的提示，這個提示要用「意思是：」開頭，並用完整的句子解釋整個句子的意思，以幫助學生理解。詞彙列表：${words.join('、')}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sentences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                sentenceWithHint: { type: Type.STRING },
              },
              required: ['word', 'sentenceWithHint']
            },
          },
        },
        required: ['sentences']
      },
    },
  });

  const jsonResponse = JSON.parse(response.text);

  if (!jsonResponse.sentences || !Array.isArray(jsonResponse.sentences)) {
    throw new Error("無效的 API 回應格式");
  }

  return jsonResponse.sentences.map((item: any) => {
    const distractors = words.filter(w => w !== item.word);
    const options = shuffleArray([item.word, ...shuffleArray(distractors).slice(0, 3)]);
    return {
      word: item.word,
      sentence: item.sentenceWithHint,
      options: options,
    };
  });
}

export async function generateImageForPrompt(prompt: string, style: ImageStyle, apiKey: string): Promise<string> {
    if (!apiKey) throw new Error("API Key is required.");
    const ai = new GoogleGenAI({ apiKey });

    const enhancedPrompt = `一個簡潔、清晰的圖像，主題是 '${prompt}'，風格為'${style}'，適合兒童學習。`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("無法生成圖片");
    }

    return response.generatedImages[0].image.imageBytes;
}