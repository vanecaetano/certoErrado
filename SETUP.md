# Guia de Configuração - Certo ou Errado?

## Passo a Passo para Começar

### 1. Instalação de Dependências

```bash
npm install
```

### 2. Configuração da API Gemini (GRATUITA)

1. Acesse https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google (qualquer conta Google funciona)
3. Clique em "Create API Key" ou "Get API Key"
4. Copie a chave gerada
5. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
6. Adicione sua chave no arquivo `.env`:
   ```
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```

**Limite gratuito:** 1,500 requisições/dia, 1 milhão de tokens/minuto (suficiente para gerar milhares de perguntas!)

### 3. Executar o Projeto

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

### 4. Primeiro Uso

1. **Acesse Configurações**: Clique em "Configurações" no menu
2. **Adicione um Assunto**: 
   - Digite o nome do assunto (ex: "JavaScript", "React", "TypeScript")
   - Clique em "Adicionar"
   - Aguarde a geração de 300 perguntas (pode levar alguns minutos)
3. **Volte para o Início**: Selecione os assuntos que deseja usar no jogo
4. **Configure Quantidade**: Escolha quantas perguntas de cada assunto você quer responder
5. **Inicie o Jogo**: Clique em "Iniciar Jogo"

## Estrutura de Pastas

```
src/
├── components/       # Componentes reutilizáveis
│   ├── layout/      # Header, Footer, AdSpace
│   └── ui/          # Button, Input, Card
├── features/         # Features organizadas
│   ├── home/        # Tela inicial
│   ├── settings/    # Configurações
│   ├── game/        # Tela de jogo
│   └── results/     # Resultados
├── services/         # Serviços (DB, API, Audio)
├── store/            # Estado global (Zustand)
├── types/            # TypeScript types
├── utils/            # Utilitários
└── styles/           # Estilos globais
```

## Banco de Dados

O projeto usa **IndexedDB** (via Dexie.js) para armazenamento local no navegador. Todos os dados são salvos localmente e o aplicativo funciona offline após o primeiro uso.

## Testes

Execute os testes:
```bash
npm test
```

Com interface visual:
```bash
npm run test:ui
```

## Build para Produção

```bash
npm run build
```

Os arquivos estarão em `dist/`

## Notas Importantes

- ⚠️ A geração de perguntas requer conexão com a internet e uma chave válida da API Gemini (gratuita)
- 💾 Após gerar as perguntas, o aplicativo funciona completamente offline
- 🎨 O tema (claro/escuro) é salvo automaticamente
- 📱 O aplicativo é totalmente responsivo e funciona em Android e Desktop

## Solução de Problemas

### Erro: "API key não configurada"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Certifique-se de que a variável `VITE_GEMINI_API_KEY` está configurada
- Reinicie o servidor de desenvolvimento após criar/editar o `.env`

### Erro ao gerar perguntas
- Verifique sua conexão com a internet
- Confirme que sua chave da API Gemini está válida
- Verifique se não excedeu o limite gratuito (1,500 requests/dia)
- Verifique o console do navegador para mais detalhes
- Se o erro persistir, aguarde alguns minutos e tente novamente (rate limiting)

### Banco de dados não funciona
- O IndexedDB requer um navegador moderno
- Certifique-se de estar usando Chrome, Firefox, Edge ou Safari atualizado
- Em modo privado, alguns navegadores podem bloquear IndexedDB
