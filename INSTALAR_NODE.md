# Como Instalar Node.js no Windows

## Opção 1: Instalação Direta (Recomendada)

1. **Baixe o Node.js:**
   - Acesse: https://nodejs.org/
   - Baixe a versão LTS (Long Term Support)
   - Escolha o instalador Windows (.msi)

2. **Instale:**
   - Execute o arquivo baixado
   - Siga o assistente de instalação
   - **IMPORTANTE**: Marque a opção "Add to PATH" durante a instalação

3. **Verifique a instalação:**
   - Abra um novo PowerShell ou CMD
   - Execute: `node --version`
   - Execute: `npm --version`

## Opção 2: Usando Chocolatey (Se já tiver instalado)

```powershell
choco install nodejs-lts
```

## Opção 3: Usando Winget (Windows 11)

```powershell
winget install OpenJS.NodeJS.LTS
```

## Após Instalar

1. **Feche e reabra o terminal** (importante!)
2. Navegue até a pasta do projeto:
   ```powershell
   cd "C:\Users\NTConsult\Documents\Projetos"
   ```
3. Instale as dependências:
   ```powershell
   npm install
   ```
4. Crie o arquivo `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
5. Edite o `.env` e adicione sua chave Gemini (obtenha em https://aistudio.google.com/app/apikey)
6. Execute o projeto:
   ```powershell
   npm run dev
   ```

## Verificar se Node.js está instalado

Execute no PowerShell:
```powershell
node --version
npm --version
```

Se aparecer um número de versão, está instalado! Se não, siga os passos acima.
