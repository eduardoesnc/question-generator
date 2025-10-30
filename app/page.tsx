import { DecisionTreeContainer } from '@/components/DecisionTreeContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

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
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>💡 Dica:</strong> Selecione cada opção com cuidado. Você pode editar suas escolhas anteriores a qualquer momento clicando em &ldquo;Editar&rdquo;.
              </p>
            </div>
          </div>
        </header>

        <main id="main-content" role="main">
          <DecisionTreeContainer />
        </main>
      </div>
    </ErrorBoundary>
  );
}
