'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface NLPInputProps {
  onExtract: (extractedData: any) => void;
  isLoading?: boolean;
}

export function NLPInput({ onExtract, isLoading = false }: NLPInputProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (text.trim().length < 3) {
      setError('Por favor, digite pelo menos 3 caracteres');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar texto');
      }

      const data = await response.json();
      onExtract(data);
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao conectar com a API. Verifique se ela está rodando.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 mb-6"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-[#111827] mb-2">
          ✨ Descreva sua questão
        </h2>
        <p className="text-sm text-[#6B7280]">
          Digite em poucas palavras o que você deseja. Exemplo: &quot;Questão de matemática sobre frações para o 7º ano com múltipla escolha&quot;
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Quero uma questão de história sobre a Era Vargas para o 9º ano, nível de análise, com charge como texto base..."
          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none"
          rows={4}
          disabled={isLoading}
        />

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <motion.button
            type="submit"
            disabled={isLoading || text.trim().length < 3}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '🔄 Processando...' : '🚀 Processar com IA'}
          </motion.button>

          {text && (
            <button
              type="button"
              onClick={() => {
                setText('');
                setError(null);
              }}
              className="px-4 py-3 text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>💡 Dica:</strong> Quanto mais detalhes você fornecer, melhor será o preenchimento automático. Você sempre poderá ajustar manualmente depois.
        </p>
      </div>
    </motion.div>
  );
}
