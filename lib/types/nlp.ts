/**
 * Types para NLP e extração de informações
 */

export type ExtractionMethod = 'keywords' | 'embeddings' | 'hybrid';

export interface ExtractedFields {
  disciplina?: string;
  ano?: string;
  perfilAluno?: string;
  unidadeTematica?: string;
  objetoConhecimento?: string;
  habilidade?: string;
  nivelBloom?: string;
  tipoQuestao?: string;
  tipoTextoBase?: string;
  numeroAlternativas?: string;
}

export interface ConfidenceScores {
  [key: string]: number;
}

export interface Suggestion {
  field: string;
  values: string[];
  message: string;
}

export interface NLPExtractionResult {
  extracted: ExtractedFields;
  confidence: ConfidenceScores;
  suggestions: Suggestion[];
  missing_fields: string[];
  original_text: string;
  method_used?: ExtractionMethod;
  similarity_score?: number;
  processing_time_ms?: number;
}

export interface ExtractionRequest {
  text: string;
  context?: Record<string, any>;
  method?: ExtractionMethod;
}

export interface MethodComparison {
  keywords: NLPExtractionResult | null;
  embeddings: NLPExtractionResult | null;
  hybrid: NLPExtractionResult | null;
}
