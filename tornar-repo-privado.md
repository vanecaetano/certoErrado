# 🔒 Como Tornar o Repositório Privado

## Método 1: Via GitHub Web (Mais Fácil)

1. Acesse seu repositório no GitHub
2. Clique em **Settings** (Configurações) no menu superior
3. Role até o final da página
4. Na seção **Danger Zone** (Zona de Perigo)
5. Clique em **Change visibility** (Mudar visibilidade)
6. Selecione **Make private** (Tornar privado)
7. Digite o nome do repositório para confirmar
8. Clique em **I understand, change repository visibility**

## Método 2: Via GitHub CLI (Se já tiver instalado)

```powershell
# Verificar se tem GitHub CLI instalado
gh --version

# Se tiver instalado, execute:
gh repo edit --visibility private
```

## Método 3: Instalar GitHub CLI e executar

```powershell
# Instalar GitHub CLI via winget
winget install --id GitHub.cli

# Fazer login
gh auth login

# Tornar o repo privado
gh repo edit --visibility private
```

---

## ⚠️ IMPORTANTE: Depois de tornar privado

Mesmo tornando o repositório privado, as chaves que estavam expostas **AINDA ESTÃO COMPROMETIDAS** pois já foram públicas!

### ✅ Ainda é necessário:

1. **REVOGAR as chaves antigas** (Gemini e Firebase)
2. **GERAR novas chaves**
3. **Atualizar .env local** com as novas chaves

---

## 🔐 Alternativa: Criar Novo Repositório Privado

Se preferir começar do zero com um repo privado:

```powershell
# 1. Remover origin atual
git remote remove origin

# 2. Criar novo repo privado no GitHub (via web ou CLI):
gh repo create CertoErrado --private --source=.

# 3. Push inicial
git push -u origin main
```

---

**Lembre-se: Repositório privado NÃO protege chaves já expostas!**
**Você DEVE revogar e regerar as chaves de API!**
