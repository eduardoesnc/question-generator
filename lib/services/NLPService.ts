/**
 * Service for interacting with the Python NLP API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_NLP_API_URL || 'http://localhost:8000';

export interface NLPExtractionResult {
  extracted: {
    disciplina?: string;
    ano?: string;
    perfilAluno?: string;
    unidadeTematica?: string;
    objetoConhecimento?: string;
    habilidade?: string;
    nivelBloom?: string;
    tipoQuestao?: string;
    tipoTextoBase?: string;
  };
  confidence: {
    [key: string]: number;
  };
  suggestions: Array<{
    field: string;
    values: string[];
    message: string;
  }>;
  missing_fields: string[];
  original_text: string;
}

export class NLPService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if the NLP API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('NLP API health check failed:', error);
      return false;
    }
  }

  /**
   * Extract educational information from free text
   */
  async extractInformation(
    text: string,
    context?: Record<string, any>
  ): Promise<NLPExtractionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, context }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `API error: ${response.status} ${response.statusText}`
        );
      }

      const data: NLPExtractionResult = await response.json();
      return data;
    } catch (error) {
      console.error('Error extracting information:', error);
      throw error;
    }
  }

  /**
   * Map NLP extracted values to frontend format
   */
  mapToFrontendFormat(extracted: NLPExtractionResult['extracted']): Record<string, string> {
    const mapped: Record<string, string> = {};

    // Map disciplina directly
    if (extracted.disciplina) {
      mapped.disciplina = extracted.disciplina;
    }

    // Map ano directly
    if (extracted.ano) {
      mapped.ano = extracted.ano;
    }

    // Map nivelBloom
    if (extracted.nivelBloom) {
      mapped.nivelBloom = extracted.nivelBloom;
    }

    // Map tipoQuestao
    if (extracted.tipoQuestao) {
      mapped.tipoQuestao = extracted.tipoQuestao;
    }

    // Map tipoTextoBase
    if (extracted.tipoTextoBase) {
      mapped.tipoTextoBase = extracted.tipoTextoBase;
    }

    // Map perfilAluno
    if (extracted.perfilAluno) {
      mapped.perfilAluno = extracted.perfilAluno;
    }

    return mapped;
  }
}

export const nlpService = new NLPService();
