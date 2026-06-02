import { DecisionTreeContainer } from '@/components/DecisionTreeContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import Link from 'next/link';

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F9FAFB]">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#3B82F6] focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Pular para o conteúdo principal
        </a>

        {/* Page Header */}
        <header className="bg-white border-b border-[#E5E7EB] shadow-sm" role="banner">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#111827] text-center sm:text-left">
              Gerador de Prompts para Questões Educacionais
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#6B7280] max-w-3xl text-center sm:text-left">
              Crie prompts personalizados para gerar questões acadêmicas alinhadas com a BNCC. 
              Navegue pelas opções abaixo e construa seu prompt passo a passo.
            </p>
            
            {/* Navigation to different methods */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/embeddings"
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                🧠 Embeddings
              </Link>
              <Link
                href="/llm"
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
              >
                ✨ Modo LLM (Gemini)
              </Link>
              <Link
                href="/compare"
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
              >
                🔍 Comparar Métodos
              </Link>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>💡 Dica:</strong> Selecione cada opção com cuidado. Você pode editar suas escolhas anteriores a qualquer momento clicando em &ldquo;Editar&rdquo;. Para usar extração automática com IA, acesse as páginas Keywords, Embeddings ou Hybrid acima.
              </p>
            </div>
          </div>
        </header>

        <main id="main-content" role="main">
          <DecisionTreeContainer showNLPInput={false} />
        </main>
      </div>
    </ErrorBoundary>
  );
}
