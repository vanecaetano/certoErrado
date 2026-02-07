# ⚡ CONFIGURAÇÃO RÁPIDA - 2 MINUTOS

## Passo 1: Ativar Realtime Database

1. Abra: https://console.firebase.google.com/project/certo-errado-quiz/database
2. Se aparecer **"Criar banco de dados"**, clique nele
3. Escolha local: **Estados Unidos (us-central1)**
4. Modo: **"Iniciar em modo de teste"**
5. Clique **"Ativar"**

## Passo 2: Copiar URL

Após criar, você verá uma URL tipo:
```
https://certo-errado-quiz-default-rtdb.firebaseio.com/
```

**Copie essa URL!**

## Passo 3: Adicionar no .env

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione esta linha no final:

```env
VITE_FIREBASE_DATABASE_URL=https://certo-errado-quiz-default-rtdb.firebaseio.com/
```

**⚠️ Substitua pela URL que você copiou!**

## Passo 4: Configurar Regras de Segurança

1. No Firebase Console, clique em **"Regras"** (aba ao lado de "Dados")
2. Apague tudo e cole isso:

```json
{
  "rules": {
    "game-rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["createdAt", "status"]
      }
    }
  }
}
```

3. Clique **"Publicar"**

## Passo 5: Reiniciar Servidor

No terminal PowerShell:

```powershell
# Pare o servidor (Ctrl+C)
# Inicie novamente:
npm run dev
```

## ✅ Pronto!

Acesse a URL que aparecer no terminal (geralmente http://localhost:5173 ou http://localhost:3000) e clique em **"Jogar com Amigos"**!

---

## 🧪 Como Testar

1. Clique em "Jogar com Amigos"
2. Preencha:
   - Nome da sala: "Teste"
   - Seu nome: "Jogador 1"
3. Clique "Criar e Compartilhar"
4. **Copie o link**
5. Abra o link em:
   - Outra aba do navegador
   - Modo anônimo (Ctrl+Shift+N)
   - Outro navegador/dispositivo
6. Digite outro nome: "Jogador 2"
7. Ambos cliquem em "Estou Pronto!"
8. Host clica "Iniciar Jogo"

**🎮 Jogue e veja o sistema funcionando!**

---

## ❌ Se Não Funcionar

### Erro: "Firebase Realtime Database not initialized"

**Causa:** URL não foi adicionada ou está incorreta

**Solução:**
1. Confirme que adicionou a linha no `.env`
2. Verifique se não há espaços extras
3. Reinicie o servidor (`npm run dev`)

### Erro: "Permission denied"

**Causa:** Regras de segurança muito restritivas

**Solução:**
1. Vá em Firebase Console → Regras
2. Use as regras do **Passo 4** acima
3. Clique "Publicar"

### Sala não aparece

**Causa:** Firebase não inicializado

**Solução:**
1. Abra console do navegador (F12)
2. Procure por erros em vermelho
3. Verifique se aparece: "✅ Firebase inicializado"

---

## 📞 Precisa de Ajuda?

Veja documentação completa em:
- **SETUP_MULTIPLAYER.md** - Guia detalhado
- **MULTIPLAYER_CONCLUIDO.md** - O que foi implementado
- **MULTIPLAYER_PLAN.md** - Arquitetura técnica

---

**Tempo estimado:** 2-5 minutos ⏱️

**Dificuldade:** ⭐☆☆☆☆ (Muito Fácil)
