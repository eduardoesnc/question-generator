import { getNextStep } from '../utils/stepFlow';

export type StepType = 
  | 'disciplina'
  | 'ano'
  | 'unidadeTematica'
  | 'objetoConhecimento'
  | 'habilidade'
  | 'nivelBloom'
  | 'tipoQuestao'
  | 'tipoTextoBase'
  | 'numeroAlternativas'
  | 'perfilAluno';

export interface StepSelection {
  step: StepType;
  value: string;
  label: string;
}

export interface DecisionTreeState {
  selections: StepSelection[];
  currentStep: StepType | null;
  availableOptions: string[];
  isComplete: boolean;
  generatedPrompt: string | null;
}

export type DecisionTreeAction =
  | { type: 'SELECT_OPTION'; step: StepType; value: string; label: string }
  | { type: 'BATCH_SELECT_OPTIONS'; selections: Array<{ step: StepType; value: string; label: string }> }
  | { type: 'GO_BACK_TO_STEP'; step: StepType }
  | { type: 'RESET' }
  | { type: 'GENERATE_PROMPT'; prompt: string }
  | { type: 'SET_AVAILABLE_OPTIONS'; options: string[] };

export const initialState: DecisionTreeState = {
  selections: [],
  currentStep: 'disciplina',
  availableOptions: [],
  isComplete: false,
  generatedPrompt: null,
};

export function decisionTreeReducer(
  state: DecisionTreeState,
  action: DecisionTreeAction
): DecisionTreeState {
  switch (action.type) {
    case 'SELECT_OPTION': {
      const newSelection: StepSelection = {
        step: action.step,
        value: action.value,
        label: action.label,
      };

      const existingIndex = state.selections.findIndex(
        (s) => s.step === action.step
      );

      let newSelections: StepSelection[];
      if (existingIndex !== -1) {
        newSelections = [
          ...state.selections.slice(0, existingIndex),
          newSelection,
        ];
      } else {
        newSelections = [...state.selections, newSelection];
      }

      const nextStep = getNextStep(action.step, newSelections);

      return {
        ...state,
        selections: newSelections,
        currentStep: nextStep,
        generatedPrompt: null,
      };
    }

    case 'BATCH_SELECT_OPTIONS': {
      // Aplicar todas as seleções de uma vez (para NLP)
      const newSelections: StepSelection[] = [...state.selections];
      
      action.selections.forEach(({ step, value, label }) => {
        const existingIndex = newSelections.findIndex((s) => s.step === step);
        const newSelection: StepSelection = { step, value, label };
        
        if (existingIndex !== -1) {
          newSelections[existingIndex] = newSelection;
        } else {
          newSelections.push(newSelection);
        }
      });

      // Encontrar o próximo step não preenchido
      const lastSelection = action.selections[action.selections.length - 1];
      const nextStep = lastSelection ? getNextStep(lastSelection.step, newSelections) : state.currentStep;

      return {
        ...state,
        selections: newSelections,
        currentStep: nextStep,
        generatedPrompt: null,
      };
    }

    case 'GO_BACK_TO_STEP': {
      const targetIndex = state.selections.findIndex(
        (s) => s.step === action.step
      );

      if (targetIndex === -1) {
        return state;
      }

      const newSelections = state.selections.slice(0, targetIndex);

      return {
        ...state,
        selections: newSelections,
        currentStep: action.step,
        isComplete: false,
        generatedPrompt: null,
      };
    }

    case 'RESET': {
      return {
        ...initialState,
      };
    }

    case 'SET_AVAILABLE_OPTIONS': {
      return {
        ...state,
        availableOptions: action.options,
      };
    }

    case 'GENERATE_PROMPT': {
      return {
        ...state,
        generatedPrompt: action.prompt,
        isComplete: true,
      };
    }

    default:
      return state;
  }
}
