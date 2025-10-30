import type {
  NivelBloomOption,
  TipoQuestaoOption,
  TipoTextoBaseOption,
  PerfilAlunoOption,
} from '@/lib/types';

export const NIVEIS_BLOOM: NivelBloomOption[] = [
  {
    value: 'conhecimento',
    label: 'Conhecimento',
    description: 'Recordar informações e conceitos básicos',
  },
  {
    value: 'compreensao',
    label: 'Compreensão',
    description: 'Entender o significado e interpretar informações',
  },
  {
    value: 'aplicacao',
    label: 'Aplicação',
    description: 'Usar conhecimento em novas situações',
  },
  {
    value: 'analise',
    label: 'Análise',
    description: 'Decompor informações em partes e explorar relações',
  },
  {
    value: 'sintese',
    label: 'Síntese',
    description: 'Criar algo novo combinando elementos',
  },
  {
    value: 'avaliacao',
    label: 'Avaliação',
    description: 'Julgar o valor de ideias ou materiais',
  },
];

export const TIPOS_QUESTAO: TipoQuestaoOption[] = [
  {
    value: 'multipla_escolha',
    label: 'Múltipla Escolha',
    requiresAlternativas: true,
    defaultAlternativas: 5,
  },
  {
    value: 'dissertativa_curta',
    label: 'Dissertativa Curta',
    requiresAlternativas: false,
  },
  {
    value: 'dissertativa_longa',
    label: 'Dissertativa Longa',
    requiresAlternativas: false,
  },
  {
    value: 'verdadeiro_falso',
    label: 'Verdadeiro ou Falso',
    requiresAlternativas: false,
  },
  {
    value: 'associacao',
    label: 'Associação/Correspondência',
    requiresAlternativas: false,
  },
];

export const TIPOS_TEXTO_BASE: TipoTextoBaseOption[] = [
  {
    value: 'documento_historico',
    label: 'Trecho de documento histórico',
  },
  {
    value: 'texto_literario',
    label: 'Fragmento de texto literário',
  },
  {
    value: 'artigo_jornal',
    label: 'Artigo de jornal/notícia',
  },
  {
    value: 'charge',
    label: 'Charge/Cartum',
  },
  {
    value: 'grafico_barras',
    label: 'Gráfico de barras',
  },
  {
    value: 'grafico_linhas',
    label: 'Gráfico de linhas',
  },
  {
    value: 'tabela',
    label: 'Tabela de dados',
  },
  {
    value: 'imagem',
    label: 'Imagem/Fotografia',
  },
  {
    value: 'mapa',
    label: 'Mapa',
  },
  {
    value: 'infografico',
    label: 'Infográfico',
  },
  {
    value: 'poema',
    label: 'Poema/Letra de música',
  },
];

export const PERFIS_ALUNO_SUGERIDOS: PerfilAlunoOption[] = [
  {
    value: 'bom_dominio',
    label: 'Bom domínio de leitura',
    description: 'Alunos com bom domínio de leitura e interpretação de textos',
  },
  {
    value: 'dificuldade_conexao',
    label: 'Dificuldade em conectar conceitos',
    description:
      'Alunos com conhecimento básico, mas dificuldade em conectar conceitos',
  },
  {
    value: 'conhecimento_basico',
    label: 'Conhecimento básico',
    description:
      'Alunos com conhecimento básico do assunto',
  },
  {
    value: 'conhecimento_avancado',
    label: 'Conhecimento avançado',
    description: 'Alunos com conhecimento avançado',
  },
  {
    value: 'personalizado',
    label: 'Personalizado',
    description: 'Descrever perfil específico do aluno',
    requiresCustomInput: true,
  },
];

export const NUMERO_ALTERNATIVAS_OPTIONS: number[] = [3, 4, 5, 6];

export function getTipoQuestaoByValue(
  value: string
): TipoQuestaoOption | undefined {
  return TIPOS_QUESTAO.find((tipo) => tipo.value === value);
}

export function requiresNumeroAlternativas(tipoQuestao: string): boolean {
  const tipo = getTipoQuestaoByValue(tipoQuestao);
  return tipo?.requiresAlternativas ?? false;
}

export function getDefaultNumeroAlternativas(
  tipoQuestao: string
): number | undefined {
  const tipo = getTipoQuestaoByValue(tipoQuestao);
  return tipo?.defaultAlternativas;
}

export function getPerfilAlunoByValue(
  value: string
): PerfilAlunoOption | undefined {
  return PERFIS_ALUNO_SUGERIDOS.find((perfil) => perfil.value === value);
}

export function requiresCustomPerfilInput(perfilAluno: string): boolean {
  const perfil = getPerfilAlunoByValue(perfilAluno);
  return perfil?.requiresCustomInput ?? false;
}

export function getNivelBloomByValue(
  value: string
): NivelBloomOption | undefined {
  return NIVEIS_BLOOM.find((nivel) => nivel.value === value);
}

export function getTipoTextoBaseByValue(
  value: string
): TipoTextoBaseOption | undefined {
  return TIPOS_TEXTO_BASE.find((tipo) => tipo.value === value);
}
