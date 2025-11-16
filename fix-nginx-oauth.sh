#!/bin/bash

# ============================================
# 修复 Nginx OAuth 配置
# 删除 /auth location，让 Supabase 回调正常工作
# ============================================

set -e

echo "🔧 修复 Nginx OAuth 配置..."

# 1. 备份当前配置
sudo cp /etc/nginx/sites-available/uniquenames.net /etc/nginx/sites-available/uniquenames.net.backup_$(date +%Y%m%d_%H%M%S)
echo "  ✅ 已备份当前配置"

# 2. 写入新配置（删除 /auth location）
sudo tee /etc/nginx/sites-available/uniquenames.net > /dev/null << 'EOF'
server {
    server_name uniquenames.net www.uniquenames.net;

    # 后端 API（SSE 支持）
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # SSE 必需配置
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        chunked_transfer_encoding on;
        
        # 超时设置
        proxy_read_timeout 3600s;
        proxy_connect_timeout 75s;
        
        # 标准代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端 - 所有其他请求（包括 /auth/callback）转发到 Vite
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/uniquenames.net/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/uniquenames.net/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.uniquenames.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = uniquenames.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name uniquenames.net www.uniquenames.net;
    return 404; # managed by Certbot
}
EOF

echo "  ✅ 已写入新配置"

# 3. 测试配置
echo ""
echo "🧪 测试 Nginx 配置..."
if sudo nginx -t; then
    echo "  ✅ 配置语法正确"
    
    # 4. 重载 Nginx
    echo ""
    echo "🔄 重载 Nginx..."
    sudo nginx -s reload
    echo "  ✅ Nginx 已重载"
    
    echo ""
    echo "✅ 修复完成！"
    echo "🎉 现在 Google 登录应该可以正常工作了！"
    echo ""
    echo "📝 关键改动："
    echo "  - 删除了 location /auth 块"
    echo "  - /auth/callback 现在由前端处理（Supabase SDK）"
else
    echo "  ❌ 配置有误，请检查"
    exit 1
fi

