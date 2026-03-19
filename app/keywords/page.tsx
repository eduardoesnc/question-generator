'use client';

import { DecisionTreeContainer } from '@/components/DecisionTreeContainer';
import Link from 'next/link';

export default function KeywordsPage() {
  return (
    <main className="min-h-screen p-8 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
          >
            ← Voltar para página principal
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Método: Keywords (Palavras-chave)</h1>
          <p className="text-gray-600">
            Extração baseada em matching de palavras-chave. Rápido (~100ms) mas menos preciso para textos ambíguos.
          </p>
        </div>
        <DecisionTreeContainer method="keywords" />
      </div>
    </main>
  );
}
