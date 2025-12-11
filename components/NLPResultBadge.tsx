'use client';

import { motion } from 'framer-motion';

interface NLPResultBadgeProps {
  field: string;
  value: string;
  confidence: number;
}

export function NLPResultBadge({ field, value, confidence }: NLPResultBadgeProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (conf >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 0.8) return '✓';
    if (conf >= 0.6) return '~';
    return '?';
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      disciplina: 'Disciplina',
      ano: 'Ano',
      nivelBloom: 'Nível Bloom',
      tipoQuestao: 'Tipo de Questão',
      tipoTextoBase: 'Texto Base',
      perfilAluno: 'Perfil do Aluno',
    };
    return labels[field] || field;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getConfidenceColor(confidence)}`}
    >
      <span className="text-xs font-bold">{getConfidenceIcon(confidence)}</span>
      <span className="text-xs opacity-75">{getFieldLabel(field)}:</span>
      <span>{value}</span>
      <span className="text-xs opacity-60">({Math.round(confidence * 100)}%)</span>
    </motion.div>
  );
}
