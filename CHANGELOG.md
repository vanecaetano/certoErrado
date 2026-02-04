# Changelog

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
