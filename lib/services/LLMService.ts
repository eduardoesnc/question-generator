const API_BASE_URL = process.env.NEXT_PUBLIC_NLP_API_URL || 'http://localhost:8000';

export interface LLMExtractedFields {
  disciplina: string;
  ano: string;
  perfilAluno: string;
  unidadeTematica: string;
  objetoConhecimento: string;
  habilidade: string;
  nivelBloom: string;
  tipoQuestao: string;
  tipoTextoBase: string;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface LLMTokenSummary {
  call_1: TokenUsage;
  call_2: TokenUsage;
  total_input: number;
  total_output: number;
  total: number;
}

export interface LLMGenerationResult {
  filled_prompt: string;
  extracted_fields: LLMExtractedFields;
  generated_question: string;
  original_text: string;
  processing_time_ms: number;
  token_usage: LLMTokenSummary | null;
}

export interface ParsedQuestion {
  disciplina: string;
  topico: string;
  assunto_especifico: string;
  habilidade_avaliada: string;
  nivel_dificuldade: string;
  texto_base: string;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  alternativa_correta: string;
  justificativa_pedagogica: Record<string, string>;
}

export function parseGeneratedQuestion(raw: string): ParsedQuestion | null {
  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```$/m, '')
      .trim();
    return JSON.parse(cleaned) as ParsedQuestion;
  } catch {
    return null;
  }
}

export async function generateWithLLM(text: string): Promise<LLMGenerationResult> {
  const response = await fetch(`${API_BASE_URL}/api/generate-llm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, method: 'embeddings' }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Erro ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<LLMGenerationResult>;
}
