'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  generateWithLLM,
  parseGeneratedQuestion,
  type LLMGenerationResult,
  type LLMTokenSummary,
  type ParsedQuestion,
} from '@/lib/services/LLMService';

const FIELD_LABELS: Record<string, string> = {
  disciplina: 'Disciplina',
  ano: 'Ano Escolar',
  perfilAluno: 'Perfil do Aluno',
  unidadeTematica: 'Unidade Temática',
  objetoConhecimento: 'Objeto de Conhecimento',
  habilidade: 'Habilidade BNCC',
  nivelBloom: 'Nível de Bloom',
  tipoQuestao: 'Tipo de Questão',
  tipoTextoBase: 'Tipo de Texto Base',
};

// ---------------------------------------------------------------------------
// Token Panel
// ---------------------------------------------------------------------------
function TokenPanel({ usage }: { usage: LLMTokenSummary }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 text-sm">Consumo de Tokens</h2>
        <span className="text-xs text-gray-400">2 chamadas ao Gemini</span>
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
            <tr className="py-2">
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

// ---------------------------------------------------------------------------
// Question display (shared)
// ---------------------------------------------------------------------------
function QuestionView({ parsed }: { parsed: ParsedQuestion }) {
  return (
    <div className="space-y-5">
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
      {parsed.justificativa_pedagogica && (
        <details>
          <summary className="text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
            Justificativas Pedagógicas
          </summary>
          <div className="mt-2 space-y-2">
            {Object.entries(parsed.justificativa_pedagogica).map(([k, v]) => (
              <div key={k} className="text-sm">
                <span className="font-semibold text-gray-600 capitalize">{k.replace(/_/g, ' ')}: </span>
                <span className="text-gray-700">{v}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LLMPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LLMGenerationResult | null>(null);
  const [parsedQuestion, setParsedQuestion] = useState<ParsedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'detalhado' | 'producao'>('detalhado');

  async function handleGenerate() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setParsedQuestion(null);

    try {
      const data = await generateWithLLM(text.trim());
      setResult(data);
      setParsedQuestion(parseGeneratedQuestion(data.generated_question));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8 bg-[#F9FAFB]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-500 transition-colors"
          >
            ← Voltar para página principal
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Modo LLM — Geração via Gemini</h1>
          <p className="text-gray-600">
            Descreva a questão desejada em linguagem natural. O Gemini extrai os campos
            educacionais, seleciona a habilidade BNCC real e gera a questão final.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descreva a questão
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
            placeholder="Ex: Quero uma questão de História do 9º ano sobre a Era Vargas, nível análise, múltipla escolha com documento histórico, para alunos com bom domínio do conteúdo."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !text.trim()}
            className="mt-4 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Gerando...' : 'Gerar Questão'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Barra de controles */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Processado em {result.processing_time_ms.toLocaleString('pt-BR')} ms
              </p>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                <button
                  onClick={() => setView('detalhado')}
                  className={`px-4 py-1.5 transition-colors ${
                    view === 'detalhado'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Detalhado
                </button>
                <button
                  onClick={() => setView('producao')}
                  className={`px-4 py-1.5 transition-colors border-l border-gray-200 ${
                    view === 'producao'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Produção
                </button>
              </div>
            </div>

            {/* ── VISÃO DETALHADA ── */}
            {view === 'detalhado' && (
              <>
                {/* Tokens */}
                {result.token_usage && <TokenPanel usage={result.token_usage} />}

                {/* Campos extraídos */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50">
                    <h2 className="font-semibold text-indigo-900">Campos Extraídos pelo Gemini</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {Object.entries(FIELD_LABELS).map(([key, label]) => (
                      <div key={key} className="px-6 py-3 flex gap-4">
                        <span className="w-48 shrink-0 text-xs font-semibold text-gray-500 uppercase tracking-wide pt-0.5">
                          {label}
                        </span>
                        <span className="text-sm text-gray-800 break-words">
                          {result.extracted_fields[key as keyof typeof result.extracted_fields] || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Prompt preenchido */}
                <details className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-700 hover:bg-gray-50 select-none">
                    Prompt Preenchido{' '}
                    <span className="text-gray-400 font-normal text-sm">(clique para expandir)</span>
                  </summary>
                  <div className="px-6 pb-6">
                    <pre className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                      {result.filled_prompt}
                    </pre>
                  </div>
                </details>

                {/* Questão gerada */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
                    <h2 className="font-semibold text-green-900">Questão Gerada</h2>
                  </div>
                  <div className="px-6 py-5">
                    {parsedQuestion ? (
                      <QuestionView parsed={parsedQuestion} />
                    ) : (
                      <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                        {result.generated_question}
                      </pre>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* ── VISÃO PRODUÇÃO ── */}
            {view === 'producao' && (
              <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Questão</h2>
                </div>
                <div className="px-6 py-5">
                  {parsedQuestion ? (
                    <QuestionView parsed={parsedQuestion} />
                  ) : (
                    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap overflow-auto">
                      {result.generated_question}
                    </pre>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
