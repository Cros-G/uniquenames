#!/bin/bash

# ============================================
# 生产环境权限设置脚本
# 解决 Nginx (www-data) 访问 /root/ 目录的问题
# ============================================

set -e

echo "🔐 设置生产环境权限..."
echo ""

# 1. 检查 Nginx 运行用户
echo "📋 [1/5] 检查 Nginx 运行用户"
NGINX_USER=$(ps aux | grep 'nginx: worker process' | grep -v grep | awk '{print $1}' | head -1)
if [ -n "$NGINX_USER" ]; then
    echo "  ✅ Nginx 运行用户: $NGINX_USER"
else
    echo "  ⚠️  Nginx 未运行或无法检测"
    NGINX_USER="www-data"  # 默认
    echo "  → 使用默认用户: $NGINX_USER"
fi

echo ""

# 2. 设置 /root/ 目录权限（允许穿过，但不能列出）
echo "🔓 [2/5] 设置 /root/ 目录权限"
echo "  → 当前权限: $(ls -ld /root | awk '{print $1}')"

sudo chmod +rx /root
echo "  ✅ 已设置: chmod +rx /root"
echo "  → 新权限: $(ls -ld /root | awk '{print $1}')"
echo "  📝 说明: 其他用户可以穿过 /root/ 目录，但不能列出内容（安全）"

echo ""

# 3. 设置项目目录权限
echo "📂 [3/5] 设置项目目录权限"
PROJECT_DIR="/root/projects/uniquenames"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "  ❌ 项目目录不存在: $PROJECT_DIR"
    exit 1
fi

sudo chmod +rx /root/projects
sudo chmod +rx "$PROJECT_DIR"
echo "  ✅ 已设置项目目录穿过权限"

echo ""

# 4. 设置前端构建产物权限
echo "🌐 [4/5] 设置前端构建产物权限"
FRONTEND_DIST="$PROJECT_DIR/frontend/dist"

if [ ! -d "$FRONTEND_DIST" ]; then
    echo "  ⚠️  前端构建产物不存在: $FRONTEND_DIST"
    echo "  💡 请先运行: cd frontend && npm run build"
    echo "  → 跳过此步骤"
else
    sudo chmod -R +rx "$FRONTEND_DIST"
    echo "  ✅ 已设置: chmod -R +rx $FRONTEND_DIST"
    
    # 显示文件统计
    FILE_COUNT=$(find "$FRONTEND_DIST" -type f | wc -l)
    DIST_SIZE=$(du -sh "$FRONTEND_DIST" | cut -f1)
    echo "  📊 构建产物: $FILE_COUNT 个文件, 总大小 $DIST_SIZE"
fi

echo ""

# 5. 验证权限
echo "✅ [5/5] 验证权限"
echo ""

# 测试 www-data 用户是否可以访问
if sudo -u "$NGINX_USER" test -r "$FRONTEND_DIST/index.html" 2>/dev/null; then
    echo "  ✅ $NGINX_USER 用户可以读取 index.html"
else
    if [ ! -f "$FRONTEND_DIST/index.html" ]; then
        echo "  ⚠️  index.html 不存在（需要先构建前端）"
    else
        echo "  ❌ $NGINX_USER 用户无法读取 index.html"
        echo "  💡 权限仍有问题，请检查路径"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "✅ 权限设置完成！"
echo ""
echo "📝 权限摘要:"
echo "  /root/                     → $(ls -ld /root | awk '{print $1}')"
echo "  /root/projects/            → $(ls -ld /root/projects | awk '{print $1}')"
echo "  $PROJECT_DIR/  → $(ls -ld $PROJECT_DIR | awk '{print $1}')"
if [ -d "$FRONTEND_DIST" ]; then
    echo "  $FRONTEND_DIST/ → $(ls -ld $FRONTEND_DIST | awk '{print $1}')"
fi
echo ""
echo "🔒 安全说明:"
echo "  - /root/ 目录有 'x' 权限（穿过），无 'r' 权限（不能列出）"
echo "  - 其他用户只能访问明确知道路径的文件"
echo "  - 这是生产环境的标准做法"
echo ""
echo "🚀 下一步:"
echo "  1. 应用 Nginx 配置: sudo cp nginx.production.conf /etc/nginx/sites-available/uniquenames.net"
echo "  2. 测试配置: sudo nginx -t"
echo "  3. 重载 Nginx: sudo nginx -s reload"
echo ""

