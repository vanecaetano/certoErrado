# 🔗 Feature: Compartilhamento de Quiz

## Visão Geral

Esta feature permite que usuários compartilhem quizzes gerados com amigos através de um link público. O quiz é salvo na nuvem e pode ser acessado por qualquer pessoa com o link.

## Como Funciona

### 1. Fluxo do Usuário Criador

1. **Gerar Quiz**: Usuário gera um quiz normalmente no app
2. **Completar Quiz**: Joga até o final e acessa a página de resultados
3. **Compartilhar**: Clica no botão "Compartilhar Quiz"
4. **Moderação**: Sistema valida automaticamente o conteúdo
5. **Link Gerado**: Recebe um link único para compartilhar
6. **Opções**: Pode copiar o link ou compartilhar direto no WhatsApp

### 2. Fluxo do Usuário Convidado

1. **Receber Link**: Recebe o link via WhatsApp, email, etc.
2. **Acessar**: Abre o link no navegador (formato: `/quiz/{id}`)
3. **Visualizar**: Vê detalhes do quiz (assuntos, número de perguntas)
4. **Jogar**: Clica em "Começar Quiz" e joga normalmente

## Configuração

### Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: "certo-errado-quiz")
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

### Passo 2: Ativar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de produção"
4. Selecione a localização mais próxima (ex: `southamerica-east1`)
5. Clique em "Ativar"

### Passo 3: Configurar Regras de Segurança

No Firestore, vá em "Regras" e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura pública de quizzes compartilhados
    match /shared-quizzes/{quizId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['topics', 'questions', 'createdAt'])
                    && request.resource.data.questions.size() > 0
                    && request.resource.data.topics.size() > 0;
      allow update, delete: if false;
    }
  }
}
```

Clique em "Publicar" para salvar as regras.

### Passo 4: Obter Credenciais

1. Nas configurações do projeto (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique no ícone "</>" (Web)
4. Registre o app (nome: "CertoErrado Web")
5. Copie as configurações:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "projeto.firebaseapp.com",
  projectId: "projeto-id",
  storageBucket: "projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

### Passo 5: Configurar Variáveis de Ambiente

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Adicione suas credenciais no arquivo `.env`:
   ```bash
   VITE_FIREBASE_API_KEY=sua_chave_api
   VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu_projeto_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123:web:abc123
   ```

3. **IMPORTANTE**: Nunca commite o arquivo `.env` no git!

### Passo 6: Testar

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Gere um quiz e vá até a página de resultados
3. Clique em "Compartilhar Quiz"
4. Se tudo estiver configurado corretamente, verá a opção de compartilhar

## Moderação de Conteúdo

A feature inclui moderação automática de conteúdo para bloquear:

- ❌ Conteúdo sexual ou adulto (18+)
- ❌ Violência, gore ou crueldade
- ❌ Discurso de ódio ou discriminação
- ❌ Terrorismo ou extremismo
- ❌ Atividades ilegais

### Como Funciona

1. **Validação Local**: Primeira verificação rápida por palavras-chave
2. **Validação IA**: Análise completa usando Google Gemini
3. **Bloqueio**: Se violar regras, quiz não é salvo e usuário é notificado

## Estrutura de Dados

### Quiz Compartilhado (Firestore)

```typescript
{
  id: "uuid-v4",
  topics: ["Geografia", "História"],
  questions: [
    {
      text: "Qual é a capital do Brasil?",
      options: ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"],
      correctIndex: 0
    }
  ],
  createdAt: Timestamp,
  modelVersion: "1.0"
}
```

## Segurança

### IDs Únicos
- Usa UUID v4 (não sequencial)
- Impossível adivinhar IDs de outros quizzes

### Rate Limiting
- Firestore tem rate limiting nativo
- Regras de segurança impedem abusos

### Dados Salvos
✅ **SIM**: Perguntas, respostas, assuntos  
❌ **NÃO**: Dados pessoais, IPs, sessões

## Custos

### Firebase (Firestore)

**Plano Gratuito (Spark):**
- 50,000 leituras/dia
- 20,000 escritas/dia
- 1 GB de armazenamento

**Estimativa:**
- 1 quiz compartilhado = 1 escrita (~20 KB)
- 1 acesso ao quiz = 1 leitura
- **Capacidade**: ~20,000 quizzes compartilhados/dia (gratuito)

### Google Gemini (Moderação)

**Plano Gratuito:**
- 1,500 requisições/dia
- 1M tokens/minuto

**Estimativa:**
- 1 moderação = ~500 tokens
- **Capacidade**: ~1,500 quizzes moderados/dia (gratuito)

## Troubleshooting

### "Serviço de compartilhamento não disponível"

**Causa**: Firebase não configurado  
**Solução**: Siga os passos de configuração acima

### "Este quiz não pode ser compartilhado"

**Causa**: Conteúdo violou políticas  
**Solução**: Revise o conteúdo do quiz

### "Quiz não encontrado"

**Causa**: Link inválido ou quiz foi removido  
**Solução**: Verifique se o link está correto

### Erro ao carregar quiz compartilhado

**Causa**: Regras de segurança do Firestore incorretas  
**Solução**: Verifique as regras no Firebase Console

## Melhorias Futuras

### Curto Prazo
- [ ] Adicionar expiração automática (ex: 30 dias)
- [ ] Contador de acessos por quiz
- [ ] Report de conteúdo impróprio

### Médio Prazo
- [ ] Sistema de ranking por quiz
- [ ] Comentários e reações
- [ ] Perfis de usuários (opcional)

### Longo Prazo
- [ ] Modo multiplayer em tempo real
- [ ] Sala de espera com chat
- [ ] Torneios e competições

## Arquivos Relacionados

### Services
- `src/services/firebase.ts` - Configuração do Firebase
- `src/services/sharedQuizService.ts` - Lógica de compartilhamento
- `src/services/contentModeration.ts` - Moderação de conteúdo

### Components
- `src/components/ui/ShareQuizButton.tsx` - Botão e modal de compartilhamento

### Pages
- `src/features/shared/SharedQuizPage.tsx` - Página para acessar quiz via link
- `src/features/results/ResultsPage.tsx` - Integração do botão de compartilhar

### Types
- `src/types/index.ts` - Interfaces TypeScript

## Suporte

Para mais informações:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Google Gemini API](https://ai.google.dev/docs)

---

**Desenvolvido com ❤️ para comunidade CertoErrado**
