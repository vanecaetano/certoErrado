# Certo ou Errado? 🎯

Aplicativo de perguntas e respostas estilo "Show do Milhão" desenvolvido em React com TypeScript.

## 🚀 Características

- ✅ **Responsivo**: Funciona perfeitamente em Android e Desktop
- 🎨 **Temas**: Modo claro e escuro (ideal para desenvolvedores)
- 🧠 **IA Integrada**: Geração automática de perguntas usando Google Gemini (GRATUITA)
- 💾 **Offline**: Banco de dados SQLite local
- 🔗 **Compartilhamento**: Envie quizzes para amigos via link único (requer Firebase)
- 👥 **Multiplayer**: Jogue em tempo real com amigos online (requer Firebase Realtime Database)
- 📊 **Estatísticas**: Gráficos de performance por assunto
- 🔊 **Feedback**: Sons e vibração para respostas corretas/erradas
- 📱 **Pronto para Monetização**: Espaços reservados para anúncios

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Chave da API Google Gemini (GRATUITA - obtenha em https://aistudio.google.com/app/apikey)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd certo-ou-errado
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a variável de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da API Gemini (GRATUITA):
```
VITE_GEMINI_API_KEY=sua_chave_aqui
```

**Como obter a chave gratuita:**
1. Acesse https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave e cole no arquivo `.env`

**Limite gratuito:** 1,500 requisições/dia, 1 milhão de tokens/minuto (mais que suficiente!)

4. **(Opcional) Configure Firebase para Compartilhamento de Quizzes:**

Se quiser que usuários possam compartilhar quizzes com amigos:

```bash
# Veja instruções detalhadas em:
SETUP_FIREBASE.md (5 minutos, configuração única)
```

**Resumo rápido:**
1. Crie projeto no Firebase Console
2. Ative Firestore Database
3. Configure credenciais em `.env` ou `src/services/firebase.ts`

**Importante:** 
- ✅ Configure UMA VEZ e funciona para todos os usuários
- ✅ Completamente GRÁTIS (plano Firebase free)
- ⚠️ Sem Firebase = jogo funciona normalmente, só não pode compartilhar quizzes

## 🎮 Como Usar

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse `http://localhost:3000`

3. **Primeiro uso**:
   - Vá em "Configurações"
   - Adicione um assunto (ex: "JavaScript")
   - Aguarde a geração de 300 perguntas (pode levar 2-5 minutos)
   - Volte para a tela inicial e selecione os assuntos para jogar

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Header, Footer, AdSpace
│   └── ui/             # Button, Input, Card
├── features/            # Features organizadas por domínio
│   ├── home/           # Tela inicial
│   ├── settings/       # Configurações de assuntos
│   ├── game/           # Tela de jogo
│   └── results/        # Tela de resultados
├── services/            # Serviços (DB, API, Audio)
├── store/               # Estado global (Zustand)
├── types/               # TypeScript types
├── utils/               # Funções utilitárias
└── styles/              # Estilos globais
```

## 🧪 Testes

Execute os testes:
```bash
npm test
```

Com interface visual:
```bash
npm run test:ui
```

Com cobertura:
```bash
npm run test:coverage
```

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos estarão em `dist/`

## 💰 Monetização

O projeto está preparado para integração de anúncios:

1. **Banner Inferior**: Espaço reservado na parte inferior da tela
2. **Recompensas**: Sistema preparado para anúncios de recompensa
   - Assistir anúncio para ganhar pistas
   - Dobrar pontuação ao assistir anúncio
   - Anúncios intersticiais entre rodadas

Para integrar anúncios, substitua o componente `AdSpace` pela sua solução preferida (Google AdSense, AdMob, etc.)

## ☁️ Deploy (Gratuito)

Recomendações rápidas para publicar gratuitamente:

- Vercel: ideal para aplicações Vite/React. Conecte seu repositório, crie um projeto e defina as variáveis de ambiente (VITE_ADSENSE_CLIENT, VITE_ADSENSE_SLOT). URL padrão: `https://seu-projeto.vercel.app`.
- Compartilhamento de Quizzes:**
- Usa Firebase Firestore (nuvem) para salvar quizzes compartilhados
- Configure uma vez em `SETUP_FIREBASE.md` (5 minutos)
- Grátis até 50.000 leituras/dia

**Nota**: Para uso em produção web, considere migrar o banco local para IndexedDBcomo `dist/`.
- Cloudflare Pages: também suporta builds Vite rapidamente.

Passos gerais:
1. Crie conta no provedor (Vercel/Netlify/Cloudflare Pages).  
2. Conecte o repositório Git (GitHub/GitLab/Bitbucket).  
3. Defina variáveis de ambiente no painel (VITE_ADSENSE_CLIENT e VITE_ADSENSE_SLOT).  
4. Configure domínio personalizado (recomendado) e verifique-o no Google AdSense (AdSense exige que o domínio esteja verificado para exibir anúncios).  
5. Garanta que a página de Política de Privacidade (`/privacy`) esteja publicada e acessível antes de solicitar exibição de anúncios.

Teste local com anúncios de teste:
- Em desenvolvimento o app ativa modo de teste automaticamente. Para forçar teste em produção preview, defina `VITE_ADSENSE_TEST=true` nas variáveis de ambiente.

Observação: o Google AdSense pode demorar para aprovar um novo site e só exibirá anúncios completos após a aprovação e verificação do domínio.

## 🗄️ Banco de Dados

O projeto usa SQLite local através do `better-sqlite3`. O banco de dados é criado automaticamente na primeira execução.

**Nota**: Para uso em produção web, considere migrar para IndexedDB ou uma solução cloud.

## 🎨 Personalização

- **Temas**: Modifique as cores em `tailwind.config.js`
- **Sons**: Substitua os sons gerados por arquivos de áudio em `src/services/audio.ts`
- **Estilos**: Customize em `src/styles/index.css`

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.
