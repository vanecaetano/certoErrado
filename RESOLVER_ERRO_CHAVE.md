# 🔧 Como Resolver o Erro da Chave da API

## ⚡ Solução Rápida (3 Passos)

### 1️⃣ Obter a Chave (2 minutos)

1. Abra: **https://aistudio.google.com/app/apikey**
2. Faça login com Google
3. Clique em **"Create API Key"**
4. **COPIE** a chave (começa com `AIzaSy...`)

### 2️⃣ Configurar no Projeto

**Opção A - Script Automático (Mais Fácil):**
```powershell
cd "C:\Users\NTConsult\Documents\Projetos"
.\configurar-chave.ps1
```
Cole a chave quando solicitado.

**Opção B - Manual:**
1. Abra o arquivo: `C:\Users\NTConsult\Documents\Projetos\.env`
2. Encontre: `VITE_GEMINI_API_KEY=your_gemini_api_key_here`
3. Substitua por: `VITE_GEMINI_API_KEY=SUA_CHAVE_AQUI`
4. Salve o arquivo

### 3️⃣ Reiniciar o Servidor

**IMPORTANTE:** Após alterar o `.env`, você DEVE reiniciar:

1. Pare o servidor atual: **Ctrl+C** no terminal
2. Execute novamente:
   ```powershell
   npm run dev
   ```

## ✅ Verificar se Funcionou

1. Acesse: http://localhost:3000/
2. Vá em **"Configurações"**
3. Adicione um assunto (ex: "JavaScript")
4. Se não aparecer erro = **SUCESSO!** ✅

## 📝 Exemplo de Arquivo .env Correto

```env
VITE_GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456789
```

⚠️ **NÃO deixe espaços:** `VITE_GEMINI_API_KEY = chave` ❌  
✅ **Correto:** `VITE_GEMINI_API_KEY=chave`

## 🆘 Ainda com Problemas?

- Verifique se copiou a chave completa
- Certifique-se de que reiniciou o servidor
- Veja `COMO_OBTER_CHAVE_GEMINI.md` para mais detalhes
