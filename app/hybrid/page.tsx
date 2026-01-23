'use client';

import { DecisionTreeContainer } from '@/components/DecisionTreeContainer';

export default function HybridPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Método: Hybrid (Híbrido)</h1>
          <p className="text-gray-600">
            Combinação de keywords e embeddings. Melhor resultado (~250ms) com consenso entre ambos os métodos.
          </p>
        </div>
        <DecisionTreeContainer method="hybrid" />
      </div>
    </main>
  );
}
