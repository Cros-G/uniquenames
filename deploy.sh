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

# 1. 在 git pull 前备份关键文件（防止被删除）
echo "🛡️ 备份关键文件（防止 git pull 删除）..."
cd $PROJECT_DIR

# 创建临时备份目录
BACKUP_TEMP="/tmp/uniquenames_deploy_backup_$$"
mkdir -p "$BACKUP_TEMP"

# 备份 .env 文件
if [ -f "backend/.env" ]; then
    cp backend/.env "$BACKUP_TEMP/backend.env"
    echo "  ✅ 已备份 backend/.env"
fi
if [ -f "frontend/.env.local" ]; then
    cp frontend/.env.local "$BACKUP_TEMP/frontend.env.local"
    echo "  ✅ 已备份 frontend/.env.local"
fi

# 备份数据库（最重要！）
if [ -f "backend/db/database.db" ]; then
    cp backend/db/database.db "$BACKUP_TEMP/database.db"
    echo "  ✅ 已备份 database.db"
fi

# 备份 nginx 配置
if [ -f "nginx.conf" ]; then
    cp nginx.conf "$BACKUP_TEMP/nginx.conf"
    echo "  ✅ 已备份 nginx.conf"
fi

# 备份 vite 配置
if [ -f "frontend/vite.config.ts" ]; then
    cp frontend/vite.config.ts "$BACKUP_TEMP/vite.config.ts"
    echo "  ✅ 已备份 vite.config.ts"
fi

echo ""

# 2. 拉取最新代码
echo "📥 拉取最新代码..."
git pull

echo ""

# 3. 检查并恢复被 git pull 删除的文件
echo "🔍 检查关键文件是否被删除..."

NEED_RESTORE=false

if [ ! -f "backend/.env" ] && [ -f "$BACKUP_TEMP/backend.env" ]; then
    echo "  ⚠️  backend/.env 被删除，正在恢复..."
    cp "$BACKUP_TEMP/backend.env" backend/.env
    NEED_RESTORE=true
fi

if [ ! -f "frontend/.env.local" ] && [ -f "$BACKUP_TEMP/frontend.env.local" ]; then
    echo "  ⚠️  frontend/.env.local 被删除，正在恢复..."
    cp "$BACKUP_TEMP/frontend.env.local" frontend/.env.local
    NEED_RESTORE=true
fi

if [ ! -f "backend/db/database.db" ] && [ -f "$BACKUP_TEMP/database.db" ]; then
    echo "  🚨 database.db 被删除，正在恢复..."
    cp "$BACKUP_TEMP/database.db" backend/db/database.db
    NEED_RESTORE=true
fi

if [ ! -f "nginx.conf" ] && [ -f "$BACKUP_TEMP/nginx.conf" ]; then
    echo "  ⚠️  nginx.conf 被删除，正在恢复..."
    cp "$BACKUP_TEMP/nginx.conf" nginx.conf
    NEED_RESTORE=true
fi

if [ ! -f "frontend/vite.config.ts" ] && [ -f "$BACKUP_TEMP/vite.config.ts" ]; then
    echo "  ⚠️  vite.config.ts 被删除，正在恢复..."
    cp "$BACKUP_TEMP/vite.config.ts" frontend/vite.config.ts
    NEED_RESTORE=true
fi

if [ "$NEED_RESTORE" = true ]; then
    echo "  ✅ 关键文件已从备份恢复"
else
    echo "  ✅ 所有关键文件完好"
fi

echo ""

# 4. 初始化环境特定配置（首次部署）
echo "🔧 检查环境配置..."
if [ ! -f "nginx.conf" ] && [ -f "nginx.conf.example" ]; then
    echo "  → 初始化 nginx.conf（从模板）"
    cp nginx.conf.example nginx.conf
    echo "  ⚠️  请根据实际环境修改 nginx.conf！"
fi

# 5. 安装后端依赖（只安装新的）
echo "📦 安装后端依赖..."
cd $BACKEND_DIR
npm install

# 6. 重新编译 better-sqlite3（关键！）
echo "🔨 重新编译 better-sqlite3..."
npm rebuild better-sqlite3

# 7. 安装前端依赖
echo "📦 安装前端依赖..."
cd $FRONTEND_DIR
npm install

# 8. 构建前端（生产环境）
echo "🏗️ 构建前端..."
npm run build

# 9. 重启后端服务
echo "🔄 重启后端服务..."
cd $BACKEND_DIR
pm2 restart uniquenames-api || pm2 start server.js --name uniquenames-api --cwd $BACKEND_DIR
pm2 save

# 10. 重载 Nginx（如果 nginx.conf 存在）
echo "🔄 重载 Nginx..."
if [ -f "$PROJECT_DIR/nginx.conf" ]; then
    sudo nginx -t && sudo nginx -s reload
else
    echo "  ⚠️  nginx.conf 不存在，跳过重载"
fi

# 11. 清理临时备份
echo "🧹 清理临时备份..."
rm -rf "$BACKUP_TEMP"
echo "  ✅ 临时备份已清理"

# 12. 检查服务状态
echo "✅ 检查服务状态..."
pm2 status

echo ""
echo "🎉 部署完成！"
echo "🌐 访问: https://uniquenames.net"
echo ""
echo "📊 查看日志: pm2 logs uniquenames-api"

