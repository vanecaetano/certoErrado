# 🚀 Guia Rápido - Compartilhamento de Quiz

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Criar Projeto Firebase

```bash
# Acesse: https://console.firebase.google.com/
# Clique em "Adicionar projeto"
# Nome: certo-errado-quiz
# Desabilite Analytics (opcional)
```

### 2️⃣ Ativar Firestore

```bash
# No menu lateral → Firestore Database
# Clique em "Criar banco de dados"
# Modo: Produção
# Localização: southamerica-east1
```

### 3️⃣ Configurar Regras

Cole no Firestore → Regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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

### 4️⃣ Obter Credenciais

```bash
# Configurações (⚙️) → Seus aplicativos
# Clique em </> (Web)
# Copie o objeto firebaseConfig
```

### 5️⃣ Configurar .env

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Adicione suas credenciais
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=projeto-id
VITE_FIREBASE_STORAGE_BUCKET=projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### 6️⃣ Instalar e Rodar

```bash
# Instalar dependências
npm install

# Rodar projeto
npm run dev
```

## ✅ Testar

1. Acesse `http://localhost:5173`
2. Gere um quiz
3. Complete o jogo
4. Na página de resultados, clique em **"Compartilhar Quiz"**
5. Copie o link gerado
6. Abra o link em outra aba/navegador
7. ✨ Sucesso!

## 🎯 Onde está cada coisa

```
📂 Principais Arquivos
├── src/
│   ├── services/
│   │   ├── firebase.ts              # Config Firebase
│   │   ├── sharedQuizService.ts     # Lógica compartilhamento
│   │   └── contentModeration.ts     # Moderação conteúdo
│   ├── features/
│   │   └── shared/
│   │       └── SharedQuizPage.tsx   # Página /quiz/:id
│   ├── components/ui/
│   │   └── ShareQuizButton.tsx      # Botão compartilhar
│   └── types/index.ts               # Tipos TypeScript
└── .env                              # Credenciais (não commitar!)
```

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build produção
npm run build

# Preview produção
npm run preview

# Testes
npm run test
```

## 🐛 Problemas Comuns

### "Serviço não disponível"
**Causa:** Firebase não configurado  
**Solução:** Complete os passos 1-5 acima

### "Quiz não pode ser compartilhado"
**Causa:** Conteúdo impróprio detectado  
**Solução:** Revise o conteúdo do quiz

### "Quiz não encontrado"
**Causa:** Link errado ou ID inválido  
**Solução:** Verifique o link completo

## 📋 Checklist de Deploy

- [ ] Firebase configurado
- [ ] Variáveis de ambiente no Vercel/Netlify
- [ ] Regras do Firestore publicadas
- [ ] Build testado localmente (`npm run build`)
- [ ] Links de compartilhamento testados
- [ ] Moderação de conteúdo validada

## 🔗 Links Úteis

- [Documentação Completa](./COMPARTILHAMENTO_QUIZ.md)
- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Google Gemini API](https://ai.google.dev/)

## 💡 Dicas

1. **Custos**: Plano gratuito Firebase permite 50k leituras/dia
2. **Segurança**: NUNCA commite o arquivo `.env`
3. **Performance**: Quiz carrega em < 1 segundo
4. **Moderação**: Bloqueia conteúdo impróprio automaticamente
5. **Escalabilidade**: Estrutura suporta milhões de quizzes

## 🎉 Está funcionando?

Se chegou aqui e está tudo rodando: **Parabéns!** 🎊

Você acabou de implementar uma feature completa de compartilhamento com:
- ✅ Backend na nuvem (Firebase)
- ✅ Moderação de conteúdo (IA)
- ✅ Segurança (UUID + regras)
- ✅ UX moderna (modal + WhatsApp)

---

**Precisa de ajuda?** Consulte [COMPARTILHAMENTO_QUIZ.md](./COMPARTILHAMENTO_QUIZ.md) para documentação completa.
