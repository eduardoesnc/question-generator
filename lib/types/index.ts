/**
 * Type definitions for the Question Generator Decision Tree
 */

// ============================================================================
// Data Types (BNCC Hierarchy)
// ============================================================================

/**
 * Raw BNCC data entry from CSV
 */
export interface BNCCData {
  disciplina: string;
  ano: string;
  unidadeTematica: string;
  objetoConhecimento: string;
  habilidade: string;
}

/**
 * Hierarchical structure of BNCC data
 * Structure: Disciplina → Ano → Unidade Temática → Objeto do Conhecimento → Habilidade[]
 */
export interface DataHierarchy {
  [disciplina: string]: {
    [ano: string]: {
      [unidadeTematica: string]: {
        [objetoConhecimento: string]: string[]; // Array of habilidades
      };
    };
  };
}

// ============================================================================
// Decision Tree Types
// ============================================================================

/**
 * All possible steps in the decision tree
 */
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

/**
 * A single selection made by the user in the decision tree
 */
export interface StepSelection {
  step: StepType;
  value: string;
  label: string;
}

/**
 * Complete state of the decision tree
 */
export interface DecisionTreeState {
  selections: StepSelection[];
  currentStep: StepType | null;
  availableOptions: string[];
  isComplete: boolean;
  generatedPrompt: string | null;
}

/**
 * Actions for the decision tree reducer
 */
export type DecisionTreeAction =
  | { type: 'SELECT_OPTION'; step: StepType; value: string; label: string }
  | { type: 'GO_BACK_TO_STEP'; step: StepType }
  | { type: 'RESET' }
  | { type: 'GENERATE_PROMPT'; prompt: string }
  | { type: 'SET_AVAILABLE_OPTIONS'; options: string[] };

// ============================================================================
// Prompt Template Types
// ============================================================================

/**
 * Variables required for prompt generation
 * These map to the placeholders in the prompt template
 */
export interface PromptVariables {
  // Contexto Pedagógico
  ANO_ESCOLAR: string;
  PERFIL_DO_ALUNO: string;
  DISCIPLINA: string;

  // Conteúdo da Questão
  TOPICO_PRINCIPAL: string; // Unidade Temática
  ASSUNTO_ESPECIFICO: string; // Objeto do Conhecimento
  CODIGO_HABILIDADE_ENEM: string; // Extracted from habilidade
  DESCRICAO_HABILIDADE_ENEM: string; // Full habilidade text

  // Estrutura da Questão
  TIPO_DE_QUESTAO: string;
  NIVEL_DIFICULDADE_BLOOM: string;
  TIPO_TEXTO_BASE: string;
  NUMERO_ALTERNATIVAS?: number; // Optional, only for multiple choice
}

// ============================================================================
// Prompt Options Types
// ============================================================================

/**
 * Option for Bloom's Taxonomy levels
 */
export interface NivelBloomOption {
  value: string;
  label: string;
  description: string;
}

/**
 * Option for question types
 */
export interface TipoQuestaoOption {
  value: string;
  label: string;
  requiresAlternativas: boolean;
  defaultAlternativas?: number;
}

/**
 * Option for base text types
 */
export interface TipoTextoBaseOption {
  value: string;
  label: string;
}

/**
 * Option for student profiles
 */
export interface PerfilAlunoOption {
  value: string;
  label: string;
  description: string;
  requiresCustomInput?: boolean;
}

// ============================================================================
// UI Component Props Types
// ============================================================================

/**
 * Props for OptionButton component
 */
export interface OptionButtonProps {
  value: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Props for StepNode component
 */
export interface StepNodeProps {
  step: StepType;
  label: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  isActive: boolean;
  isCompleted: boolean;
}

/**
 * Props for ProgressIndicator component
 */
export interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number;
}

/**
 * Props for CustomInputField component
 */
export interface CustomInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

/**
 * Props for SummaryPanel component
 */
export interface SummaryPanelProps {
  selections: StepSelection[];
  onEdit: (step: StepType) => void;
}

/**
 * Props for PromptDisplay component
 */
export interface PromptDisplayProps {
  prompt: string;
  onCopy: () => void;
  onReset: () => void;
}

/**
 * Props for DecisionTreeContainer component
 */
export interface DecisionTreeContainerProps {
  // No props needed for now, but defined for future extensibility
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper type to get selection value by step type
 */
export type SelectionsByStep = Partial<Record<StepType, string>>;

/**
 * Step metadata for UI rendering
 */
export interface StepMetadata {
  step: StepType;
  label: string;
  description?: string;
  category: 'pedagogico' | 'conteudo' | 'estrutura';
}
