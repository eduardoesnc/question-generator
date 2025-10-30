'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';

interface CustomInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export const CustomInputField = memo(function CustomInputField({
  value,
  onChange,
  placeholder = 'Descreva o perfil do aluno...',
  maxLength = 500,
}: CustomInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isAtLimit = characterCount >= maxLength;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <div
        className={`
          relative rounded-lg border-2 transition-all duration-150
          ${
            isFocused
              ? 'border-[#3B82F6] shadow-sm'
              : 'border-[#E5E7EB] hover:border-[#3B82F6]'
          }
          ${isAtLimit ? 'border-red-400' : ''}
        `}
      >
        <textarea
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              onChange(e.target.value);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          className="w-full p-4 bg-transparent resize-none outline-none text-[#111827] placeholder:text-[#6B7280]"
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span
            className={`
              text-xs font-medium transition-colors
              ${
                isAtLimit
                  ? 'text-red-500'
                  : isNearLimit
                  ? 'text-orange-500'
                  : 'text-[#6B7280]'
              }
            `}
          >
            {characterCount}/{maxLength}
          </span>
        </div>
      </div>

      {isAtLimit && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-500"
        >
          Limite de caracteres atingido
        </motion.p>
      )}

      {value.length > 0 && value.length < 20 && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-[#6B7280]"
        >
          Descreva com mais detalhes para um prompt mais preciso
        </motion.p>
      )}
    </motion.div>
  );
});
