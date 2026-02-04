# Como Obter e Configurar a Chave Gemini (GRATUITA)

## Passo a Passo Detalhado

### 1. Obter a Chave da API

1. **Acesse o Google AI Studio:**
   - Abra seu navegador
   - Vá para: https://aistudio.google.com/app/apikey
   - Ou pesquise: "Google AI Studio API key"

2. **Faça Login:**
   - Use sua conta Google (qualquer conta Google funciona)
   - Se não tiver conta, crie uma gratuitamente

3. **Criar a Chave:**
   - Clique no botão **"Create API Key"** ou **"Get API Key"**
   - Se pedir para criar um projeto, escolha "Create API Key in new project"
   - A chave será gerada automaticamente

4. **Copiar a Chave:**
   - A chave aparecerá na tela (algo como: `AIzaSy...`)
   - **COPIE IMEDIATAMENTE** - você só verá uma vez!
   - Se perder, pode criar uma nova

### 2. Configurar no Projeto

#### Opção A: Editar Manualmente

1. Abra o arquivo `.env` na pasta do projeto:
   ```
   C:\Users\NTConsult\Documents\Projetos\.env
   ```

2. Encontre a linha:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Substitua `your_gemini_api_key_here` pela sua chave real:
   ```
   VITE_GEMINI_API_KEY=AIzaSySuaChaveRealAqui123456789
   ```

4. **IMPORTANTE:** Não deixe espaços antes ou depois do `=`
   - ✅ Correto: `VITE_GEMINI_API_KEY=AIzaSy...`
   - ❌ Errado: `VITE_GEMINI_API_KEY = AIzaSy...`

5. Salve o arquivo

#### Opção B: Usar PowerShell (Mais Rápido)

Abra o PowerShell na pasta do projeto e execute:

```powershell
# Substitua SUA_CHAVE_AQUI pela chave real
$chave = "SUA_CHAVE_AQUI"
(Get-Content .env) -replace 'VITE_GEMINI_API_KEY=your_gemini_api_key_here', "VITE_GEMINI_API_KEY=$chave" | Set-Content .env
```

### 3. Reiniciar o Servidor

**IMPORTANTE:** Após alterar o `.env`, você precisa reiniciar o servidor:

1. Pare o servidor atual (Ctrl+C no terminal onde está rodando)
2. Execute novamente:
   ```powershell
   npm run dev
   ```

Ou use o script:
```powershell
.\rodar.ps1
```

### 4. Verificar se Funcionou

1. Acesse: http://localhost:3000/
2. Vá em "Configurações"
3. Adicione um assunto (ex: "JavaScript")
4. Se não aparecer erro, está funcionando! ✅

## Limites Gratuitos

- **1,500 requisições por dia**
- **1 milhão de tokens por minuto**
- **Totalmente gratuito** - sem cartão de crédito necessário

Isso é mais que suficiente para gerar milhares de perguntas!

## Problemas Comuns

### Erro: "Chave da API inválida"
- Verifique se copiou a chave completa (começa com `AIzaSy`)
- Verifique se não há espaços extras no `.env`
- Certifique-se de que reiniciou o servidor após alterar o `.env`

### Erro: "API key não configurada"
- Verifique se o arquivo `.env` existe na pasta do projeto
- Verifique se a variável está escrita exatamente: `VITE_GEMINI_API_KEY`
- Reinicie o servidor

### A chave não funciona
- Crie uma nova chave no Google AI Studio
- Verifique se não excedeu o limite diário (1,500 requests)
- Aguarde alguns minutos e tente novamente

## Segurança

⚠️ **NUNCA compartilhe sua chave da API!**
- Não commite o arquivo `.env` no Git (já está no .gitignore)
- Não compartilhe a chave publicamente
- Se compartilhar acidentalmente, crie uma nova chave imediatamente
