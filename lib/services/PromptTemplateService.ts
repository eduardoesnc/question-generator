import type { PromptVariables } from '@/lib/types';

export class PromptTemplateService {
  private template: string = '';

  constructor() {
    this.loadTemplateSync();
  }

  private loadTemplateSync(): void {
    this.template = `Aja como um especialista em design educacional e elaborador de itens para exames de larga escala, com profundo conhecimento da Matriz de Referência do Enem e da Base Nacional Comum Curricular (BNCC). Você é um mestre em taxonomia de Bloom e na criação de questões que avaliam habilidades cognitivas complexas, não apenas memorização. Sua missão principal é gerar UMA questão inédita, original e pedagogicamente robusta, seguindo rigorosamente todas as especificidades, regras e formatos definidos abaixo. A questão deve ser desafiadora, justa e livre de qualquer tipo de viés.

**CONTEXTO PEDAGÓGICO E ALUNO-ALVO**
- Nível de Ensino: [ANO_ESCOLAR] ano, ensino fundamental
- Perfil do Aluno: [PERFIL_DO_ALUNO]
- Disciplina: [DISCIPLINA]
- Tópico Principal: [TOPICO_PRINCIPAL]
- Assunto Específico: [ASSUNTO_ESPECIFICO]

**ESPECIFICAÇÕES DA QUESTÃO**
- Tipo de Questão: [TIPO_DE_QUESTAO]
- Nível de Dificuldade (Taxonomia de Bloom): [NIVEL_DIFICULDADE_BLOOM]
- Habilidade da Matriz de Referência:
  - Código: [CODIGO_HABILIDADE_ENEM]
  - Descrição: [DESCRICAO_HABILIDADE_ENEM]
- Texto Base: A questão DEVE ser precedida por um texto de apoio.
  - Tipo de Texto Base: [TIPO_TEXTO_BASE]
  - O texto deve ser conciso, relevante para o assunto específico e servir como ponto de partida para o raciocínio do aluno, não entregando a resposta diretamente.
- Comando da Questão: O enunciado deve ser claro, direto e conectar o texto base com a habilidade a ser avaliada. Deve instruir o aluno a realizar uma ação cognitiva específica.

**REGRAS PARA AS ALTERNATIVAS**
- Alternativa Correta: Deve haver UMA e APENAS UMA alternativa que responda corretamente ao comando da questão e seja 100% suportada pelos fatos e pela análise do texto base.
- Alternativas Incorretas (Distratores): Os distratores devem ser plausíveis, mas conceitualmente incorretos:
  - Distrator 1: Uma interpretação equivocada ou superficial do texto base.
  - Distrator 2: Uma afirmação que é verdadeira para outro período ou contexto, mas incorreta para o assunto específico da questão.
  - Distrator 3: Uma generalização indevida ou uma simplificação exagerada do tema.
  - Distrator 4: Uma afirmação que inverte a relação de causa e consequência ou confunde conceitos relacionados.
- Linguagem: Evite o uso de "NÃO", "EXCETO", "INCORRETA" no comando da questão. Todas as alternativas devem ter um comprimento e complexidade estrutural semelhantes.

**FORMATO DE SAÍDA (JSON)**
Sua resposta final deve ser APENAS um bloco de código JSON válido, sem nenhum texto ou explicação adicional antes ou depois:
\`\`\`json
{
  "disciplina": "[DISCIPLINA]",
  "topico": "[TOPICO_PRINCIPAL]",
  "assunto_especifico": "[ASSUNTO_ESPECIFICO]",
  "habilidade_avaliada": "[CODIGO_HABILIDADE_ENEM]",
  "nivel_dificuldade": "[NIVEL_DIFICULDADE_BLOOM]",
  "texto_base": "",
  "enunciado": "",
  "alternativas": [
    { "letra": "A", "texto": "" },
    { "letra": "B", "texto": "" },
    { "letra": "C", "texto": "" },
    { "letra": "D", "texto": "" },
    { "letra": "E", "texto": "" }
  ],
  "alternativa_correta": "",
  "justificativa_pedagogica": {
    "justificativa_correta": "",
    "justificativa_distrator_A": "",
    "justificativa_distrator_B": "",
    "justificativa_distrator_C": "",
    "justificativa_distrator_D": "",
    "justificativa_distrator_E": ""
  }
}
\`\`\``;
  }

  validateVariables(variables: Partial<PromptVariables>): {
    isValid: boolean;
    missingVariables: string[];
  } {
    const requiredVariables: (keyof PromptVariables)[] = [
      'ANO_ESCOLAR',
      'PERFIL_DO_ALUNO',
      'DISCIPLINA',
      'TOPICO_PRINCIPAL',
      'ASSUNTO_ESPECIFICO',
      'CODIGO_HABILIDADE_ENEM',
      'DESCRICAO_HABILIDADE_ENEM',
      'TIPO_DE_QUESTAO',
      'NIVEL_DIFICULDADE_BLOOM',
      'TIPO_TEXTO_BASE',
    ];

    const missingVariables: string[] = [];

    for (const variable of requiredVariables) {
      const value = variables[variable];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingVariables.push(variable);
      }
    }

    const tipoQuestao = variables.TIPO_DE_QUESTAO?.toLowerCase() || '';
    const isMultipleChoice = tipoQuestao.includes('múltipla') || tipoQuestao.includes('multipla');
    
    if (isMultipleChoice && !variables.NUMERO_ALTERNATIVAS) {
      missingVariables.push('NUMERO_ALTERNATIVAS');
    }

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
    };
  }

  generatePrompt(variables: PromptVariables): string {
    const validation = this.validateVariables(variables);
    if (!validation.isValid) {
      throw new Error(
        `Missing required variables: ${validation.missingVariables.join(', ')}`
      );
    }

    let prompt = this.template;

    prompt = prompt.replace(/\[ANO_ESCOLAR\]/g, variables.ANO_ESCOLAR);
    prompt = prompt.replace(/\[PERFIL_DO_ALUNO\]/g, variables.PERFIL_DO_ALUNO);
    prompt = prompt.replace(/\[DISCIPLINA\]/g, variables.DISCIPLINA);
    prompt = prompt.replace(/\[TOPICO_PRINCIPAL\]/g, variables.TOPICO_PRINCIPAL);
    prompt = prompt.replace(/\[ASSUNTO_ESPECIFICO\]/g, variables.ASSUNTO_ESPECIFICO);
    prompt = prompt.replace(/\[CODIGO_HABILIDADE_ENEM\]/g, variables.CODIGO_HABILIDADE_ENEM);
    prompt = prompt.replace(/\[DESCRICAO_HABILIDADE_ENEM\]/g, variables.DESCRICAO_HABILIDADE_ENEM);
    prompt = prompt.replace(/\[TIPO_DE_QUESTAO\]/g, variables.TIPO_DE_QUESTAO);
    prompt = prompt.replace(/\[NIVEL_DIFICULDADE_BLOOM\]/g, variables.NIVEL_DIFICULDADE_BLOOM);
    prompt = prompt.replace(/\[TIPO_TEXTO_BASE\]/g, variables.TIPO_TEXTO_BASE);

    if (variables.NUMERO_ALTERNATIVAS !== undefined) {
      prompt = prompt.replace(
        /\[NUMERO_ALTERNATIVAS\]/g,
        variables.NUMERO_ALTERNATIVAS.toString()
      );
    } else {
      prompt = prompt.replace(/\[NUMERO_ALTERNATIVAS\]/g, '');
    }

    const unreplacedVariables = prompt.match(/\[([A-Z_]+)\]/g);
    if (unreplacedVariables && unreplacedVariables.length > 0) {
      console.warn('Warning: Some variables were not replaced:', unreplacedVariables);
    }

    return prompt;
  }

  extractHabilidadeCode(habilidade: string): string {
    const match = habilidade.match(/\(([A-Z0-9]+)\)/);
    return match ? match[1] : habilidade.substring(0, 20);
  }

  getTemplate(): string {
    return this.template;
  }
}

export const promptTemplateService = new PromptTemplateService();
