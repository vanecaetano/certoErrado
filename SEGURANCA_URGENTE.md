# 🚨 SEGURANÇA CRÍTICA - AÇÃO IMEDIATA NECESSÁRIA 🚨

## Suas chaves de API estão EXPOSTAS publicamente!

### ⚠️ PASSO 1: REVOGAR TODAS AS CHAVES IMEDIATAMENTE

#### 1. Revogar Google Gemini API Key:
- Acesse: https://aistudio.google.com/app/apikey
- Encontre a chave: `AIzaSyB9bbcVx6SNnBvD5N463kL454Tc2I-it4Q`
- **DELETE/REVOKE** esta chave
- Gere uma NOVA chave

#### 2. Revogar Firebase (CRÍTICO):
- Acesse: https://console.firebase.google.com/project/certo-errado-quiz/settings/general
- Vá em "Configurações do projeto" > "Geral"
- **REDEFINA** todas as credenciais do Firebase
- Ou crie um NOVO projeto Firebase (recomendado)

### 🔒 PASSO 2: REMOVER .env DO HISTÓRICO DO GIT

Execute estes comandos no terminal (PowerShell):

```powershell
# 1. Remover .env do histórico (use git bash ou instale git-filter-repo)
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all

# OU use git-filter-repo (recomendado):
# pip install git-filter-repo
# git filter-repo --invert-paths --path .env

# 2. Forçar push para sobrescrever o histórico
git push origin --force --all

# 3. Adicionar .env ao .gitignore está confirmado ✓
```

### ✅ PASSO 3: CRIAR NOVO .env COM NOVAS CHAVES

```powershell
# Copie o .env.example e adicione as NOVAS chaves
Copy-Item .env.example .env
# Edite o .env com as novas chaves geradas
```

### 📝 PASSO 4: VERIFICAR

```powershell
# Confirme que .env não está rastreado
git status

# .env NÃO deve aparecer na lista
```

---

## ⚠️ POR QUE ISSO É PERIGOSO?

1. **Gemini API**: Alguém pode usar sua quota gratuitaabusivamente
2. **Firebase**: Acesso completo ao seu banco de dados, autenticação e storage
3. **Custos**: Podem gerar cobranças inesperadas se ultrapassarem limites gratuitos
4. **Dados**: Possível roubo ou modificação de dados

---

## 🔐 BOAS PRÁTICAS PARA O FUTURO

1. ✅ `.env` está no `.gitignore` (já configurado)
2. ✅ Use `.env.example` como template (já existe)
3. ✅ **NUNCA** commite arquivos `.env`
4. ✅ Use variáveis de ambiente no servidor de produção (Vercel, Netlify, etc.)
5. ✅ Adicione regras de segurança no Firebase Console

---

**Execute essas ações AGORA para proteger seu projeto!** 🛡️
