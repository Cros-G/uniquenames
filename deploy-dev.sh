#!/bin/bash

# ============================================
# Uniquenames.net 开发模式部署脚本
# 用法：在服务器上执行 ./deploy-dev.sh
# ============================================

set -e

echo "🔧 开始部署（开发模式）..."

PROJECT_DIR="/root/projects/uniquenames"
cd $PROJECT_DIR

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull

# 2. 备份配置
echo "💾 备份配置..."
if [ -f ".env" ]; then cp .env .env.backup; fi
if [ -f "frontend/.env.local" ]; then cp frontend/.env.local frontend/.env.local.backup; fi

# 3. 安装依赖
echo "📦 安装依赖..."
cd backend
npm install
npm rebuild better-sqlite3

cd ../frontend
npm install

# 4. 恢复配置
echo "🔄 恢复配置..."
cd $PROJECT_DIR
if [ -f ".env.backup" ]; then cp .env.backup .env && rm .env.backup; fi
if [ -f "frontend/.env.local.backup" ]; then cp frontend/.env.local.backup frontend/.env.local && rm frontend/.env.local.backup; fi

# 5. 停止旧服务
echo "🛑 停止旧服务..."
pm2 delete uniquenames-frontend 2>/dev/null || true
pm2 delete uniquenames-api 2>/dev/null || true

# 6. 启动服务（开发模式）
echo "🚀 启动服务..."
cd $PROJECT_DIR
pm2 start npm --name uniquenames-dev -- run dev
pm2 save

echo ""
echo "🎉 开发模式部署完成！"
echo "🌐 访问: https://uniquenames.net"
echo "📊 查看日志: pm2 logs uniquenames-dev"

