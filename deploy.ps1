# ===================================
# UniqueNames.net 本地构建脚本 (Windows)
# ===================================

Write-Host ""
Write-Host "🚀 ===== UniqueNames.net 本地构建 =====" -ForegroundColor Cyan
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ 错误：请在项目根目录执行此脚本！" -ForegroundColor Red
    exit 1
}

# 1. 构建前端
Write-Host "📦 [1/3] 构建前端..." -ForegroundColor Yellow
Set-Location frontend
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "前端构建失败" }
    Write-Host "✅ 前端构建完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 前端构建失败：$_" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# 2. 构建后端（如果有 TypeScript）
Write-Host ""
Write-Host "📦 [2/3] 检查后端构建..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "tsconfig.json") {
    Write-Host "   检测到 TypeScript 配置，执行构建..." -ForegroundColor Gray
    try {
        npm run build
        Write-Host "✅ 后端构建完成" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  后端构建跳过（可能不需要）" -ForegroundColor Yellow
    }
} else {
    Write-Host "   后端无需构建（纯 JavaScript）" -ForegroundColor Gray
}
Set-Location ..

# 3. 显示构建结果
Write-Host ""
Write-Host "📊 [3/3] 构建结果：" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "frontend/dist") {
    $frontendSize = (Get-ChildItem -Recurse frontend/dist | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   ✅ 前端产物: frontend/dist/ ($([math]::Round($frontendSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "   ❌ 前端产物未找到！" -ForegroundColor Red
    exit 1
}

if (Test-Path "backend/dist") {
    Write-Host "   ✅ 后端产物: backend/dist/" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  后端产物: backend/*.js (无需编译)" -ForegroundColor Cyan
}

# 4. 完成
Write-Host ""
Write-Host "🎉 ===== 构建完成！=====" -ForegroundColor Green
Write-Host ""
Write-Host "📝 下一步：" -ForegroundColor Cyan
Write-Host "   1. 本地测试: npm run dev" -ForegroundColor Gray
Write-Host "   2. 提交代码: git add . && git commit -m 'build: 生产构建' && git push" -ForegroundColor Gray
Write-Host "   3. 服务器部署: ssh root@your-server 'cd ~/projects/uniquenames && ./deploy.sh'" -ForegroundColor Gray
Write-Host ""

