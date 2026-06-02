'use client';

import { useState } from 'react';
import Link from 'next/link';
import { nlpService, type NLPExtractionResult } from '@/lib/services/NLPService';
import { generateWithLLM, parseGeneratedQuestion, type LLMGenerationResult, type LLMTokenSummary } from '@/lib/services/LLMService';

const FIELD_LABELS: Record<string, string> = {
  disciplina: 'Disciplina',
  ano: 'Ano',
  perfilAluno: 'Perfil do Aluno',
  unidadeTematica: 'Unidade Temática',
  objetoConhecimento: 'Objeto de Conhecimento',
  habilidade: 'Habilidade BNCC',
  nivelBloom: 'Nível de Bloom',
  tipoQuestao: 'Tipo de Questão',
  tipoTextoBase: 'Tipo de Texto Base',
};

function TokenPanel({ usage }: { usage: LLMTokenSummary }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 text-sm">Consumo de Tokens — LLM (Gemini)</h2>
        <span className="text-xs text-gray-400">2 chamadas</span>
      </div>
      <div className="px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left pb-2 font-semibold">Chamada</th>
              <th className="text-right pb-2 font-semibold">Input</th>
              <th className="text-right pb-2 font-semibold">Output</th>
              <th className="text-right pb-2 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr>
              <td className="py-2 text-gray-600">Chamada 1 <span className="text-xs text-gray-400">(extração)</span></td>
              <td className="py-2 text-right text-blue-600 font-mono">{usage.call_1.input_tokens.toLocaleString()}</td>
              <td className="py-2 text-right text-emerald-600 font-mono">{usage.call_1.output_tokens.toLocaleString()}</td>
              <td className="py-2 text-right text-gray-700 font-mono">{usage.call_1.total_tokens.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600">Chamada 2 <span className="text-xs text-gray-400">(BNCC + questão)</span></td>
              <td className="py-2 text-right text-blue-600 font-mono">{usage.call_2.input_tokens.toLocaleString()}</td>
              <td className="py-2 text-right text-emerald-600 font-mono">{usage.call_2.output_tokens.toLocaleString()}</td>
              <td className="py-2 text-right text-gray-700 font-mono">{usage.call_2.total_tokens.toLocaleString()}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 font-semibold">
              <td className="pt-2 text-gray-800">Total</td>
              <td className="pt-2 text-right text-blue-700 font-mono">{usage.total_input.toLocaleString()}</td>
              <td className="pt-2 text-right text-emerald-700 font-mono">{usage.total_output.toLocaleString()}</td>
              <td className="pt-2 text-right text-gray-900 font-mono">{usage.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default function ComparePage() {
  const [text, setText] = useState('');
  const [embeddingLoading, setEmbeddingLoading] = useState(false);
  const [llmLoading, setLlmLoading] = useState(false);
  const [embeddingError, setEmbeddingError] = useState<string | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [embeddingResult, setEmbeddingResult] = useState<NLPExtractionResult | null>(null);
  const [llmResult, setLlmResult] = useState<LLMGenerationResult | null>(null);

  const isLoading = embeddingLoading || llmLoading;

  async function handleCompare() {
    if (text.trim().length < 3) return;
    setEmbeddingResult(null);
    setLlmResult(null);
    setEmbeddingError(null);
    setLlmError(null);
    setEmbeddingLoading(true);
    setLlmLoading(true);

    // Dispara em paralelo, cada um atualiza o estado assim que termina
    nlpService.extractInformation(text, 'embeddings')
      .then(setEmbeddingResult)
      .catch((err) => setEmbeddingError(err instanceof Error ? err.message : 'Erro no Embeddings'))
      .finally(() => setEmbeddingLoading(false));

    generateWithLLM(text)
      .then(setLlmResult)
      .catch((err) => setLlmError(err instanceof Error ? err.message : 'Erro no LLM'))
      .finally(() => setLlmLoading(false));
  }

  const confidence = (val: number) =>
    `${(val * 100).toFixed(0)}%`;

  return (
    <main className="min-h-screen p-8 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-orange-500 transition-colors"
          >
            ← Voltar para página principal
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Comparação: Embeddings vs LLM</h1>
          <p className="text-gray-600">
            Execute os dois métodos em paralelo e compare os campos extraídos e a questão gerada.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descreva a questão
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
            rows={3}
            placeholder="Ex: Questão de História do 9º ano sobre Era Vargas, nível análise, múltipla escolha com documento histórico"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          {(embeddingError || llmError) && (
            <p className="mt-2 text-sm text-red-600">{embeddingError || llmError}</p>
          )}
          <button
            onClick={handleCompare}
            disabled={isLoading || text.trim().length < 3}
            className="mt-4 px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Comparando...' : 'Comparar Métodos'}
          </button>
        </div>

        {(embeddingLoading || llmLoading || embeddingResult || llmResult) && (
          <div className="space-y-8">
            {/* Campos extraídos lado a lado */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Campos Extraídos</h2>
              <div className="grid grid-cols-2 gap-6">
                {/* Embeddings */}
                <div className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-purple-50 border-b border-purple-100">
                    <h3 className="font-semibold text-purple-900">🧠 Embeddings</h3>
                  </div>
                  {embeddingLoading ? (
                    <div className="p-5 space-y-3 animate-pulse">
                      {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
                    </div>
                  ) : embeddingError ? (
                    <p className="px-5 py-4 text-sm text-red-600">{embeddingError}</p>
                  ) : embeddingResult ? (
                    <>
                      <div className="divide-y divide-gray-100">
                        {Object.entries(FIELD_LABELS).map(([key, label]) => {
                          const value = embeddingResult.extracted[key as keyof typeof embeddingResult.extracted];
                          const conf = embeddingResult.confidence[key];
                          return (
                            <div key={key} className="px-5 py-2.5 flex items-start gap-2">
                              <span className="w-36 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide pt-0.5">{label}</span>
                              <span className="text-sm text-gray-800 flex-1">{value || '—'}</span>
                              {conf !== undefined && (
                                <span className={`text-xs font-medium shrink-0 ${conf >= 0.7 ? 'text-green-600' : conf >= 0.5 ? 'text-yellow-600' : 'text-red-400'}`}>
                                  {confidence(conf)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {embeddingResult.missing_fields.length > 0 && (
                        <div className="px-5 py-3 bg-yellow-50 border-t border-yellow-100">
                          <p className="text-xs text-yellow-700">Não extraídos: {embeddingResult.missing_fields.join(', ')}</p>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>

                {/* LLM */}
                <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
                    <h3 className="font-semibold text-indigo-900">✨ LLM (Gemini)</h3>
                    {llmResult && <p className="text-xs text-indigo-500 mt-0.5">{llmResult.processing_time_ms.toLocaleString('pt-BR')} ms</p>}
                  </div>
                  {llmLoading ? (
                    <div className="p-5 space-y-3 animate-pulse">
                      {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
                    </div>
                  ) : llmError ? (
                    <p className="px-5 py-4 text-sm text-red-600">{llmError}</p>
                  ) : llmResult ? (
                    <div className="divide-y divide-gray-100">
                      {Object.entries(FIELD_LABELS).map(([key, label]) => {
                        const value = llmResult.extracted_fields[key as keyof typeof llmResult.extracted_fields];
                        return (
                          <div key={key} className="px-5 py-2.5 flex items-start gap-2">
                            <span className="w-36 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide pt-0.5">{label}</span>
                            <span className="text-sm text-gray-800 flex-1">{value || '—'}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Questão gerada pelo LLM */}
            {llmResult && (() => {
              const parsed = parseGeneratedQuestion(llmResult.generated_question);
              if (!parsed) return null;
              return (
                <section>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Questão Gerada pelo LLM</h2>
                  <div className="bg-white rounded-xl border border-green-200 shadow-sm p-6 space-y-4">
                    {parsed.texto_base && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Texto Base</p>
                        <blockquote className="border-l-4 border-indigo-300 pl-4 text-sm text-gray-700 italic">
                          {parsed.texto_base}
                        </blockquote>
                      </div>
                    )}
                    {parsed.enunciado && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Enunciado</p>
                        <p className="text-sm font-medium text-gray-800">{parsed.enunciado}</p>
                      </div>
                    )}
                    {parsed.alternativas?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Alternativas</p>
                        <ul className="space-y-1.5">
                          {parsed.alternativas.map((alt) => (
                            <li
                              key={alt.letra}
                              className={`flex gap-2 text-sm px-3 py-2 rounded-lg ${
                                alt.letra === parsed.alternativa_correta
                                  ? 'bg-green-50 border border-green-200 text-green-800 font-medium'
                                  : 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              <span className="font-bold shrink-0">{alt.letra})</span>
                              <span>{alt.texto}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-green-600 font-semibold">
                          Resposta correta: {parsed.alternativa_correta}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              );
            })()}

            {/* Token usage */}
            {llmResult?.token_usage && <TokenPanel usage={llmResult.token_usage} />}

            {/* Nota: Embeddings só extrai campos, não gera questão */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
              O método Embeddings extrai os campos educacionais do texto mas não gera a questão diretamente — use a página 🧠 Embeddings para completar o fluxo com a árvore de decisão.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
