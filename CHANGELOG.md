# Changelog

## [1.1.0] - 2026-02-06

### Nova Feature: Compartilhamento de Quiz 🔗

#### Adicionado
- ✅ **Sistema de compartilhamento de quizzes** via link único
- ✅ **Integração com Firebase Firestore** para armazenamento na nuvem
- ✅ **Moderação automática de conteúdo** usando Google Gemini AI
- ✅ **Botão de compartilhamento** na página de resultados
- ✅ **Página dedicada** para acessar quizzes compartilhados (`/quiz/:id`)
- ✅ **Compartilhamento direto no WhatsApp** com link pré-formatado
- ✅ **Botão de copiar link** para área de transferência
- ✅ **Validação de conteúdo** em duas etapas (local + IA)
- ✅ **Documentação completa** em `COMPARTILHAMENTO_QUIZ.md`

#### Tecnologias
- Firebase SDK 10.7.1
- Firestore Database
- UUID v4 para IDs únicos
- Google Gemini para moderação

#### Segurança
- IDs não sequenciais (UUID)
- Moderação de conteúdo proibido (18+, violência, ódio)
- Regras de segurança do Firestore
- Sem armazenamento de dados pessoais

#### Arquivos Criados
- `src/services/firebase.ts` - Configuração Firebase
- `src/services/sharedQuizService.ts` - Lógica de compartilhamento
- `src/services/contentModeration.ts` - Moderação de conteúdo
- `src/features/shared/SharedQuizPage.tsx` - Página de quiz compartilhado
- `src/components/ui/ShareQuizButton.tsx` - Componente de compartilhamento
- `COMPARTILHAMENTO_QUIZ.md` - Documentação completa

#### Configuração Necessária
- Variáveis de ambiente Firebase (`.env`)
- Firestore Database ativado
- Regras de segurança configuradas

## [1.0.1] - 2025-02-04

### Mudanças
- ✅ **Migrado de Claude para Google Gemini** (API gratuita)
- ✅ Adicionado suporte para Google Gemini API
- ✅ Limite gratuito: 1,500 requests/dia, 1M tokens/minuto
- ✅ Documentação atualizada com instruções para Gemini
- ✅ Criado guia de alternativas de IA (`AI_ALTERNATIVES.md`)

### Removido
- ❌ Dependência do Anthropic SDK (Claude)
- ❌ Arquivo `src/services/claude.ts`

### Adicionado
- ✅ Novo serviço `src/services/aiService.ts` usando Gemini
- ✅ Documentação sobre alternativas de IA gratuitas
- ✅ Suporte para múltiplas APIs (estrutura preparada)

## [1.0.0] - 2025-02-04

### Inicial
- ✅ Projeto criado com React + TypeScript
- ✅ Sistema de perguntas e respostas
- ✅ Banco de dados IndexedDB
- ✅ Temas claro/escuro
- ✅ Feedback visual e sonoro
- ✅ Gráficos de performance
- ✅ Preparação para monetização
