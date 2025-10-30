'use client';

import { memo } from 'react';

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number;
}

export const ProgressIndicator = memo(function ProgressIndicator({
  totalSteps,
  currentStep,
  completedSteps,
}: ProgressIndicatorProps) {
  return (
    <div 
      className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] shadow-sm mb-6"
      role="region"
      aria-label="Indicador de progresso"
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2" role="status" aria-live="polite">
          <span className="text-sm font-medium text-[#111827]">
            {completedSteps} de {totalSteps} etapas concluídas
          </span>
        </div>

        <div className="hidden md:flex items-center justify-between mt-3 gap-1">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum <= completedSteps;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={stepNum}
                className={`
                  flex-1 h-1 rounded-full transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-[#3B82F6]'
                      : isCurrent
                      ? 'bg-[#3B82F6] bg-opacity-50'
                      : 'bg-[#E5E7EB]'
                  }
                `}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});
