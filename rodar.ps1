# Script para rodar o aplicativo Certo ou Errado?

Write-Host "=== Certo ou Errado? - Iniciando Aplicativo ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js esta instalado
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Host "Node.js nao encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale o Node.js:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Baixe a versao LTS" -ForegroundColor Yellow
    Write-Host "3. Instale e marque 'Add to PATH'" -ForegroundColor Yellow
    Write-Host "4. Feche e reabra este terminal" -ForegroundColor Yellow
    Write-Host "5. Execute este script novamente" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou veja o arquivo INSTALAR_NODE.md para mais detalhes" -ForegroundColor Cyan
    exit 1
}

Write-Host "Node.js encontrado: $(node --version)" -ForegroundColor Green
Write-Host "npm encontrado: $(npm --version)" -ForegroundColor Green
Write-Host ""

# Navegar para o diretorio do projeto
$projectPath = "C:\Users\NTConsult\Documents\Projetos"
Set-Location $projectPath

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao instalar dependencias!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependencias instaladas!" -ForegroundColor Green
    Write-Host ""
}

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Arquivo .env nao encontrado!" -ForegroundColor Yellow
    Write-Host "Criando .env a partir do .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host ""
    Write-Host "IMPORTANTE: Edite o arquivo .env e adicione sua chave Gemini!" -ForegroundColor Yellow
    Write-Host "   Obtenha em: https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pressione qualquer tecla para continuar..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
}

# Verificar se a chave esta configurada
$envContent = Get-Content .env -Raw
if ($envContent -match "your_gemini_api_key_here") {
    Write-Host "AVISO: Chave da API nao configurada!" -ForegroundColor Yellow
    Write-Host "   O aplicativo funcionara, mas nao podera gerar perguntas." -ForegroundColor Yellow
    Write-Host "   Configure VITE_GEMINI_API_KEY no arquivo .env" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
Write-Host "   O aplicativo estara disponivel em: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

# Executar o servidor
npm run dev
