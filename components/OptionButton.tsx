'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

interface OptionButtonProps {
  value: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const OptionButton = memo(function OptionButton({
  label,
  description,
  isSelected,
  onClick,
  disabled = false,
}: OptionButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onClick();
      }
    }
  };

  return (
    <motion.button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={description ? `${label}: ${description}` : label}
      tabIndex={disabled ? -1 : 0}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        w-full p-4 rounded-lg border-2 text-left transition-all duration-150
        ${
          isSelected
            ? 'border-[#3B82F6] bg-[#3B82F6] bg-opacity-10 shadow-md'
            : 'border-[#E5E7EB] bg-white hover:border-[#3B82F6] hover:shadow-sm'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex flex-col gap-1">
        <span
          className={`font-semibold text-base break-words ${
            isSelected ? 'text-[#3B82F6]' : 'text-[#111827]'
          }`}
          title={label.length > 100 ? label : undefined}
        >
          {label}
        </span>
        {description && (
          <span className="text-sm text-[#6B7280] break-words" title={description.length > 150 ? description : undefined}>
            {description}
          </span>
        )}
      </div>
    </motion.button>
  );
});
