# Início Rápido - Certo ou Errado?

## 🚀 Setup em 3 Passos

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar API Key (GRATUITA)
Crie um arquivo `.env` na raiz do projeto:
```
VITE_GEMINI_API_KEY=sua_chave_aqui
```

**Como obter a chave gratuita**: 
1. Acesse https://aistudio.google.com/app/apikey
2. Faça login com Google
3. Clique em "Create API Key"
4. Copie e cole no `.env`

**Limite gratuito:** 1,500 requests/dia (mais que suficiente!)

### 3. Executar
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📱 Primeiro Uso

1. Vá em **Configurações**
2. Adicione um assunto (ex: "JavaScript")
3. Aguarde ~2-5 minutos para gerar 300 perguntas
4. Volte para o **Início**
5. Selecione assuntos e quantidade de perguntas
6. Clique em **Iniciar Jogo**

## 🎮 Como Jogar

- Selecione uma resposta clicando nela
- Resposta correta: pisca verde 3x + som + vibração
- Resposta errada: pisca vermelho 1x + som de erro
- Pontuação aparece no canto superior direito
- Ao final, veja seus resultados e gráficos de performance

## 🛠️ Comandos Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm test             # Executar testes
npm run test:ui      # Testes com interface
npm run lint         # Verificar código
```

## 📚 Documentação Completa

- `README.md` - Documentação principal
- `SETUP.md` - Guia detalhado de configuração
- `MONETIZATION.md` - Estratégias de monetização

## ⚠️ Problemas Comuns

**Erro de API Key**: Verifique se o arquivo `.env` existe e tem a chave correta

**Banco não funciona**: Use um navegador moderno (Chrome, Firefox, Edge)

**Perguntas não geram**: Verifique conexão com internet e se não excedeu o limite gratuito (1,500 requests/dia)
