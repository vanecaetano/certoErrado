# Script para configurar a chave Gemini facilmente

Write-Host "=== Configurador de Chave Gemini ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
}

Write-Host "Para obter sua chave gratuita:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
Write-Host "2. Faça login com sua conta Google" -ForegroundColor Cyan
Write-Host "3. Clique em 'Create API Key'" -ForegroundColor Cyan
Write-Host "4. Copie a chave gerada" -ForegroundColor Cyan
Write-Host ""

$chave = Read-Host "Cole sua chave Gemini aqui (ou pressione Enter para pular)"

if ([string]::IsNullOrWhiteSpace($chave)) {
    Write-Host ""
    Write-Host "Nenhuma chave fornecida. O arquivo .env não foi alterado." -ForegroundColor Yellow
    Write-Host "Você pode editar manualmente o arquivo .env depois." -ForegroundColor Yellow
    exit 0
}

# Validar formato básico da chave
if (-not $chave.StartsWith("AIzaSy")) {
    Write-Host ""
    Write-Host "AVISO: A chave não parece estar no formato correto." -ForegroundColor Yellow
    Write-Host "Chaves Gemini geralmente começam com 'AIzaSy'" -ForegroundColor Yellow
    $continuar = Read-Host "Deseja continuar mesmo assim? (S/N)"
    if ($continuar -ne "S" -and $continuar -ne "s") {
        Write-Host "Operação cancelada." -ForegroundColor Red
        exit 1
    }
}

# Atualizar o arquivo .env
Write-Host ""
Write-Host "Atualizando arquivo .env..." -ForegroundColor Yellow

$conteudo = Get-Content .env -Raw
$conteudo = $conteudo -replace 'VITE_GEMINI_API_KEY=.*', "VITE_GEMINI_API_KEY=$chave"

Set-Content .env -Value $conteudo -NoNewline

Write-Host "Chave configurada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "- Reinicie o servidor para aplicar as mudanças" -ForegroundColor Yellow
Write-Host "- Se o servidor estiver rodando, pressione Ctrl+C e execute: npm run dev" -ForegroundColor Yellow
Write-Host ""
