# 🔥 Como Configurar Firebase Realtime Database para Multiplayer

## Passo 1: Ativar Realtime Database no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **certo-errado-quiz**
3. No menu lateral, clique em **"Build"** → **"Realtime Database"**
4. Clique em **"Criar banco de dados"**
5. Escolha o local:
   - **Estados Unidos (us-central1)** - Recomendado para Brasil (menor latência)
6. Modo de segurança:
   - Selecione **"Iniciar em modo de teste"** (por enquanto)
   - Depois configuraremos regras de segurança adequadas

## Passo 2: Copiar URL do Banco de Dados

Após criar, você verá a URL do seu banco de dados. Será algo como:

```
https://certo-errado-quiz-default-rtdb.firebaseio.com/
```

## Passo 3: Adicionar no arquivo .env

Abra o arquivo `.env` e adicione a linha:

```env
VITE_FIREBASE_DATABASE_URL=https://certo-errado-quiz-default-rtdb.firebaseio.com/
```

**⚠️ IMPORTANTE:** Substitua pela URL real do SEU projeto!

## Passo 4: Configurar Regras de Segurança

No Firebase Console, vá em **Realtime Database → Regras** e cole:

```json
{
  "rules": {
    "game-rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        
        ".indexOn": ["createdAt", "status"],
        
        "players": {
          "$playerId": {
            ".validate": "newData.hasChildren(['name', 'isReady', 'score', 'currentQuestion', 'answers', 'lastSeen', 'isOnline'])"
          }
        },
        
        "status": {
          ".validate": "newData.isString() && (newData.val() === 'waiting' || newData.val() === 'playing' || newData.val() === 'finished')"
        }
      }
    }
  }
}
```

**Clique em "Publicar"**

## Passo 5: Testar a Conexão

Execute o projeto:

```powershell
npm run dev
```

Abra o console do navegador (F12) e procure por:
```
✅ Firebase inicializado com sucesso! Compartilhamento de quizzes ativado.
```

## Passo 6: Criar Sua Primeira Sala Multiplayer

1. Acesse a página inicial
2. Clique em **"Jogar com Amigos"**
3. Preencha:
   - Nome da sala: "Teste"
   - Seu nome: "Jogador 1"
   - Número de jogadores: 5
   - Perguntas: 10
4. Clique em **"Criar e Compartilhar"**
5. Copie o link e abra em outra aba/navegador

## Verificar no Firebase Console

1. Vá em **Realtime Database → Dados**
2. Você verá a estrutura:
   ```
   game-rooms/
     └── -NwXXXXXXXXXXXXXX/
         ├── host: "player_1234..."
         ├── status: "waiting"
         ├── players/
         │   └── player_1234.../
         │       ├── name: "Jogador 1"
         │       ├── isReady: false
         │       └── score: 0
         └── questions: [...]
   ```

## 🎉 Pronto!

O sistema multiplayer está funcionando! 

### Como Funciona:

1. **Criar Sala**: Host cria sala e gera link
2. **Compartilhar**: Host envia link para amigos
3. **Entrar**: Amigos clicam no link e entram
4. **Lobby**: Todos marcam "Estou Pronto!"
5. **Jogar**: Host inicia e todos jogam simultaneamente
6. **Resultado**: Ranking final mostra vencedor

### Recursos:

- ✅ Real-time sync (atualização instantânea)
- ✅ Detecção de desconexão
- ✅ Até 20 jogadores por sala
- ✅ Chat visual (avatares e status)
- ✅ Sistema de pontuação
- ✅ Ranking final animado

### Custos:

**Firebase Realtime Database - Plano Gratuito:**
- 1 GB de armazenamento
- 10 GB/mês de download
- 100 conexões simultâneas

**Suficiente para:**
- 500-1000 partidas por mês
- 10-20 salas ativas simultaneamente

## Troubleshooting

### Erro: "Firebase Realtime Database not initialized"

**Solução:** Certifique-se que:
1. Adicionou `VITE_FIREBASE_DATABASE_URL` no `.env`
2. Reiniciou o servidor (`npm run dev`)
3. URL está correta (sem espaços ou quebras de linha)

### Erro: "Permission denied"

**Solução:** Regras de segurança muito restritivas
1. Vá em Firebase Console → Realtime Database → Regras
2. Use as regras fornecidas no **Passo 4**

### Sala não atualiza em tempo real

**Solução:**
1. Verifique console do navegador
2. Confirme que Firebase está inicializado
3. Teste em modo anônimo/privado

## Próximos Passos (Opcional)

### Melhorias Futuras:

1. **Autenticação**: Login com Google/Email
2. **Salas Privadas**: Senha para entrar
3. **Chat**: Mensagens entre jogadores
4. **Histórico**: Últimas partidas jogadas
5. **Ranking Global**: Top 100 jogadores
6. **Torneios**: Competições agendadas

### Migrar para Produção:

Quando seu app crescer, considere:
- Firebase Blaze Plan (pague conforme uso)
- CDN para assets
- Cloud Functions para lógica do servidor

---

**Bom jogo! 🎮🚀**
