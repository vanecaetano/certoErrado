# Script para tornar repositório privado usando GitHub CLI

Write-Host "🔒 Tornando repositório PRIVADO..." -ForegroundColor Cyan
Write-Host ""

# Verificar se GitHub CLI está instalado
Write-Host "📋 Verificando GitHub CLI..." -ForegroundColor Cyan
try {
    $ghVersion = gh --version
    Write-Host "✅ GitHub CLI encontrado!" -ForegroundColor Green
    Write-Host $ghVersion[0] -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ GitHub CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar, execute:" -ForegroundColor Yellow
    Write-Host "  winget install --id GitHub.cli" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou siga as instruções em: tornar-repo-privado.md" -ForegroundColor Yellow
    exit 1
}

# Verificar autenticação
Write-Host "📋 Verificando autenticação..." -ForegroundColor Cyan
try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Não autenticado no GitHub!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Execute primeiro:" -ForegroundColor Yellow
        Write-Host "  gh auth login" -ForegroundColor White
        Write-Host ""
        exit 1
    }
    Write-Host "✅ Autenticado no GitHub!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Erro ao verificar autenticação!" -ForegroundColor Red
    exit 1
}

# Confirmar ação
Write-Host "⚠️  Isso vai tornar o repositório PRIVADO." -ForegroundColor Yellow
Write-Host "Apenas você e colaboradores autorizados poderão vê-lo." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Deseja continuar? (Digite 'SIM' para confirmar)"

if ($confirm -ne 'SIM') {
    Write-Host "Operação cancelada." -ForegroundColor Yellow
    exit
}

# Tornar repositório privado
Write-Host ""
Write-Host "🔒 Alterando visibilidade para PRIVADO..." -ForegroundColor Cyan
try {
    gh repo edit --visibility private
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Repositório agora é PRIVADO! 🎉" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔐 Próximos passos IMPORTANTES:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. ⚠️  REVOGUE as chaves antigas que foram expostas:" -ForegroundColor Yellow
        Write-Host "   - Gemini API: https://aistudio.google.com/app/apikey" -ForegroundColor White
        Write-Host "   - Firebase: https://console.firebase.google.com/" -ForegroundColor White
        Write-Host ""
        Write-Host "2. 🔑 Gere NOVAS chaves" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "3. 📝 Atualize seu .env local com as novas chaves" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  Lembre-se: Tornar privado NÃO protege chaves já expostas!" -ForegroundColor Red
        Write-Host "As chaves antigas DEVEM ser revogadas!" -ForegroundColor Red
    } else {
        Write-Host ""
        Write-Host "❌ Erro ao alterar visibilidade!" -ForegroundColor Red
        Write-Host "Tente manualmente pelo GitHub: Settings > Danger Zone > Change visibility" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erro: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente manualmente:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://github.com/SEU_USUARIO/CertoErrado/settings" -ForegroundColor White
    Write-Host "2. Role até 'Danger Zone'" -ForegroundColor White
    Write-Host "3. Clique em 'Change visibility'" -ForegroundColor White
    Write-Host "4. Selecione 'Make private'" -ForegroundColor White
}
