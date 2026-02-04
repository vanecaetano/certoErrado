# Alternativas de IA Gratuitas

Este projeto foi configurado para usar **Google Gemini** por padrão, que oferece um tier gratuito muito generoso. Mas você pode facilmente adaptar para outras APIs gratuitas.

## 🆓 Opções Gratuitas Disponíveis

### 1. Google Gemini (Atual - Recomendada) ⭐
- **Limite gratuito**: 1,500 requests/dia, 1M tokens/minuto
- **Custo**: Totalmente gratuito
- **Como obter**: https://aistudio.google.com/app/apikey
- **Vantagens**: 
  - Limite muito generoso
  - API rápida e confiável
  - Suporta múltiplos idiomas
  - Modelo: gemini-1.5-flash (rápido e eficiente)

### 2. Groq API
- **Limite gratuito**: 30 requests/minuto
- **Custo**: Totalmente gratuito
- **Como obter**: https://console.groq.com/
- **Vantagens**: 
  - Extremamente rápido (500+ tokens/segundo)
  - Modelos: Llama 3.3 70B, Mixtral 8x7B
- **Desvantagens**: Rate limit menor

### 3. DeepSeek
- **Limite gratuito**: 500K tokens/dia
- **Custo**: Totalmente gratuito
- **Como obter**: https://platform.deepseek.com/
- **Vantagens**: 
  - Boa qualidade de respostas
  - Bom para código

### 4. Hugging Face Inference API
- **Limite gratuito**: 1,000 requests/dia
- **Custo**: Totalmente gratuito
- **Como obter**: https://huggingface.co/
- **Vantagens**: 
  - Muitos modelos open-source disponíveis
  - Boa para experimentação

### 5. Ollama (Local - 100% Gratuito)
- **Limite**: Ilimitado (roda localmente)
- **Custo**: Totalmente gratuito
- **Como usar**: Instalar localmente
- **Vantagens**: 
  - Privacidade total (dados não saem do seu computador)
  - Sem limites de API
  - Funciona offline
- **Desvantagens**: Requer instalação e recursos locais

## 🔄 Como Trocar de API

### Para usar Groq:

1. Instale o pacote:
```bash
npm install groq-sdk
```

2. Crie `src/services/groqService.ts`:
```typescript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

// Adapte o método generateBatch similar ao aiService.ts
```

3. Atualize `src/features/settings/SettingsPage.tsx`:
```typescript
import { groqService } from '@/services/groqService';
// Use groqService ao invés de aiService
```

### Para usar Ollama (Local):

1. Instale Ollama: https://ollama.ai/
2. Baixe um modelo: `ollama pull llama3`
3. Crie um serviço que faça requisições para `http://localhost:11434/api/generate`

## 📊 Comparação Rápida

| API | Requests/Dia | Tokens/Minuto | Velocidade | Facilidade |
|-----|--------------|---------------|------------|------------|
| **Gemini** | 1,500 | 1M | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Groq | ~43,200 | - | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| DeepSeek | - | 500K/dia | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Hugging Face | 1,000 | - | ⭐⭐⭐ | ⭐⭐⭐ |
| Ollama | Ilimitado | - | ⭐⭐⭐ | ⭐⭐ |

## 💡 Recomendação

**Para a maioria dos casos**: Use **Google Gemini** (já configurado)
- Limite generoso
- Fácil de configurar
- Boa qualidade de respostas
- Totalmente gratuito

**Para uso intensivo**: Considere **Groq** ou **Ollama**
- Groq: Se precisar de velocidade máxima
- Ollama: Se precisar de privacidade total e uso ilimitado

## 🔐 Segurança

⚠️ **Importante**: Nunca commite suas chaves de API no Git!
- Sempre use arquivo `.env` (já está no `.gitignore`)
- Use variáveis de ambiente em produção
- Rotacione chaves periodicamente
