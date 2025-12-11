# 🎓 Question Generator - Frontend

Interface web para gerar prompts de questões educacionais alinhadas com a BNCC, com suporte a **Processamento de Linguagem Natural (NLP)**.

> **Nota:** Este é o frontend do projeto. Para instruções completas de instalação e execução do sistema completo, veja o [README principal](../README.md).

## ✨ Funcionalidades

- 🤖 **NLP Inteligente**: Digite em linguagem natural e a IA preenche os campos automaticamente
- 🌳 **Árvore de Decisão**: Interface guiada para seleção manual de opções
- 📚 **Alinhado com BNCC**: Baseado na Base Nacional Comum Curricular
- 🎯 **Taxonomia de Bloom**: Níveis cognitivos de dificuldade
- 📝 **Múltiplos Formatos**: Múltipla escolha, dissertativa, verdadeiro/falso, etc.
- 🎨 **Interface Moderna**: Design responsivo e acessível

## 🚀 Instalação

```bash
npm install
```

## 🏃 Executar

```bash
npm run dev
```

Acesse: `http://localhost:3000`

> **Importante:** A API NLP deve estar rodando em `http://localhost:8000` para o processamento de linguagem natural funcionar.

## 📁 Estrutura

```
.
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Página principal
│   └── layout.tsx         # Layout global
├── components/             # Componentes React
│   ├── NLPInput.tsx       # Input com NLP
│   ├── DecisionTreeContainer.tsx  # Container principal
│   ├── StepNode.tsx       # Nó da árvore de decisão
│   ├── SummaryPanel.tsx   # Painel de resumo
│   └── PromptDisplay.tsx  # Display do prompt gerado
├── lib/
│   ├── services/          # Serviços
│   │   ├── NLPService.ts  # Cliente da API NLP
│   │   ├── DataService.ts # Serviço de dados BNCC
│   │   └── PromptTemplateService.ts
│   ├── types/             # TypeScript types
│   ├── data/              # Dados BNCC
│   └── utils/             # Utilitários
└── public/                # Arquivos estáticos
```

## 🛠️ Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações

## 📜 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linter
npm run convert-csv  # Converte CSV da BNCC para JSON
```

## 🔗 Integração com API

O frontend se comunica com a API NLP através do serviço `NLPService.ts`:

```typescript
// Exemplo de uso
const result = await nlpService.extractFromText(
  "Questão de matemática sobre frações para o 7º ano"
);
```

A API deve estar rodando em `http://localhost:8000` (configurável).
