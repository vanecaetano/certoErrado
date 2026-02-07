# 🔥 Configuração Firebase - Setup Único (5 minutos)

## ⚡ Como Habilitar Compartilhamento

Você precisa configurar **UMA VEZ** e depois funciona para todos os usuários automaticamente!

---

## 📋 Passo a Passo Rápido

### 1. Criar Projeto Firebase (2 min)

```bash
1. Acesse: https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome: "certo-errado" (ou qualquer nome)
4. Desabilite Google Analytics
5. Criar projeto
```

### 2. Ativar Firestore (1 min)

```bash
1. Menu lateral → "Firestore Database"
2. Clicar "Criar banco de dados"
3. Modo: "Produção"
4. Localização: "southamerica-east1" (São Paulo)
5. Ativar
```

### 3. Configurar Regras de Segurança (1 min)

```bash
1. Firestore → Aba "Regras"
2. Cole este código:
```

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

```bash
3. Clicar "Publicar"
```

### 4. Obter Credenciais (1 min)

```bash
1. Ícone ⚙️ (Configurações) → "Configurações do projeto"
2. Role até "Seus aplicativos"
3. Clique em </> (Web)
4. Nome: "CertoErrado"
5. Registrar app
```

Você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-123",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

-

## 🔧 Configure no Projeto

### **OPÇÃO 1: Arquivo .env (Recomendado para Deploy)**

Crie arquivo `.env` na raiz do projeto:

```bash
VITE_FIREBASE_API_KEY=AIzaSyAbc123...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-123
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

### **OPÇÃO 2: Direto no Código (Mais Simples)**

Edite: `src/services/firebase.ts`

Linha 5-10, substitua:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123...",  // ← Cole sua chave aqui
  authDomain: "seu-projeto.firebaseapp.com",  // ← Cole seu domain
  projectId: "seu-projeto-123",  // ← Cole seu project ID
  storageBucket: "seu-projeto.appspot.com",  // ← Cole seu bucket
  messagingSenderId: "123456789",  // ← Cole seu sender ID
  appId: "1:123:web:abc123"  // ← Cole seu app ID
};
```

---

## ✅ Testar

```bash
# Reiniciar servidor
npm run dev
```

1. Gerar um quiz
2. Completar o jogo
3. Clicar em "Compartilhar Quiz" (no Header ou Resultados)
4. Se abrir o modal → **Funcionou!** ✅

---

## 🚀 Deploy (Vercel/Netlify)

Se usou a **OPÇÃO 1** (.env):

### Vercel
```bash
1. Dashboard → Seu projeto → Settings
2. Environment Variables
3. Adicionar cada VITE_FIREBASE_*
```

### Netlify
```bash
1. Site settings → Environment
2. Add variable
3. Adicionar cada VITE_FIREBASE_*
```

Se usou a **OPÇÃO 2** (código):
- ✅ Nada a fazer! Já funciona automaticamente

---

## 🔒 Segurança

**É seguro colocar credenciais Firebase no código?**

✅ **SIM!** Firebase é feito para isso:
- Credenciais client-side são públicas
- Segurança vem das **Regras do Firestore**
- Nossas regras só permitem criar quizzes válidos
- Impossível deletar ou modificar dados

**Nunca exponha:**
- ❌ Service Account Keys (arquivo JSON)
- ❌ Admin SDK credentials
- ❌ Chaves de servidor

**Pode expor (é normal):**
- ✅ API Key do Web App
- ✅ Project ID
- ✅ Auth Domain

---

## 💰 Custos (GRÁTIS)

Plano gratuito Firebase:
- ✅ 50.000 leituras/dia
- ✅ 20.000 escritas/dia
- ✅ 1GB armazenamento
- ✅ Suficiente para milhares de quizzes/dia

---

## 🆘 Problemas?

### "Firebase não configurado"

**Solução:**
1. Verificar se substituiu os valores em `firebase.ts`
2. Ou criou arquivo `.env` com as variáveis
3. Reiniciar o servidor: `npm run dev`

### Console mostra erro Firebase

**Causas:**
- Credenciais incorretas
- Firestore não ativado
- Regras não publicadas

**Debug:**
```bash
# Abrir console (F12)
# Procurar por mensagens Firebase
# Verificar se aparece: "✅ Firebase inicializado"
```

---

## 📊 Monitorar

Ver quizzes criados:
```bash
1. Firebase Console
2. Firestore Database
3. Coleção: "shared-quizzes"
```

Cada documento = 1 quiz compartilhado

---

## 🎯 Resultado Final

Depois de configurar:
- ✅ Usuários podem compartilhar quizzes
- ✅ Links funcionam automaticamente
- ✅ WhatsApp integration ativa
- ✅ Moderação de conteúdo funcionando
- ✅ Tudo grátis (plano Firebase free)

**Configure uma vez, funciona para sempre!** 🚀

---

**Tempo total:** 5 minutos  
**Custo:** R$ 0,00 (grátis)  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)
