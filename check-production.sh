#!/bin/bash

# ============================================
# 生产环境启动检查脚本
# ============================================

echo "🔍 检查 UniqueNames.net 生产环境状态..."
echo ""

PROJECT_DIR="/root/projects/uniquenames"
cd "$PROJECT_DIR" || exit 1

# 1. 检查前端构建产物
echo "📦 [1/5] 前端构建产物"
if [ -d "frontend/dist" ] && [ -f "frontend/dist/index.html" ]; then
    DIST_SIZE=$(du -sh frontend/dist | cut -f1)
    FILE_COUNT=$(find frontend/dist -type f | wc -l)
    echo "  ✅ frontend/dist/ 存在"
    echo "  📊 大小: $DIST_SIZE, 文件数: $FILE_COUNT"
else
    echo "  ❌ frontend/dist/ 不存在或不完整"
    echo "  💡 运行: cd frontend && npm run build"
    exit 1
fi

echo ""

# 2. 检查后端服务
echo "🚀 [2/5] 后端服务 (PM2)"
if pm2 show uniquenames-api > /dev/null 2>&1; then
    PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="uniquenames-api") | .pm2_env.status')
    PM2_CWD=$(pm2 jlist | jq -r '.[] | select(.name=="uniquenames-api") | .pm2_env.pm_cwd')
    PM2_PORT=$(lsof -i :3001 -sTCP:LISTEN -t 2>/dev/null)
    
    if [ "$PM2_STATUS" == "online" ]; then
        echo "  ✅ PM2 进程运行中"
        echo "  📂 工作目录: $PM2_CWD"
        
        if [ -n "$PM2_PORT" ]; then
            echo "  🌐 端口 3001: ✅ 监听中"
        else
            echo "  ⚠️  端口 3001: 未监听（检查是否启动失败）"
        fi
    else
        echo "  ❌ PM2 进程状态: $PM2_STATUS"
        exit 1
    fi
else
    echo "  ❌ PM2 进程不存在"
    echo "  💡 运行: pm2 start backend/server.js --name uniquenames-api --cwd backend/"
    exit 1
fi

echo ""

# 3. 检查 Nginx 配置
echo "⚙️  [3/5] Nginx 配置"
if [ -f "/etc/nginx/sites-available/uniquenames.net" ]; then
    echo "  ✅ 配置文件存在"
    
    # 检查是否是开发模式（代理到 5173）
    if grep -q "proxy_pass.*:5173" /etc/nginx/sites-available/uniquenames.net; then
        echo "  ⚠️  警告：配置仍在代理到 Vite 开发服务器（端口 5173）"
        echo "  💡 这不是生产配置！应该直接服务 frontend/dist/"
        echo "  💡 运行: sudo cp nginx.production.conf /etc/nginx/sites-available/uniquenames.net"
        echo "  💡 然后: sudo nginx -t && sudo nginx -s reload"
    else
        echo "  ✅ 配置正确（直接服务静态文件或已代理后端）"
    fi
    
    # 测试配置
    if sudo nginx -t > /dev/null 2>&1; then
        echo "  ✅ Nginx 配置语法正确"
    else
        echo "  ❌ Nginx 配置语法错误"
        sudo nginx -t
        exit 1
    fi
else
    echo "  ❌ Nginx 配置文件不存在"
    exit 1
fi

echo ""

# 4. 检查端口占用
echo "🌐 [4/5] 端口占用"
PORT_80=$(sudo lsof -i :80 -sTCP:LISTEN -t 2>/dev/null)
PORT_443=$(sudo lsof -i :443 -sTCP:LISTEN -t 2>/dev/null)
PORT_3001=$(lsof -i :3001 -sTCP:LISTEN -t 2>/dev/null)
PORT_5173=$(lsof -i :5173 -sTCP:LISTEN -t 2>/dev/null)

if [ -n "$PORT_80" ]; then
    echo "  ✅ 端口 80 (HTTP): 监听中"
else
    echo "  ⚠️  端口 80 (HTTP): 未监听"
fi

if [ -n "$PORT_443" ]; then
    echo "  ✅ 端口 443 (HTTPS): 监听中"
else
    echo "  ⚠️  端口 443 (HTTPS): 未监听"
fi

if [ -n "$PORT_3001" ]; then
    echo "  ✅ 端口 3001 (后端 API): 监听中"
else
    echo "  ❌ 端口 3001 (后端 API): 未监听"
fi

if [ -n "$PORT_5173" ]; then
    echo "  ⚠️  端口 5173 (Vite Dev): 正在运行"
    echo "  💡 生产环境不应该运行 Vite 开发服务器！"
    echo "  💡 运行: pkill -f vite"
else
    echo "  ✅ 端口 5173 (Vite Dev): 未运行（正确）"
fi

echo ""

# 5. 权限检查（新增）
echo "🔐 [5/6] 权限检查"
ROOT_PERM=$(stat -c "%a" /root)
echo "  → /root/ 权限: $ROOT_PERM"

if [ "$ROOT_PERM" = "750" ] || [ "$ROOT_PERM" = "755" ]; then
    echo "  ✅ /root/ 有 o+x 权限（Nginx 可穿过）"
else
    echo "  ❌ /root/ 权限不足（Nginx 无法访问）"
    echo "  💡 运行: ./setup-production-permissions.sh"
fi

# 测试 www-data 是否可以读取 index.html
NGINX_USER=$(ps aux | grep 'nginx: worker process' | grep -v grep | awk '{print $1}' | head -1)
NGINX_USER=${NGINX_USER:-www-data}

if [ -f "frontend/dist/index.html" ]; then
    if sudo -u "$NGINX_USER" test -r "frontend/dist/index.html" 2>/dev/null; then
        echo "  ✅ $NGINX_USER 用户可以读取 index.html"
    else
        echo "  ❌ $NGINX_USER 用户无法读取 index.html"
        echo "  💡 运行: ./setup-production-permissions.sh"
    fi
fi

echo ""

# 6. 环境变量检查
echo "🔐 [5/5] 环境变量"
if [ -f "backend/.env" ]; then
    echo "  ✅ backend/.env 存在"
    
    # 检查关键变量（不显示值）
    if grep -q "OPENROUTER_API_KEY=" backend/.env; then
        echo "  ✅ OPENROUTER_API_KEY 已配置"
    else
        echo "  ❌ OPENROUTER_API_KEY 未配置"
    fi
    
    if grep -q "SUPABASE_URL=" backend/.env; then
        echo "  ✅ SUPABASE_URL 已配置"
    else
        echo "  ⚠️  SUPABASE_URL 未配置"
    fi
else
    echo "  ❌ backend/.env 不存在"
fi

echo ""
echo "=========================================="
echo ""

# 总结
if [ -z "$PORT_5173" ] && [ -n "$PORT_80" ] && [ -n "$PORT_3001" ]; then
    echo "✅ 生产环境状态：正常"
    echo ""
    echo "🌐 访问: https://uniquenames.net"
    echo "📊 监控: pm2 logs uniquenames-api"
else
    echo "⚠️  生产环境状态：需要调整"
    echo ""
    if [ -n "$PORT_5173" ]; then
        echo "🔧 建议："
        echo "  1. 停止 Vite 开发服务器: pkill -f vite"
        echo "  2. 更新 Nginx 配置: sudo cp nginx.production.conf /etc/nginx/sites-available/uniquenames.net"
        echo "  3. 重载 Nginx: sudo nginx -t && sudo nginx -s reload"
    fi
fi

echo ""

