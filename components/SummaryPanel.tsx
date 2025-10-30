'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { StepSelection, StepType } from '@/lib/types';

interface SummaryPanelProps {
  selections: StepSelection[];
  onEdit: (step: StepType) => void;
}

interface CategorySection {
  title: string;
  steps: StepType[];
}

const CATEGORIES: CategorySection[] = [
  {
    title: 'Contexto Pedagógico',
    steps: ['disciplina', 'ano', 'perfilAluno'],
  },
  {
    title: 'Conteúdo',
    steps: ['unidadeTematica', 'objetoConhecimento', 'habilidade'],
  },
  {
    title: 'Estrutura',
    steps: ['tipoQuestao', 'nivelBloom', 'tipoTextoBase', 'numeroAlternativas'],
  },
];

const STEP_LABELS: Record<StepType, string> = {
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

const SummaryPanel = memo(function SummaryPanel({ selections, onEdit }: SummaryPanelProps) {
  const selectionMap = new Map<StepType, StepSelection>();
  selections.forEach((selection) => {
    selectionMap.set(selection.step, selection);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white rounded-lg shadow-md p-6 space-y-6"
    >
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">✅ Resumo das Seleções</h2>
        <p className="text-sm text-gray-600 mt-1">
          Revise suas escolhas antes de gerar o prompt. Você pode editar qualquer item clicando no botão &ldquo;Editar&rdquo;.
        </p>
      </div>

      {CATEGORIES.map((category, categoryIndex) => {
        const categorySelections = category.steps
          .map((step) => selectionMap.get(step))
          .filter((selection): selection is StepSelection => selection !== undefined);

        if (categorySelections.length === 0) return null;

        return (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: categoryIndex * 0.1,
              ease: 'easeOut' 
            }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
              {category.title}
            </h3>
            <div className="space-y-2 pl-3">
              {categorySelections.map((selection, selectionIndex) => (
                <motion.div
                  key={selection.step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: categoryIndex * 0.1 + selectionIndex * 0.05,
                    ease: 'easeOut' 
                  }}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">
                      {STEP_LABELS[selection.step]}
                    </p>
                    <p 
                      className="text-sm text-gray-900 mt-1 break-words"
                      title={selection.label.length > 100 ? selection.label : undefined}
                    >
                      {selection.label}
                    </p>
                  </div>
                  <button
                    onClick={() => onEdit(selection.step)}
                    type="button"
                    className="ml-4 flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Editar ${STEP_LABELS[selection.step]}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
});

export default SummaryPanel;
