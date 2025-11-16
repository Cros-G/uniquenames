# 🚀 部署配置指南

## 📋 环境特定配置文件

以下配置文件是**环境特定的**，不会提交到 git：

### 1️⃣ **nginx.conf** (服务器 Nginx 配置)
- **模板文件:** `nginx.conf.example` (已提交到 git)
- **实际文件:** `nginx.conf` (不提交，服务器特定)
- **首次部署:** deploy.sh 会自动从模板复制
- **修改后:** 不会被 git pull 覆盖 ✅

### 2️⃣ **.env 文件** (环境变量)
- **后端:** `backend/.env` (不提交)
- **前端:** `frontend/.env.local` (不提交)
- **模板:** 可以创建 `.env.example` 作为参考

### 3️⃣ **vite.config.ts** (Vite 配置)
- **当前:** 已提交到 git，包含基础配置
- **本地覆盖:** 可创建 `vite.config.local.ts`（不提交）

---

## 🔧 首次部署流程

### 在服务器上执行：

```bash
# 1. 克隆项目
git clone https://github.com/Cros-G/uniquenames.git
cd uniquenames

# 2. 创建环境配置
cp nginx.conf.example nginx.conf
nano nginx.conf  # 根据实际环境修改

# 3. 创建 .env 文件
nano backend/.env
nano frontend/.env.local

# 4. 执行部署脚本
chmod +x deploy.sh
./deploy.sh
```

---

## 🔄 日常更新流程

### 在服务器上执行：

```bash
# 直接执行部署脚本
./deploy.sh
```

**deploy.sh 会自动：**
- ✅ 拉取最新代码
- ✅ **保护 nginx.conf 不被覆盖**
- ✅ 备份并恢复 .env 文件
- ✅ 安装依赖
- ✅ 构建前端
- ✅ 重启服务

---

## ⚠️ 重要提醒

### ✅ **会被 git 管理的：**
- `nginx.conf.example` (配置模板)
- `vite.config.ts` (基础配置)
- `.env.example` (环境变量模板)
- 所有源代码

### ❌ **不会被 git 管理的：**
- `nginx.conf` (实际配置)
- `backend/.env` (实际环境变量)
- `frontend/.env.local` (前端环境变量)
- `node_modules/` (依赖包)

---

## 🎯 解决的问题

### **之前的问题：**
❌ 每次 `git pull` 后 nginx.conf 被覆盖
❌ 服务器配置需要重新修改
❌ .env 文件被误提交到 git

### **现在的方案：**
✅ nginx.conf 不再提交，改用 .example 模板
✅ deploy.sh 自动保护环境配置
✅ .gitignore 防止敏感文件提交

---

## 📚 相关文件

- `deploy.sh` - 自动部署脚本
- `deploy-dev.sh` - 开发环境部署脚本
- `.gitignore` - Git 忽略规则
- `nginx.conf.example` - Nginx 配置模板

---

## 🆘 常见问题

### Q: 如果不小心修改了 nginx.conf.example 怎么办？
A: 没关系！这只是模板。服务器上的 nginx.conf 不会被影响。

### Q: 如果需要更新所有服务器的 nginx 配置？
A: 更新 nginx.conf.example，然后通知所有服务器管理员手动更新。

### Q: deploy.sh 执行失败怎么办？
A: 查看错误信息，通常是依赖安装或权限问题。

---

📅 **更新时间:** 2024-11-16

