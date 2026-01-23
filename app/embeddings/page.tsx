'use client';

import { DecisionTreeContainer } from '@/components/DecisionTreeContainer';

export default function EmbeddingsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Método: Embeddings (Similaridade Semântica)</h1>
          <p className="text-gray-600">
            Extração baseada em similaridade semântica usando embeddings. Mais preciso (~200ms) para textos complexos.
          </p>
        </div>
        <DecisionTreeContainer method="embeddings" />
      </div>
    </main>
  );
}
