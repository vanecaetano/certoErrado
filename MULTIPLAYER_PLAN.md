# 🎮 Plano de Implementação - Modo Multiplayer Online

## 📋 Visão Geral

Adicionar modo de jogo competitivo online onde amigos jogam simultaneamente o mesmo quiz e competem por pontuação.

---

## 🏗️ Arquitetura Recomendada

### **Firebase Realtime Database** ✅ (Melhor opção!)

**Por quê?**
- ✅ Você JÁ tem Firebase configurado
- ✅ Sincronização em tempo real nativa
- ✅ Sistema de "presença" (detecta when jogadores saem)
- ✅ Free tier generoso (50GB/mês, 100 conexões simultâneas)
- ✅ Latência baixa (<50ms)
- ✅ Fácil integração com projeto atual

**Alternativas consideradas:**
- Socket.io: Precisaria backend Node.js (custo adicional)
- Supabase: Nova dependência, curva aprendizado
- Pusher/Ably: Custo mensal, overkill para o caso

---

## 📊 Estrutura de Dados (Firebase Realtime DB)

```javascript
/game-rooms/
  /{roomId}/  // Ex: "abc123xyz"
    ├─ host: "player_001"
    ├─ hostName: "João"
    ├─ status: "waiting" | "ready" | "playing" | "finished"
    ├─ createdAt: 1707264000000
    ├─ startedAt: null | timestamp
    ├─ currentQuestion: 0
    ├─ maxPlayers: 10
    ├─ settings:
    │   ├─ timePerQuestion: 15
    │   └─ subjects: ["História", "Ciências"]
    ├─ questions: [
    │   {
    │     id: 1,
    │     question: {...},
    │     answers: [{...}]
    │   }
    │ ]
    └─ players:
        ├─ /player_001/
        │   ├─ name: "João"
        │   ├─ isReady: true
        │   ├─ score: 0
        │   ├─ currentQuestion: 0
        │   ├─ answers: {1: true, 2: false}
        │   └─ lastSeen: timestamp (presença)
        └─ /player_002/
            ├─ name: "Maria"
            └─ ...
```

---

## 🎯 Fluxo do Jogo (User Journey)

### **1. Criação da Sala**
```
Host → "Jogar com Amigos" 
     → Escolhe assuntos/perguntas
     → Insere SEU nome
     → Clica "Criar Sala"
     → Firebase cria sala com ID único
     → Mostra link: https://app.com/multiplayer/abc123
     → Opções: Copiar link / WhatsApp / QR Code
```

### **2. Sala de Espera**
```
Host vê:
- Lista de jogadores que entraram
- Status de cada um (pronto/não pronto)
- Botão "Iniciar" (só ativa quando todos prontos)
- Botão "Copiar Link" sempre visível

Jogadores veem:
- Quem criou a sala
- Lista de outros jogadores
- Check de "Estou Pronto"
- "Aguardando host iniciar..."
```

### **3. Durante o Jogo**
```
- TODOS veem a MESMA pergunta ao MESMO tempo
- Timer sincronizado via Firebase
- Cada um responde independentemente
- Score atualiza em tempo real
- Mini-placar no canto (top 3)
```

### **4. Resultados Finais**
```
- Ranking completo animado
- Pontuação de cada jogador
- Tempo médio de resposta
- % de acertos
- Botões: "Jogar Novamente" / "Nova Sala" / "Sair"
```

---

## 🛠️ Implementação Técnica

### **Passo 1: Configurar Firebase Realtime Database**

```typescript
// src/services/firebaseRealtimeDb.ts
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  push,
  serverTimestamp,
  onDisconnect 
} from 'firebase/database';

const db = getDatabase();

export const realtimeDb = {
  // Criar sala
  createRoom: async (hostId, hostName, questions, settings) => {
    const roomRef = push(ref(db, 'game-rooms'));
    const roomId = roomRef.key;
    
    await set(roomRef, {
      host: hostId,
      hostName,
      status: 'waiting',
      createdAt: serverTimestamp(),
      currentQuestion: 0,
      maxPlayers: settings.maxPlayers || 10,
      settings,
      questions,
      players: {
        [hostId]: {
          name: hostName,
          isReady: false,
          score: 0,
          currentQuestion: 0,
          answers: {},
          lastSeen: serverTimestamp()
        }
      }
    });
    
    return roomId;
  },
  
  // Entrar na sala
  joinRoom: async (roomId, playerId, playerName) => {
    const playerRef = ref(db, `game-rooms/${roomId}/players/${playerId}`);
    
    await set(playerRef, {
      name: playerName,
      isReady: false,
      score: 0,
      currentQuestion: 0,
      answers: {},
      lastSeen: serverTimestamp()
    });
    
    // Configurar detector de desconexão
    onDisconnect(playerRef).remove();
  },
  
  // Marcar como pronto
  setReady: async (roomId, playerId, isReady) => {
    const readyRef = ref(db, `game-rooms/${roomId}/players/${playerId}/isReady`);
    await set(readyRef, isReady);
  },
  
  // Iniciar jogo (só host)
  startGame: async (roomId) => {
    const updates = {
      [`game-rooms/${roomId}/status`]: 'playing',
      [`game-rooms/${roomId}/startedAt`]: serverTimestamp()
    };
    await set(ref(db), updates);
  },
  
  // Enviar resposta
  submitAnswer: async (roomId, playerId, questionId, isCorrect) => {
    const answerRef = ref(db, `game-rooms/${roomId}/players/${playerId}/answers/${questionId}`);
    await set(answerRef, isCorrect);
    
    // Atualizar score
    if (isCorrect) {
      const scoreRef = ref(db, `game-rooms/${roomId}/players/${playerId}/score`);
      // Use transaction para evitar race conditions
    }
  },
  
  // Listener de sala
  onRoomUpdate: (roomId, callback) => {
    const roomRef = ref(db, `game-rooms/${roomId}`);
    return onValue(roomRef, (snapshot) => {
      callback(snapshot.val());
    });
  }
};
```

### **Passo 2: Criar Componentes React**

**Estrutura de arquivos:**
```
src/features/multiplayer/
  ├─ CreateRoomPage.tsx          # Criar sala
  ├─ LobbyPage.tsx                # Sala de espera
  ├─ MultiplayerGamePage.tsx      # Jogo multiplayer
  ├─ MultiplayerResultsPage.tsx   # Ranking final
  └─ components/
      ├─ PlayerList.tsx           # Lista de jogadores
      ├─ ReadyCheck.tsx           # Status pronto
      ├─ LiveScoreboard.tsx       # Placar ao vivo
      └─ ShareRoomButton.tsx      # Compartilhar sala
```

**Exemplo: CreateRoomPage.tsx**
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { realtimeDb } from '@/services/firebaseRealtimeDb';
import { dbService } from '@/services/database';

export function CreateRoomPage() {
  const [playerName, setPlayerName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleCreateRoom = async () => {
    setLoading(true);
    
    // Gerar ID do jogador
    const playerId = `player_${Date.now()}_${Math.random()}`;
    
    // Buscar perguntas dos assuntos selecionados
    const questions = await dbService.getQuestionsForMultiplayer(selectedSubjects);
    
    // Criar sala no Firebase
    const roomId = await realtimeDb.createRoom(
      playerId,
      playerName,
      questions,
      { timePerQuestion: 15, subjects: selectedSubjects }
    );
    
    // Salvar dados localmente
    localStorage.setItem('multiplayerPlayerId', playerId);
    localStorage.setItem('multiplayerPlayerName', playerName);
    
    // Navegar para lobby
    navigate(`/multiplayer/${roomId}`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card>
        <h1>Criar Sala Multiplayer</h1>
        
        <Input
          placeholder="Seu nome"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        
        <SubjectSelector
          subjects={subjects}
          selected={selectedSubjects}
          onChange={setSelectedSubjects}
        />
        
        <Button
          onClick={handleCreateRoom}
          disabled={!playerName || selectedSubjects.length === 0 || loading}
        >
          {loading ? 'Criando...' : 'Criar Sala'}
        </Button>
      </Card>
    </div>
  );
}
```

**Exemplo: LobbyPage.tsx**
```typescript
export function LobbyPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const playerId = localStorage.getItem('multiplayerPlayerId');
  
  useEffect(() => {
    // Listener em tempo real
    const unsubscribe = realtimeDb.onRoomUpdate(roomId, (roomData) => {
      setRoom(roomData);
      setIsHost(roomData.host === playerId);
    });
    
    return () => unsubscribe();
  }, [roomId]);
  
  const allReady = useMemo(() => {
    if (!room) return false;
    return Object.values(room.players).every(p => p.isReady);
  }, [room]);
  
  const handleReady = async () => {
    const player = room.players[playerId];
    await realtimeDb.setReady(roomId, playerId, !player.isReady);
  };
  
  const handleStart = async () => {
    await realtimeDb.startGame(roomId);
    navigate(`/multiplayer/${roomId}/play`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card>
        <h1>Sala de Espera</h1>
        <ShareRoomButton roomId={roomId} />
        
        <PlayerList players={room?.players || {}} />
        
        {!isHost && (
          <Button onClick={handleReady}>
            {room?.players[playerId]?.isReady ? '✓ Pronto!' : 'Marcar como Pronto'}
          </Button>
        )}
        
        {isHost && (
          <Button
            onClick={handleStart}
            disabled={!allReady}
          >
            {allReady ? 'Iniciar Jogo!' : 'Aguardando jogadores...'}
          </Button>
        )}
      </Card>
    </div>
  );
}
```

### **Passo 3: Adicionar Rotas**

```typescript
// src/App.tsx
<Routes>
  {/* ... rotas existentes ... */}
  
  {/* Multiplayer */}
  <Route path="/multiplayer/create" element={<CreateRoomPage />} />
  <Route path="/multiplayer/:roomId" element={<LobbyPage />} />
  <Route path="/multiplayer/:roomId/play" element={<MultiplayerGamePage />} />
  <Route path="/multiplayer/:roomId/results" element={<MultiplayerResultsPage />} />
</Routes>
```

### **Passo 4: Adicionar na Landing Page**

```typescript
// src/features/landing/LandingPage.tsx
<div className="grid md:grid-cols-3 gap-6">
  {/* Card existente: Modo Relâmpago */}
  
  {/* NOVO: Multiplayer */}
  <Card>
    <Users className="w-12 h-12 text-purple-600 mb-4" />
    <h3>Multiplayer Online</h3>
    <p>Desafie amigos em tempo real! Crie uma sala e veja quem é o melhor.</p>
    <Button onClick={() => navigate('/multiplayer/create')}>
      🎮 Jogar com Amigos
    </Button>
  </Card>
  
  {/* Card existente: Personalizado */}
</div>
```

---

## 🎨 Design/UI Sugerido

### **Sala de Espera (Lobby)**
```
┌─────────────────────────────────────┐
│  🎮 Sala de João                   │
│  [Copiar Link] [WhatsApp] [QR Code]│
├─────────────────────────────────────┤
│  👥 Jogadores (3/10)                │
│                                     │
│  ✓ João (host) ●                   │
│  ✓ Maria ●                         │
│  ⏳ Pedro ●                         │
│                                     │
│  [● = online, ○ = offline]         │
├─────────────────────────────────────┤
│  [✓ Estou Pronto!]                 │
│  (ou)                               │
│  [Iniciar Jogo] (só host)          │
└─────────────────────────────────────┘
```

### **Durante o Jogo**
```
┌─────────────────────────────────────┐
│  Pergunta 5/10          ⏱️ 12s      │
├─────────────────────────────────────┤
│  🏆 Placar:                         │
│  1. Maria - 40pts                   │
│  2. João - 30pts                    │
│  3. Pedro - 20pts                   │
├─────────────────────────────────────┤
│  [Pergunta normal aqui]            │
│  [Respostas...]                     │
└─────────────────────────────────────┘
```

### **Ranking Final**
```
┌─────────────────────────────────────┐
│  🏆 Ranking Final                   │
├─────────────────────────────────────┤
│  🥇 1. Maria                        │
│      50 pontos - 90% acertos        │
│                                     │
│  🥈 2. João                         │
│      40 pontos - 80% acertos        │
│                                     │
│  🥉 3. Pedro                        │
│      30 pontos - 70% acertos        │
├─────────────────────────────────────┤
│  [Jogar Novamente] [Nova Sala] [Sair]│
└─────────────────────────────────────┘
```

---

## 📦 Dependências Necessárias

```json
{
  "dependencies": {
    "firebase": "^10.8.0"  // JÁ TEM! ✅
  }
}
```

**Nenhuma biblioteca adicional necessária!** 🎉

---

## ⚙️ Configuração Firebase

### **1. Habilitar Realtime Database**
```
Firebase Console → Seu Projeto
→ Build → Realtime Database
→ Create Database
→ Escolher região (us-central1 recomendado)
→ Modo de teste (depois ajustar regras)
```

### **2. Regras de Segurança Iniciais**
```json
{
  "rules": {
    "game-rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth == null || auth != null",
        "players": {
          "$playerId": {
            ".write": "auth == null || auth != null"
          }
        }
      }
    }
  }
}
```

*(Depois melhorar para validar que só o próprio player edite seus dados)*

---

## 🚀 Roadmap de Implementação

### **MVP (Fase 1) - 1-2 semanas**
- [x] Estrutura de dados Firebase
- [ ] Criar sala
- [ ] Entrar na sala (via link)
- [ ] Sistema de "pronto"
- [ ] Iniciar jogo (host)
- [ ] Jogo básico sincronizado
- [ ] Ranking final

### **Fase 2 - Melhorias**
- [ ] QR Code para compartilhar
- [ ] Avatares/emojis para jogadores
- [ ] Chat de texto simples
- [ ] Histórico de partidas
- [ ] Conquistas/badges

### **Fase 3 - Avançado**
- [ ] Modo torneio (múltiplas rodadas)
- [ ] Sistema de ELO/rating
- [ ] Matchmaking automático
- [ ] Modo spectador

---

## 💰 Custos Estimados

**Firebase Realtime Database - Free Tier:**
- ✅ 1GB armazenamento
- ✅ 10GB transferência/mês
- ✅ 100 conexões simultâneas
- ✅ **Suficiente para ~500-1000 partidas/mês**

**Quando precisar escalar:**
- Blaze Plan (pay-as-you-go)
- ~$5/GB armazenado
- ~$1/GB transferido
- Muito econômico!

---

## 🔒 Considerações de Segurança

1. **Validação no cliente**
   - Validar respostas no servidor (Cloud Functions)
   - Evitar cheating

2. **Rate limiting**
   - Limitar criação de salas
   - Prevenir spam

3. **Limpeza automática**
   - Deletar salas antigas (>24h)
   - Remover jogadores inativos

---

## 🎯 Próximos Passos Práticos

1. ✅ **Ler este documento**
2. ⏭️ **Habilitar Realtime Database no Firebase**
3. ⏭️ **Criar arquivo `firebaseRealtimeDb.ts`**
4. ⏭️ **Criar componente `CreateRoomPage`**
5. ⏭️ **Testar criação de sala localmente**
6. ⏭️ **Implementar `LobbyPage`**
7. ⏭️ **Adaptar `GamePage` para multiplayer**
8. ⏭️ **Criar `MultiplayerResultsPage`**
9. ⏭️ **Deploy e testar com amigos!**

---

## 📚 Recursos Úteis

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Presence System Guide](https://firebase.google.com/docs/database/web/offline-capabilities)
- [React + Firebase Tutorial](https://www.youtube.com/watch?v=PKwu15ldZ7k)

---

**Pronto para começar? 🚀**

Comece habilitando o Realtime Database no Firebase Console!
