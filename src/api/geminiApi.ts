import axiosInstance from './axios';

export type GeminiGenerateRequest = {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export type GeminiGenerateResponse = {
  text: string;
  model: string;
  rawResponse?: string;
};

export const geminiApi = {
  generate: async (payload: GeminiGenerateRequest): Promise<GeminiGenerateResponse> => {
    const response = await axiosInstance.post<GeminiGenerateResponse>('/api/gemini/generate', payload);
    return response.data;
  },
};

export default geminiApi;
