'use client';

import { DecisionTreeContainer } from '@/components/DecisionTreeContainer';

export default function KeywordsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
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
