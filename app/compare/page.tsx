'use client';

import { useState } from 'react';
import { NLPExtractionResult } from '@/lib/types/nlp';
import { nlpService } from '@/lib/services/NLPService';
import Link from 'next/link';

export default function ComparePage() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    keywords?: NLPExtractionResult;
    embeddings?: NLPExtractionResult;
    hybrid?: NLPExtractionResult;
  }>({});
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (text.trim().length < 3) {
      setError('Por favor, digite pelo menos 3 caracteres');
      return;
    }

    setInputText(text);
    setLoading(true);
    setResults({});

    try {
      // Executar os 3 métodos em paralelo
      const [keywordsResult, embeddingsResult, hybridResult] = await Promise.all([
        nlpService.extractInformation(text, 'keywords'),
        nlpService.extractInformation(text, 'embeddings'),
        nlpService.extractInformation(text, 'hybrid'),
      ]);

      setResults({
        keywords: keywordsResult,
        embeddings: embeddingsResult,
        hybrid: hybridResult,
      });
    } catch (error) {
      console.error('Erro ao extrair informações:', error);
      setError('Erro ao processar. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = (method: string, result?: NLPExtractionResult) => {
    if (!result) return null;

    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4 capitalize">{method}</h3>
        
        <div className="space-y-2">
          {Object.entries(result.extracted).map(([field, value]) => (
            <div key={field} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{field}:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{String(value)}</span>
                <span className="text-xs text-gray-400">
                  ({(result.confidence[field] * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {result.missing_fields.length > 0 && (
          <div className="mt-4 p-2 bg-yellow-50 rounded">
            <p className="text-xs text-yellow-800">
              Campos faltantes: {result.missing_fields.join(', ')}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen p-8 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-orange-500 transition-colors"
          >
            ← Voltar para página principal
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Comparação de Métodos</h1>
          <p className="text-gray-600">
            Compare os resultados dos 3 métodos de extração lado a lado
          </p>
        </div>

        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Digite o texto para comparar</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: História sobre Era Vargas, 9º ano, análise..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                disabled={loading}
              />
              
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || text.trim().length < 3}
                className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Processando...' : '🚀 Comparar 3 Métodos'}
              </button>
            </form>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Processando com os 3 métodos...</p>
          </div>
        )}

        {!loading && Object.keys(results).length > 0 && (
          <div>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">Texto analisado:</p>
              <p className="text-sm text-gray-700 mt-1">{inputText}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderResult('keywords', results.keywords)}
              {renderResult('embeddings', results.embeddings)}
              {renderResult('hybrid', results.hybrid)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
