'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { OptionButton } from './OptionButton';
import type { StepType } from '@/lib/types';

interface StepNodeProps {
  step: StepType;
  label: string;
  options: Array<{ value: string; label: string; description?: string }>;
  selectedValue?: string;
  onSelect: (value: string) => void;
  onGoBack?: () => void;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber?: number;
}

export const StepNode = memo(function StepNode({
  label,
  options,
  selectedValue,
  onSelect,
  onGoBack,
  isActive,
  isCompleted,
  stepNumber,
}: StepNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-6"
      role="region"
      aria-label={`Etapa ${stepNumber}: ${label}`}
    >
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-3 mb-4" role="heading" aria-level={2}>
          {stepNumber && (
            <div
              className={`
              flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm
              ${
                isCompleted
                  ? 'bg-[#10B981] text-white'
                  : isActive
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#E5E7EB] text-[#6B7280]'
              }
            `}
            >
              {isCompleted ? '✓' : stepNumber}
            </div>
          )}
          <h2 className="text-xl font-semibold text-[#111827]">{label}</h2>
        </div>

        {isCompleted && !isActive && selectedValue && (
          <div className="mb-4" role="status" aria-live="polite">
            <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#111827] font-medium">
                {options.find((opt) => opt.value === selectedValue)?.label ||
                  selectedValue}
              </span>
              {onGoBack && (
                <button
                  onClick={onGoBack}
                  type="button"
                  aria-label={`Editar seleção: ${label}`}
                  className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        )}

        {isActive && (
          <>
            {options.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Nenhuma opção disponível para esta etapa. Por favor, verifique suas seleções anteriores.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                role="radiogroup"
                aria-label={`Opções para ${label}`}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {options.map((option, index) => (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: index * 0.05,
                      ease: 'easeOut' 
                    }}
                  >
                    <OptionButton
                      value={option.value}
                      label={option.label}
                      description={option.description}
                      isSelected={selectedValue === option.value}
                      onClick={() => onSelect(option.value)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
});
