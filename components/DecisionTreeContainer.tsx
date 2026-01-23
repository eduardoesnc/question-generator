'use client';

import { useReducer, useRef, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DataService } from '@/lib/services/DataService';
import { PromptTemplateService } from '@/lib/services/PromptTemplateService';
import { nlpService, type NLPExtractionResult } from '@/lib/services/NLPService';
import {
  decisionTreeReducer,
  initialState,
  type StepType,
  type StepSelection,
} from '@/lib/reducers/decisionTreeReducer';
import { ProgressIndicator } from './ProgressIndicator';
import { StepNode } from './StepNode';
import SummaryPanel from './SummaryPanel';
import { NLPInput } from './NLPInput';
import { getStepLabel, STEP_ORDER } from '@/lib/utils/stepFlow';
import {
  NIVEIS_BLOOM,
  TIPOS_QUESTAO,
  TIPOS_TEXTO_BASE,
  PERFIS_ALUNO_SUGERIDOS,
  NUMERO_ALTERNATIVAS_OPTIONS,
} from '@/lib/data/prompt-options';
import type { PromptVariables } from '@/lib/types';
import dynamic from 'next/dynamic';

const PromptDisplay = dynamic(() => import('./PromptDisplay'), {
  loading: () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-96 bg-gray-100 rounded"></div>
    </div>
  ),
  ssr: false,
});

export function DecisionTreeContainer({ method = 'keywords' }: { method?: 'keywords' | 'embeddings' | 'hybrid' }) {
  const [state, dispatch] = useReducer(decisionTreeReducer, initialState);
  const [initError, setInitError] = useState<string | null>(null);
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpResult, setNlpResult] = useState<NLPExtractionResult | null>(null);
  const [showNLPInput, setShowNLPInput] = useState(true);
  const [dataService] = useState<DataService | null>(() => {
    try {
      return new DataService();
    } catch (error) {
      console.error('Failed to initialize DataService:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro ao carregar dados da BNCC';
      setInitError(errorMsg);
      return null;
    }
  });
  const [promptService] = useState<PromptTemplateService>(
    () => new PromptTemplateService()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const getOptionsForStep = (
    step: StepType
  ): Array<{ value: string; label: string; description?: string }> => {
    if (!dataService) return [];

    switch (step) {
      case 'disciplina': {
        const disciplinas = dataService.getDisciplinas();
        return disciplinas.map((d) => ({ value: d, label: d }));
      }

      case 'ano': {
        const disciplinaSelection = state.selections.find(
          (s) => s.step === 'disciplina'
        );
        if (!disciplinaSelection) return [];
        const anos = dataService.getAnosByDisciplina(disciplinaSelection.value);
        return anos.map((a) => ({ value: a, label: a }));
      }

      case 'perfilAluno': {
        return PERFIS_ALUNO_SUGERIDOS.map((p) => ({
          value: p.value,
          label: p.label,
          description: p.description,
        }));
      }

      case 'unidadeTematica': {
        const disciplinaSelection = state.selections.find(
          (s) => s.step === 'disciplina'
        );
        const anoSelection = state.selections.find((s) => s.step === 'ano');
        if (!disciplinaSelection || !anoSelection) return [];

        const unidades = dataService.getUnidadesByDisciplinaAno(
          disciplinaSelection.value,
          anoSelection.value
        );
        return unidades.map((u) => ({ value: u, label: u }));
      }

      case 'objetoConhecimento': {
        const disciplinaSelection = state.selections.find(
          (s) => s.step === 'disciplina'
        );
        const anoSelection = state.selections.find((s) => s.step === 'ano');
        const unidadeSelection = state.selections.find(
          (s) => s.step === 'unidadeTematica'
        );
        if (!disciplinaSelection || !anoSelection || !unidadeSelection)
          return [];

        const objetos = dataService.getObjetosByUnidade(
          disciplinaSelection.value,
          anoSelection.value,
          unidadeSelection.value
        );
        return objetos.map((o) => ({ value: o, label: o }));
      }

      case 'habilidade': {
        const disciplinaSelection = state.selections.find(
          (s) => s.step === 'disciplina'
        );
        const anoSelection = state.selections.find((s) => s.step === 'ano');
        const unidadeSelection = state.selections.find(
          (s) => s.step === 'unidadeTematica'
        );
        const objetoSelection = state.selections.find(
          (s) => s.step === 'objetoConhecimento'
        );
        if (
          !disciplinaSelection ||
          !anoSelection ||
          !unidadeSelection ||
          !objetoSelection
        )
          return [];

        const habilidades = dataService.getHabilidadesByObjeto(
          disciplinaSelection.value,
          anoSelection.value,
          unidadeSelection.value,
          objetoSelection.value
        );
        return habilidades.map((h) => ({ value: h, label: h }));
      }

      case 'tipoQuestao': {
        return TIPOS_QUESTAO.map((t) => ({
          value: t.value,
          label: t.label,
        }));
      }

      case 'nivelBloom': {
        return NIVEIS_BLOOM.map((n) => ({
          value: n.value,
          label: n.label,
          description: n.description,
        }));
      }

      case 'tipoTextoBase': {
        return TIPOS_TEXTO_BASE.map((t) => ({
          value: t.value,
          label: t.label,
        }));
      }

      case 'numeroAlternativas': {
        return NUMERO_ALTERNATIVAS_OPTIONS.map((n) => ({
          value: n.toString(),
          label: `${n} alternativas`,
        }));
      }

      default:
        return [];
    }
  };

  const shouldSkipStep = useCallback((step: StepType): boolean => {
    if (step === 'numeroAlternativas') {
      const tipoQuestaoSelection = state.selections.find(
        (s) => s.step === 'tipoQuestao'
      );
      return (
        !tipoQuestaoSelection ||
        tipoQuestaoSelection.value !== 'multipla_escolha'
      );
    }
    return false;
  }, [state.selections]);

  const getStepsToRender = useMemo((): Array<{
    step: StepType;
    selection?: StepSelection;
    isActive: boolean;
    stepNumber: number;
  }> => {
    const steps: Array<{
      step: StepType;
      selection?: StepSelection;
      isActive: boolean;
      stepNumber: number;
    }> = [];

    // Adicionar todos os steps já selecionados
    state.selections.forEach((selection, index) => {
      steps.push({
        step: selection.step,
        selection,
        isActive: false,
        stepNumber: index + 1,
      });
    });

    // Encontrar o próximo step que precisa ser preenchido
    let nextStepToShow: StepType | null = null;
    
    if (state.currentStep && !state.selections.find((s) => s.step === state.currentStep)) {
      nextStepToShow = state.currentStep;
    } else {
      // Se currentStep é null ou já foi preenchido, encontrar o primeiro step não preenchido
      for (const step of STEP_ORDER) {
        const isSelected = state.selections.some((s) => s.step === step);
        const shouldSkip = shouldSkipStep(step);
        
        if (!isSelected && !shouldSkip) {
          nextStepToShow = step;
          break;
        }
      }
    }

    // Adicionar o próximo step a ser preenchido
    if (nextStepToShow && !shouldSkipStep(nextStepToShow)) {
      steps.push({
        step: nextStepToShow,
        selection: undefined,
        isActive: true,
        stepNumber: state.selections.length + 1,
      });
    }

    return steps;
  }, [state.selections, state.currentStep, shouldSkipStep]);

  const scrollToNewStep = useCallback(() => {
    if (containerRef.current) {
      const stepNodes = containerRef.current.querySelectorAll('[data-step-node]');
      const lastStepNode = stepNodes[stepNodes.length - 1];
      
      if (lastStepNode) {
        requestAnimationFrame(() => {
          lastStepNode.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        });
      }
    }
  }, []);

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }, []);

  const handleSelectOption = useCallback((step: StepType, value: string, label: string) => {
    dispatch({
      type: 'SELECT_OPTION',
      step,
      value,
      label,
    });

    const tempSelections = [...state.selections];
    const existingIndex = tempSelections.findIndex((s) => s.step === step);
    
    if (existingIndex !== -1) {
      tempSelections[existingIndex] = { step, value, label };
    } else {
      tempSelections.push({ step, value, label });
    }

    const tipoQuestaoSelection = tempSelections.find((s) => s.step === 'tipoQuestao');
    const shouldSkipNumeroAlternativas = 
      tipoQuestaoSelection && tipoQuestaoSelection.value !== 'multipla_escolha';

    const isLastStep = 
      (step === 'numeroAlternativas') || 
      (step === 'tipoTextoBase' && shouldSkipNumeroAlternativas);

    setTimeout(() => {
      if (isLastStep) {
        scrollToTop();
      } else {
        scrollToNewStep();
      }
    }, 100);
  }, [dispatch, scrollToNewStep, scrollToTop, state.selections]);

  const handleGoBackToStep = useCallback((step: StepType) => {
    dispatch({
      type: 'GO_BACK_TO_STEP',
      step,
    });

    setTimeout(() => {
      scrollToNewStep();
    }, 100);
  }, [dispatch, scrollToNewStep]);

  const handleReset = useCallback(() => {
    const confirmed = window.confirm(
      '🔄 Recomeçar do início?\n\nTodas as suas seleções serão perdidas e você voltará à primeira etapa.\n\nDeseja continuar?'
    );

    if (confirmed) {
      dispatch({ type: 'RESET' });
      setNlpResult(null);
      setShowNLPInput(true);
      
      setTimeout(() => {
        scrollToTop();
      }, 100);
    }
  }, [dispatch, scrollToTop]);

  const handleNLPExtract = useCallback(async (data: NLPExtractionResult) => {
    setNlpLoading(true);
    setNlpResult(data);

    try {
      // Auto-preencher campos com confiança >= 0.5
      const { extracted, confidence } = data;
      const CONFIDENCE_THRESHOLD = 0.5;

      // Coletar todas as seleções que serão feitas
      const selectionsToMake: Array<{ step: StepType; value: string; label: string }> = [];

      // Mapear TODOS os campos extraídos para seleções (na ordem correta do STEP_ORDER)
      const fieldMapping: Array<{ field: keyof typeof extracted; step: StepType }> = [
        { field: 'disciplina', step: 'disciplina' },
        { field: 'ano', step: 'ano' },
        { field: 'perfilAluno', step: 'perfilAluno' },
        { field: 'unidadeTematica', step: 'unidadeTematica' },
        { field: 'objetoConhecimento', step: 'objetoConhecimento' },
        { field: 'habilidade', step: 'habilidade' },
        { field: 'nivelBloom', step: 'nivelBloom' },
        { field: 'tipoQuestao', step: 'tipoQuestao' },
        { field: 'tipoTextoBase', step: 'tipoTextoBase' },
      ];

      // Coletar todas as seleções válidas
      fieldMapping.forEach(({ field, step }) => {
        const value = extracted[field];
        const conf = confidence[field];
        
        if (value && conf && conf >= CONFIDENCE_THRESHOLD) {
          console.log(`✅ Adicionando ${field}: "${value}" (confiança: ${conf.toFixed(2)})`);
          selectionsToMake.push({ step, value, label: value });
        } else {
          console.log(`⏭️  Pulando ${field}: ${!value ? 'sem valor' : `confiança baixa (${conf?.toFixed(2)})`}`);
        }
      });

      // Aplicar TODAS as seleções de uma vez usando batch action
      if (selectionsToMake.length > 0) {
        console.log(`\n📦 Aplicando ${selectionsToMake.length} seleções em batch...`);
        dispatch({
          type: 'BATCH_SELECT_OPTIONS',
          selections: selectionsToMake,
        });
      }

      setShowNLPInput(false);
      setTimeout(() => scrollToNewStep(), 200);
    } catch (error) {
      console.error('Error processing NLP result:', error);
    } finally {
      setNlpLoading(false);
    }
  }, [dispatch, scrollToNewStep]);

  const areAllSelectionsComplete = useMemo((): boolean => {
    const requiredSteps: StepType[] = [
      'disciplina',
      'ano',
      'perfilAluno',
      'unidadeTematica',
      'objetoConhecimento',
      'habilidade',
      'tipoQuestao',
      'nivelBloom',
      'tipoTextoBase',
    ];

    const tipoQuestaoSelection = state.selections.find(
      (s) => s.step === 'tipoQuestao'
    );
    if (tipoQuestaoSelection?.value === 'multipla_escolha') {
      requiredSteps.push('numeroAlternativas');
    }

    return requiredSteps.every((step) =>
      state.selections.some((s) => s.step === step)
    );
  }, [state.selections]);

  const mapSelectionsToPromptVariables = useMemo((): PromptVariables | null => {
    try {
      const selectionMap = new Map<StepType, StepSelection>();
      state.selections.forEach((selection) => {
        selectionMap.set(selection.step, selection);
      });

      const disciplina = selectionMap.get('disciplina')?.label || '';
      const anoRaw = selectionMap.get('ano')?.label || '';
      const perfilAluno = selectionMap.get('perfilAluno')?.label || '';
      const unidadeTematica = selectionMap.get('unidadeTematica')?.label || '';
      const objetoConhecimento = selectionMap.get('objetoConhecimento')?.label || '';
      const habilidade = selectionMap.get('habilidade')?.label || '';
      const tipoQuestao = selectionMap.get('tipoQuestao')?.label || '';
      const nivelBloom = selectionMap.get('nivelBloom')?.label || '';
      const tipoTextoBase = selectionMap.get('tipoTextoBase')?.label || '';
      const numeroAlternativas = selectionMap.get('numeroAlternativas')?.value;

      let anoFormatted = anoRaw;
      if (anoRaw) {
        const match = anoRaw.match(/(\d+)º?/);
        if (match) {
          const numero = match[1];
          anoFormatted = `Ensino Fundamental, ${numero}º ano`;
        }
      }

      const habilidadeCode = promptService.extractHabilidadeCode(habilidade);

      const variables: PromptVariables = {
        ANO_ESCOLAR: anoFormatted,
        PERFIL_DO_ALUNO: perfilAluno,
        DISCIPLINA: disciplina,
        TOPICO_PRINCIPAL: unidadeTematica,
        ASSUNTO_ESPECIFICO: objetoConhecimento,
        CODIGO_HABILIDADE_ENEM: habilidadeCode,
        DESCRICAO_HABILIDADE_ENEM: habilidade,
        TIPO_DE_QUESTAO: tipoQuestao,
        NIVEL_DIFICULDADE_BLOOM: nivelBloom,
        TIPO_TEXTO_BASE: tipoTextoBase,
      };

      if (numeroAlternativas) {
        variables.NUMERO_ALTERNATIVAS = parseInt(numeroAlternativas, 10);
      }

      return variables;
    } catch (error) {
      console.error('Error mapping selections to prompt variables:', error);
      return null;
    }
  }, [state.selections, promptService]);

  const handleGeneratePrompt = useCallback(() => {
    try {
      const variables = mapSelectionsToPromptVariables;
      if (!variables) {
        alert('❌ Não foi possível preparar o prompt.\n\nPor favor, verifique se todas as etapas foram concluídas e tente novamente.');
        return;
      }

      const prompt = promptService.generatePrompt(variables);
      dispatch({ type: 'GENERATE_PROMPT', prompt });

      setTimeout(() => {
        scrollToNewStep();
      }, 100);
    } catch (error) {
      console.error('Error generating prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`❌ Erro ao gerar o prompt.\n\n${errorMessage}\n\nVerifique se todas as seleções foram feitas corretamente e tente novamente.`);
    }
  }, [mapSelectionsToPromptVariables, promptService, dispatch, scrollToNewStep]);

  const handleCopySuccess = useCallback(() => {
    console.log('Prompt copied successfully');
  }, []);

  const handleEditFromSummary = useCallback((step: StepType) => {
    handleGoBackToStep(step);
  }, [handleGoBackToStep]);

  const totalSteps = STEP_ORDER.length;
  const completedSteps = state.selections.length;
  const currentStepIndex = useMemo(() => 
    state.currentStep ? STEP_ORDER.indexOf(state.currentStep) + 1 : 1,
    [state.currentStep]
  );

  const showSummary = useMemo(() => 
    areAllSelectionsComplete && !state.generatedPrompt,
    [areAllSelectionsComplete, state.generatedPrompt]
  );
  const showPrompt = state.generatedPrompt !== null;

  if (initError || !dataService) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            ❌ Erro ao Carregar Dados
          </h2>
          <p className="text-red-700 mb-4">
            {initError || 'Erro ao carregar dados da BNCC'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F9FAFB]">
      {!showPrompt && (
        <ProgressIndicator
          totalSteps={totalSteps}
          currentStep={currentStepIndex}
          completedSteps={completedSteps}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        {showNLPInput && state.selections.length === 0 && !showPrompt && (
          <NLPInput onExtract={handleNLPExtract} isLoading={nlpLoading} method={method} />
        )}

        {nlpResult && !showPrompt && state.selections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-sm text-green-800">
              <strong>✅ IA processou seu texto!</strong> Campos preenchidos automaticamente. Continue selecionando os campos restantes abaixo.
            </p>
            {nlpResult.missing_fields.length > 0 && (
              <p className="text-xs text-green-700 mt-2">
                Campos que precisam de atenção: {nlpResult.missing_fields.join(', ')}
              </p>
            )}
          </motion.div>
        )}

        {state.selections.length > 0 && !showPrompt && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleReset}
              type="button"
              aria-label="Recomeçar o processo de seleção"
              className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] bg-white border border-[#E5E7EB] rounded-lg hover:border-[#3B82F6] transition-colors"
            >
              Recomeçar
            </button>
          </div>
        )}

        {showPrompt && state.generatedPrompt && (
          <div className="space-y-6">
            <PromptDisplay
              prompt={state.generatedPrompt}
              onCopy={handleCopySuccess}
              onReset={handleReset}
            />
          </div>
        )}

        {showSummary && !showPrompt && (
          <div className="space-y-6 mb-6">
            <SummaryPanel
              selections={state.selections}
              onEdit={handleEditFromSummary}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4, ease: 'easeOut' }}
              className="flex justify-center"
            >
              <motion.button
                onClick={handleGeneratePrompt}
                type="button"
                aria-label="Gerar prompt com base nas seleções"
                title="Clique para gerar o prompt final com todas as suas seleções"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#3B82F6] text-white text-lg font-semibold rounded-lg hover:bg-[#2563EB] transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2"
              >
                ✨ Gerar Prompt
              </motion.button>
            </motion.div>
          </div>
        )}

        {!showPrompt && !showSummary && getStepsToRender.map((stepInfo) => {
          const options = getOptionsForStep(stepInfo.step);
          
          return (
            <div
              key={`${stepInfo.step}-${stepInfo.stepNumber}`}
              data-step-node
            >
              <StepNode
                step={stepInfo.step}
                label={getStepLabel(stepInfo.step)}
                options={options}
                selectedValue={stepInfo.selection?.value}
                onSelect={(value) => {
                  const selectedOption = options.find((opt) => opt.value === value);
                  handleSelectOption(
                    stepInfo.step,
                    value,
                    selectedOption?.label || value
                  );
                }}
                onGoBack={() => handleGoBackToStep(stepInfo.step)}
                isActive={stepInfo.isActive}
                isCompleted={!!stepInfo.selection}
                stepNumber={stepInfo.stepNumber}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
