#!/bin/bash

# ============================================
# Uniquenames.net 部署脚本
# 用法：在服务器上执行 ./deploy.sh
# ============================================

set -e  # 遇到错误立即停止

echo "🚀 开始部署 Uniquenames.net..."

# 配置
PROJECT_DIR="/root/projects/uniquenames"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
cd $PROJECT_DIR
git pull

# 2. 初始化环境特定配置（首次部署）
echo "🔧 检查环境配置..."
if [ ! -f "nginx.conf" ] && [ -f "nginx.conf.example" ]; then
    echo "  → 初始化 nginx.conf（从模板）"
    cp nginx.conf.example nginx.conf
    echo "  ⚠️  请根据实际环境修改 nginx.conf！"
fi

# 3. 备份关键配置（避免被覆盖）
echo "💾 备份配置文件..."
if [ -f ".env" ]; then
    cp .env .env.backup
fi
if [ -f "backend/.env" ]; then
    cp backend/.env backend/.env.backup
fi
if [ -f "frontend/.env.local" ]; then
    cp frontend/.env.local frontend/.env.local.backup
fi
if [ -f "nginx.conf" ]; then
    cp nginx.conf nginx.conf.backup
fi
if [ -f "frontend/vite.config.ts" ]; then
    cp frontend/vite.config.ts frontend/vite.config.ts.backup
fi

# 4. 安装后端依赖（只安装新的）
echo "📦 安装后端依赖..."
cd $BACKEND_DIR
npm install

# 5. 重新编译 better-sqlite3（关键！）
echo "🔨 重新编译 better-sqlite3..."
npm rebuild better-sqlite3

# 6. 安装前端依赖
echo "📦 安装前端依赖..."
cd $FRONTEND_DIR
npm install

# 7. 构建前端（生产环境）
echo "🏗️ 构建前端..."
npm run build

# 8. 恢复配置文件（如果被覆盖）
echo "🔄 恢复配置文件..."
cd $PROJECT_DIR
if [ -f ".env.backup" ]; then
    cp .env.backup .env
    rm .env.backup
fi
if [ -f "backend/.env.backup" ]; then
    cp backend/.env.backup backend/.env
    rm backend/.env.backup
fi
if [ -f "frontend/.env.local.backup" ]; then
    cp frontend/.env.local.backup frontend/.env.local
    rm frontend/.env.local.backup
fi
if [ -f "nginx.conf.backup" ]; then
    cp nginx.conf.backup nginx.conf
    rm nginx.conf.backup
    echo "  ✅ nginx.conf 已恢复"
fi
if [ -f "frontend/vite.config.ts.backup" ]; then
    cp frontend/vite.config.ts.backup frontend/vite.config.ts
    rm frontend/vite.config.ts.backup
    echo "  ✅ vite.config.ts 已恢复"
fi

# 9. 重启后端服务
echo "🔄 重启后端服务..."
pm2 restart uniquenames-api || pm2 start $BACKEND_DIR/server.js --name uniquenames-api
pm2 save

# 10. 重载 Nginx（如果 nginx.conf 存在）
echo "🔄 重载 Nginx..."
if [ -f "nginx.conf" ]; then
    sudo nginx -t && sudo nginx -s reload
else
    echo "  ⚠️  nginx.conf 不存在，跳过重载"
fi

# 11. 检查服务状态
echo "✅ 检查服务状态..."
pm2 status

echo ""
echo "🎉 部署完成！"
echo "🌐 访问: https://uniquenames.net"
echo ""
echo "📊 查看日志: pm2 logs uniquenames-api"

