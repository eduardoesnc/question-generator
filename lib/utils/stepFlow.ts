import { StepType, StepSelection } from '../reducers/decisionTreeReducer';

export const STEP_ORDER: StepType[] = [
  'disciplina',
  'ano',
  'perfilAluno',
  'unidadeTematica',
  'objetoConhecimento',
  'habilidade',
  'tipoQuestao',
  'nivelBloom',
  'tipoTextoBase',
  'numeroAlternativas',
];

export function getNextStep(
  currentStep: StepType,
  selections: StepSelection[]
): StepType | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  
  if (currentIndex === -1) {
    return null;
  }

  let nextIndex = currentIndex + 1;

  if (nextIndex >= STEP_ORDER.length) {
    return null;
  }

  let nextStep = STEP_ORDER[nextIndex];

  if (nextStep === 'numeroAlternativas') {
    const tipoQuestaoSelection = selections.find(
      (s) => s.step === 'tipoQuestao'
    );
    
    if (
      !tipoQuestaoSelection ||
      tipoQuestaoSelection.value !== 'multipla_escolha'
    ) {
      nextIndex++;
      if (nextIndex >= STEP_ORDER.length) {
        return null;
      }
      nextStep = STEP_ORDER[nextIndex];
    }
  }

  return nextStep;
}

export function getPreviousStep(currentStep: StepType): StepType | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  return STEP_ORDER[currentIndex - 1];
}

export function isFlowComplete(selections: StepSelection[]): boolean {
  const requiredSteps = STEP_ORDER.filter((step) => {
    if (step === 'numeroAlternativas') {
      const tipoQuestaoSelection = selections.find(
        (s) => s.step === 'tipoQuestao'
      );
      return (
        tipoQuestaoSelection &&
        tipoQuestaoSelection.value === 'multipla_escolha'
      );
    }
    return true;
  });

  return requiredSteps.every((step) =>
    selections.some((selection) => selection.step === step)
  );
}

export function getStepLabel(step: StepType): string {
  const labels: Record<StepType, string> = {
    disciplina: 'Disciplina',
    ano: 'Ano Escolar',
    perfilAluno: 'Perfil do Aluno',
    unidadeTematica: 'Unidade Temática',
    objetoConhecimento: 'Objeto do Conhecimento',
    habilidade: 'Habilidade',
    tipoQuestao: 'Tipo de Questão',
    nivelBloom: 'Nível de Dificuldade (Bloom)',
    tipoTextoBase: 'Tipo de Texto Base',
    numeroAlternativas: 'Número de Alternativas',
  };

  return labels[step] || step;
}

export function getStepCategory(step: StepType): string {
  if (['disciplina', 'ano', 'perfilAluno'].includes(step)) {
    return 'Contexto Pedagógico';
  }
  
  if (['unidadeTematica', 'objetoConhecimento', 'habilidade'].includes(step)) {
    return 'Conteúdo';
  }
  
  if (['tipoQuestao', 'nivelBloom', 'tipoTextoBase', 'numeroAlternativas'].includes(step)) {
    return 'Estrutura';
  }
  
  return 'Outros';
}
