# Script para remover .env do histórico do Git
# CUIDADO: Isso reescreve o histórico do Git!

Write-Host "🚨 ATENÇÃO: Este script vai reescrever o histórico do Git!" -ForegroundColor Red
Write-Host "Isso removerá o arquivo .env de todos os commits." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Deseja continuar? (Digite 'SIM' para confirmar)"

if ($confirm -ne 'SIM') {
    Write-Host "Operação cancelada." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "📋 Passo 1: Backup do repositório..." -ForegroundColor Cyan
$backupPath = "..\CertoErrado-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -Path . -Destination $backupPath -Recurse -Force
Write-Host "✅ Backup criado em: $backupPath" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 2: Removendo .env do histórico..." -ForegroundColor Cyan
Write-Host "⚠️  Isso pode demorar alguns minutos..." -ForegroundColor Yellow

# Método usando git filter-branch
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env .env.local .env.production" --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ .env removido do histórico!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao remover .env. Verifique os logs acima." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Passo 3: Limpando referências..." -ForegroundColor Cyan
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 4: Próximos passos MANUAIS:" -ForegroundColor Cyan
Write-Host "1. ⚠️  REVOGUE as chaves de API antigas (Gemini e Firebase)" -ForegroundColor Yellow
Write-Host "2. 🔑 Gere NOVAS chaves de API" -ForegroundColor Yellow
Write-Host "3. 📝 Atualize seu arquivo .env com as NOVAS chaves" -ForegroundColor Yellow
Write-Host "4. 🚀 Execute: git push origin --force --all" -ForegroundColor Yellow
Write-Host "5. 🚀 Execute: git push origin --force --tags" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANTE: O push --force sobrescreverá o histórico remoto!" -ForegroundColor Red
Write-Host ""

$pushNow = Read-Host "Deseja fazer o push --force agora? (Digite 'SIM' para confirmar)"
if ($pushNow -eq 'SIM') {
    Write-Host ""
    Write-Host "🚀 Fazendo push forçado..." -ForegroundColor Cyan
    git push origin --force --all
    git push origin --force --tags
    Write-Host "✅ Push concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Processo completo! Não esqueça de revogar as chaves antigas!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Lembre-se de executar:" -ForegroundColor Yellow
    Write-Host "   git push origin --force --all" -ForegroundColor White
    Write-Host "   git push origin --force --tags" -ForegroundColor White
}
