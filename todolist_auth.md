# 🔐 Supabase 认证集成 - 完整实施计划

**功能**: 用户登录系统（Google + Email + Magic Link）
**创建日期**: 2025-11-15
**状态**: 🟡 待开始
**预计工时**: 4-6 小时

---

## 📋 需求确认

### **已确认：**
- ✅ Supabase 项目已创建，.env 已配置（SUPABASE_PROJECT_URL + SUPABASE_ANON_KEY）
- ✅ Google OAuth 已在 Supabase 配置完成
- ✅ 登录方式：Google OAuth + Email/Password + Magic Link（三种）
- ✅ 数据库方案：**方案B** - users + audit_logs → Supabase，prompts + settings → SQLite
- ✅ 登录后跳转：Landing Page
- ✅ 访问控制：**渐进式登录**（可匿名试用，超过限制后要求登录）
- ✅ 匿名历史：**自动迁移**（登录时）
- ✅ 邮件服务：使用 Supabase 默认邮件

### **架构决策：**
```
Supabase PostgreSQL (云端):
├─ users (Supabase Auth 自带)
└─ audit_logs (用户活动历史 - 需要创建)

SQLite (本地):
├─ prompts (提示词管理 - 管理员功能)
└─ settings (系统设置 - 管理员功能)
```

---

## 🎯 详细任务清单

### **Phase 1: Supabase 配置和准备**

#### ✅ Task 1.1: 验证 .env 配置 ✅ **已确认**
- **检查项**:
  - [x] `SUPABASE_PROJECT_URL` 存在且格式正确 ✅
  - [x] `SUPABASE_ANON_KEY` 存在且有效 ✅
  - [x] Google OAuth 已在 Supabase 配置 ✅
- **状态**: 用户已确认全部配置完成

---

#### ✅ Task 1.2: 安装 Supabase SDK ✅ **DONE**
- **前端**: 
  ```bash
  cd frontend
  npm install @supabase/supabase-js
  ```
- **后端**:
  ```bash
  cd backend
  npm install @supabase/supabase-js
  ```
- **验收**: 
  - [x] package.json 中有 @supabase/supabase-js ✅
  - [x] 前端导入测试通过 ✅
  - [x] 后端导入测试通过 ✅

---

#### ✅ Task 1.3: 在 Supabase 创建 audit_logs 表 ✅ **DONE**
- **文件**: `supabase_schema.sql` ✅ 已创建并执行
- **内容**: 
  ```sql
  CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    model VARCHAR(100) NOT NULL,
    prompt_id INTEGER,
    user_id UUID REFERENCES auth.users(id),  -- 关联 Supabase Auth
    user_input TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    raw_output TEXT,
    tokens_prompt INTEGER,
    tokens_completion INTEGER,
    tokens_total INTEGER,
    cost_usd DECIMAL(10, 6),
    duration_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error TEXT,
    workflow_type VARCHAR(50) DEFAULT 'generation',
    step_name VARCHAR(100),
    names_count INTEGER
  );
  
  -- 索引
  CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
  CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
  CREATE INDEX idx_audit_workflow ON audit_logs(workflow_type);
  
  -- Row Level Security (RLS) - 用户只能看自己的记录
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can view own audit logs"
    ON audit_logs FOR SELECT
    USING (auth.uid() = user_id);
  
  CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);
  ```
- **执行方式**: 在 Supabase Dashboard → SQL Editor 中执行
- **验收**: 
  - [ ] 表创建成功
  - [ ] 索引创建成功
  - [ ] RLS 策略生效

---

#### ✅ Task 1.4: 在 Supabase 配置 OAuth Providers ✅ **已确认**
- **Google OAuth**:
  - [x] 用户已在 Supabase 配置完成 ✅
- **Email + Magic Link**:
  - [ ] 确认已启用（应该是默认启用）
  - [ ] 使用 Supabase 默认邮件服务
- **验收**: 所有 Provider 状态为 "Enabled"

---

### **Phase 2: 前端 - Supabase 客户端和认证工具**

#### ✅ Task 2.1: 创建 Supabase 客户端 ✅ **DONE**
- **文件**: `frontend/src/lib/supabase.ts` ✅
- **内容**:
  ```typescript
  import { createClient } from '@supabase/supabase-js';
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  ```
- **验收**: 
  - [ ] 客户端创建成功
  - [ ] 环境变量读取正常

---

#### ✅ Task 2.2: 配置前端环境变量 ✅ **DONE**
- **文件**: `frontend/.env.local` ✅ 已创建并配置
- **内容**:
  ```bash
  VITE_SUPABASE_URL=从根目录.env复制
  VITE_SUPABASE_ANON_KEY=从根目录.env复制
  ```
- **注意**: Vite 需要 `VITE_` 前缀才能在浏览器访问
- **验收**: 前端能读取环境变量

---

#### ✅ Task 2.3: 创建认证 Context ✅ **DONE**
- **文件**: `frontend/src/contexts/AuthContext.tsx` ✅
- **测试**: 无 Linter 错误 ✅
- **功能**:
  - 管理登录状态（user, session）
  - 提供登录/登出方法
  - 监听 auth 状态变化
  - 自动迁移匿名历史
- **接口**:
  ```typescript
  interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signInWithMagicLink: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
  }
  ```
- **验收**:
  - [ ] Context 创建成功
  - [ ] 所有方法实现
  - [ ] 状态监听正常

---

#### ✅ Task 2.4: 修改 userAuth.ts
- **文件**: `frontend/src/utils/userAuth.ts`
- **修改**:
  - 改为从 Supabase session 获取 user_id
  - 保留 localStorage 逻辑（用于匿名历史迁移）
- **新增函数**:
  ```typescript
  // 获取 Supabase user_id（登录后）
  export function getSupabaseUserId(): string | null
  
  // 获取匿名 user_id（未登录）
  export function getAnonymousUserId(): string
  
  // 迁移匿名历史到 Supabase user
  export async function migrateAnonymousHistory(supabaseUserId: string): Promise<void>
  ```
- **验收**:
  - [ ] 登录后获取 Supabase user_id
  - [ ] 未登录获取匿名 user_id
  - [ ] 迁移逻辑正常

---

### **Phase 3: 前端 - 登录页面**

#### ✅ Task 3.1: 创建 LoginPage
- **文件**: `frontend/src/pages/LoginPage.tsx`
- **布局**:
  ```
  ┌─────────────────────────────────────┐
  │           uniquenames.net           │
  │                                     │
  │  ┌───────────────────────────────┐ │
  │  │   Welcome Back!               │ │
  │  │                               │ │
  │  │   [🔍 Sign in with Google]   │ │
  │  │                               │ │
  │  │   ─────────  OR  ─────────    │ │
  │  │                               │ │
  │  │   Email: [____________]       │ │
  │  │   Password: [____________]    │ │
  │  │   [Sign In] [Sign Up]         │ │
  │  │                               │ │
  │  │   ─────────  OR  ─────────    │ │
  │  │                               │ │
  │  │   [✉️ Send Magic Link]        │ │
  │  └───────────────────────────────┘ │
  └─────────────────────────────────────┘
  ```
- **样式**: 遵循 design_system.md
- **验收**:
  - [ ] 三种登录方式都有
  - [ ] 表单验证正常
  - [ ] 错误提示友好

---

#### ✅ Task 3.2: 实现登录逻辑
- **Google OAuth**:
  ```typescript
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  ```
- **Email + Password**:
  ```typescript
  // 登录
  await supabase.auth.signInWithPassword({ email, password });
  
  // 注册
  await supabase.auth.signUp({ email, password });
  ```
- **Magic Link**:
  ```typescript
  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  ```
- **验收**:
  - [ ] 三种方式都能登录
  - [ ] 错误处理完善

---

#### ✅ Task 3.3: 创建 Auth Callback 页面
- **文件**: `frontend/src/pages/AuthCallback.tsx`
- **功能**: 处理 OAuth/Magic Link 回调
- **逻辑**:
  1. 从 URL 读取 token
  2. 验证 session
  3. 迁移匿名历史（如果有）
  4. 跳转到 Landing Page
- **验收**:
  - [ ] 回调处理正常
  - [ ] 自动迁移历史
  - [ ] 跳转正确

---

### **Phase 4: 前端 - 渐进式登录控制**

**渐进式策略：**
- 匿名用户可试用：Generate 2次 + Narrow Down 2次
- 超限后弹窗引导登录
- Records 页面必须登录

#### ✅ Task 4.1: 创建使用限制追踪 ✅ **DONE**
- **文件**: `frontend/src/utils/usageLimit.ts` ✅
- **测试**: `frontend/src/utils/__tests__/usageLimit.test.ts` ✅（7个测试用例）
- **功能**: 追踪匿名用户的使用次数
- **逻辑**:
  ```typescript
  // 匿名用户限制：Generate 2次，Narrow Down 2次
  export function checkUsageLimit(type: 'generation' | 'narrow_down'): boolean
  export function incrementUsage(type: 'generation' | 'narrow_down'): void
  export function resetUsage(): void  // 登录后重置
  ```
- **存储**: localStorage
- **验收**:
  - [ ] 计数准确
  - [ ] 超限检测正常

#### ✅ Task 4.2: 创建登录提示组件
- **文件**: `frontend/src/components/auth/LoginPrompt.tsx`
- **功能**: 超限后弹窗提示登录
- **样式**: 遵循 design_system.md（温暖、友好）
- **内容**:
  ```
  🎉 You've tried our service!
  
  Sign in to unlock unlimited access:
  - ✨ Unlimited name generation
  - 🎯 Unlimited analysis
  - 📊 Activity history tracking
  - 🔄 Cross-device sync
  
  [Sign in with Google] [Sign in with Email]
  ```
- **验收**:
  - [ ] 弹窗美观
  - [ ] 引导清晰

#### ✅ Task 4.3: 修改功能页面添加限制检查
- **修改文件**:
  - `GeneratePage.tsx`
  - `NarrowDownPage.tsx`
- **逻辑**:
  ```typescript
  const handleSubmit = (context: string) => {
    // 检查登录状态
    if (!user) {
      // 检查使用限制
      if (!checkUsageLimit('generation')) {
        setShowLoginPrompt(true);
        return;
      }
      incrementUsage('generation');
    }
    
    // 继续执行
    // ...
  };
  ```
- **验收**:
  - [ ] 匿名用户限制生效
  - [ ] 登录用户无限制

---

#### ✅ Task 4.4: 修改 App.tsx 路由（渐进式）
- **修改**:
  ```tsx
  <Routes>
    {/* 公开页面 */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    
    {/* 功能页面 - 可匿名访问，但有使用限制 */}
    <Route path="/app/generate" element={<GeneratePage />} />
    <Route path="/app/narrow-down" element={<NarrowDownPage />} />
    
    {/* Records 需要登录 */}
    <Route element={<ProtectedRoute />}>
      <Route path="/app/records" element={<RecordsPage />} />
    </Route>
    
    {/* 管理后台 */}
    <Route path="/platform/*" element={...} />
  </Routes>
  ```
- **验收**:
  - [ ] 所有页面可访问
  - [ ] Records 需要登录
  - [ ] 功能页有使用限制

---

#### ✅ Task 4.3: 添加用户信息显示
- **位置**: LandingPage、GeneratePage、NarrowDownPage、RecordsPage 的右上角
- **内容**:
  - 用户头像（如果有）
  - 用户名称
  - 下拉菜单：Records / Settings / Logout
- **验收**:
  - [ ] 显示用户信息
  - [ ] 下拉菜单正常
  - [ ] 登出功能正常

---

### **Phase 5: 后端 - Supabase 集成**

#### ✅ Task 5.1: 创建 Supabase 客户端（后端）
- **文件**: `backend/lib/supabase.js`
- **内容**:
  ```javascript
  import { createClient } from '@supabase/supabase-js';
  
  const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  
  export const supabase = createClient(supabaseUrl, supabaseServiceKey);
  ```
- **用途**: 后端写入 audit_logs 到 Supabase
- **验收**: 客户端创建成功

---

#### ✅ Task 5.2: 创建 SupabaseAuditLog 模型
- **文件**: `backend/models/SupabaseAuditLog.js`
- **功能**: 操作 Supabase 的 audit_logs 表
- **方法**:
  ```javascript
  create(data)           // 创建审计日志
  findByUserId(userId, options)  // 查询用户历史
  migrateFromSQLite(userId, sqliteRecords)  // 迁移 SQLite 数据
  ```
- **验收**:
  - [ ] CRUD 操作正常
  - [ ] 测试通过

---

#### ✅ Task 5.3: 修改 AuditLog 创建逻辑
- **策略**: 双写（SQLite + Supabase）
- **修改位置**:
  - `server.js` - /api/generate-names
  - `NarrowDownOrchestrator.js` - 所有5个步骤
- **逻辑**:
  ```javascript
  // 1. 写入本地 SQLite（保留）
  const logId = AuditLog.create(db, data);
  
  // 2. 同时写入 Supabase（如果有 user_id）
  if (data.userId && data.userId !== 'anonymous') {
    await SupabaseAuditLog.create(data);
  }
  ```
- **验收**:
  - [ ] 双写成功
  - [ ] Supabase 有数据

---

#### ✅ Task 5.4: 创建认证中间件
- **文件**: `backend/middleware/auth.js`
- **功能**: 验证 Supabase JWT token
- **逻辑**:
  ```javascript
  export async function authenticateUser(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  }
  ```
- **应用**: Records API、未来的付费功能等
- **验收**:
  - [ ] Token 验证正常
  - [ ] 错误处理完善

---

### **Phase 6: 匿名历史迁移**

#### ✅ Task 6.1: 创建迁移 API
- **文件**: `backend/controllers/userController.js`
- **新增方法**: `migrateAnonymousHistory`
- **接口**: `POST /api/user/migrate`
- **逻辑**:
  1. 接收 `anonymousUserId` 和 `supabaseUserId`
  2. 从 SQLite 查询该匿名用户的所有 audit_logs
  3. 批量写入 Supabase，user_id 改为 supabaseUserId
  4. 标记本地记录为已迁移（或删除）
- **验收**:
  - [ ] 迁移成功
  - [ ] 数据完整

---

#### ✅ Task 6.2: 前端自动迁移逻辑
- **位置**: `AuthContext` 的 `onAuthStateChange` 监听器
- **逻辑**:
  ```typescript
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // 检查是否有匿名历史
      const anonymousUserId = localStorage.getItem('uniquenames_user_id');
      
      if (anonymousUserId && anonymousUserId.startsWith('user_')) {
        // 调用迁移 API
        await migrateAnonymousHistory(anonymousUserId, session.user.id);
        
        // 清除匿名 ID
        localStorage.removeItem('uniquenames_user_id');
      }
    }
  });
  ```
- **验收**:
  - [ ] 首次登录自动迁移
  - [ ] 无重复迁移

---

### **Phase 7: 修改现有 API 调用**

#### ✅ Task 7.1: 修改 userAuth.ts
- **修改**: `getUserId()` 优先从 Supabase session 获取
- **新逻辑**:
  ```typescript
  export async function getUserId(): Promise<string> {
    // 1. 尝试从 Supabase 获取（如果已登录）
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return session.user.id;
    }
    
    // 2. 未登录，返回匿名 ID（但不应该到这，因为强制登录）
    throw new Error('Not authenticated');
  }
  ```
- **验收**: 
  - [ ] 登录后获取 Supabase user_id
  - [ ] 未登录抛出错误

---

#### ✅ Task 7.2: 修改 streamingAPI 和 narrowDownAPI
- **修改**: 传递 Supabase session token
- **逻辑**:
  ```typescript
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  fetch('/api/generate-names', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,  // 改用 Supabase token
    },
    // ...
  });
  ```
- **验收**:
  - [ ] Token 传递正常
  - [ ] 后端验证通过

---

#### ✅ Task 7.3: 修改后端 user_id 提取
- **修改位置**:
  - `server.js` - /api/generate-names
  - `narrowDownController.js` - /api/narrow-down/process
- **新逻辑**:
  ```javascript
  // 从 Supabase JWT 提取 user_id
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  const userId = user?.id || 'anonymous';
  ```
- **验收**:
  - [ ] user_id 提取正常
  - [ ] 记录到 Supabase audit_logs

---

### **Phase 8: UI 改造**

#### ✅ Task 8.1: LandingPage 添加 Login 按钮
- **位置**: 右上角
- **逻辑**: 
  - 未登录：显示 "Login" 按钮
  - 已登录：显示用户头像 + 下拉菜单
- **验收**: 显示正确

---

#### ✅ Task 8.2: 修改 Records 数据源
- **文件**: `frontend/src/services/userAPI.ts`
- **修改**: 从 Supabase 读取数据（不再从本地 API）
- **新逻辑**:
  ```typescript
  export async function getUserHistory() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);
    
    return groupActivities(data);
  }
  ```
- **验收**:
  - [ ] 数据读取正常
  - [ ] 分组逻辑正确

---

### **Phase 9: 测试**

#### ✅ Task 9.1: 测试注册流程
- **步骤**:
  1. 访问 /login
  2. 使用 Email + Password 注册
  3. 验证邮件（如果启用）
  4. 登录成功
  5. 跳转到 Landing Page
  6. 检查右上角显示用户信息
- **验收**: 流程顺畅

---

#### ✅ Task 9.2: 测试 Google 登录
- **步骤**:
  1. 点击 "Sign in with Google"
  2. 跳转到 Google 登录
  3. 授权后回调
  4. 登录成功
  5. 跳转到 Landing Page
- **验收**: 流程顺畅

---

#### ✅ Task 9.3: 测试 Magic Link
- **步骤**:
  1. 输入邮箱
  2. 点击 "Send Magic Link"
  3. 收到邮件
  4. 点击链接
  5. 登录成功
- **验收**: 流程顺畅

---

#### ✅ Task 9.4: 测试匿名历史迁移
- **步骤**:
  1. 清除所有登录状态
  2. 匿名使用 Generate 生成几个名字
  3. 查看 localStorage 有 user_id
  4. 登录（任意方式）
  5. 检查 Records 页面是否有匿名时的历史
  6. 检查 localStorage user_id 已清除
- **验收**: 历史迁移成功

---

#### ✅ Task 9.5: 测试渐进式登录
- **步骤**:
  1. 清除所有登录状态
  2. 访问 /app/generate
  3. 生成名字 1 次 → 成功
  4. 生成名字 2 次 → 成功
  5. 生成名字 3 次 → 弹出登录提示
  6. 登录后 → 无限制使用
  7. 访问 /app/records（未登录）→ 重定向到 /login
  8. 登录后访问 /app/records → 成功，看到历史
- **验收**: 
  - [ ] 匿名限制生效（2次）
  - [ ] 登录提示友好
  - [ ] 登录后无限制
  - [ ] Records 必须登录

---

#### ✅ Task 9.6: 测试活动记录
- **步骤**:
  1. 登录
  2. 使用 Generate 生成名字
  3. 使用 Narrow Down 分析名字
  4. 访问 /app/records
  5. 应该看到两个活动
  6. 展开查看详情
  7. 检查 token 统计
- **验收**: 
  - [ ] 活动记录正常
  - [ ] 数据在 Supabase

---

### **Phase 10: 清理和优化**

#### ✅ Task 10.1: 删除旧的用户系统
- **删除文件**:
  - `backend/db/users-schema.sql`（改用 Supabase Auth）
  - `backend/models/User.js`（部分逻辑迁移）
  - `backend/tests/User.test.js`
- **保留**: 迁移相关的工具函数

---

#### ✅ Task 10.2: 更新文档
- **文件**: `docs/authentication.md`
- **内容**:
  - Supabase 配置指南
  - 环境变量说明
  - 登录流程图
  - 故障排查

---

#### ✅ Task 10.3: 安全审查
- **检查项**:
  - [ ] Anon Key 没有暴露在代码中（只在环境变量）
  - [ ] Service Key 只在后端使用
  - [ ] RLS 策略正确配置
  - [ ] CORS 配置正确
  - [ ] Token 传输使用 HTTPS（生产环境）

---

## 📊 进度追踪

- [x] **Phase 1**: Supabase 配置和准备（4个任务） ✅
- [x] **Phase 2**: 前端 Supabase 客户端（4个任务） ✅
- [x] **Phase 3**: 登录页面（3个任务） ✅
- [x] **Phase 4**: 渐进式登录控制（4个任务） ✅
- [x] **Phase 5**: 后端集成（4个任务） ✅
- [x] **Phase 6**: 匿名历史迁移（2个任务） ✅
- [x] **Phase 7**: API 改造（3个任务） ✅ (已在 Phase 2 完成)
- [x] **Phase 8**: UI 改造（2个任务） ✅
- [ ] **Phase 9**: 全面测试（6个任务）
- [ ] **Phase 10**: 清理优化（3个任务）

**总计：35 个任务，预计 6-7 小时**

---

## ⚠️ 风险和注意事项

### **风险1: Supabase RLS 配置错误**
- **问题**: 用户可能看到别人的数据
- **缓解**: 仔细测试 RLS 策略

### **风险2: 匿名历史迁移失败**
- **问题**: 用户丢失历史数据
- **缓解**: 
  - 迁移前先备份
  - 迁移失败不删除本地数据
  - 提供手动重试按钮

### **风险3: Token 过期处理**
- **问题**: Token 过期后 API 调用失败
- **缓解**: 
  - 监听 session 过期事件
  - 自动刷新 token
  - 失败后提示重新登录

### **风险4: OAuth 回调失败**
- **问题**: Redirect URI 配置错误
- **缓解**: 
  - 仔细配置 Google OAuth
  - 提供详细错误提示

---

## 📝 实施顺序建议

### **Day 1（2-3 小时）**
- Phase 1: Supabase 配置
- Phase 2: 前端客户端
- Phase 3: 登录页面

### **Day 2（2-3 小时）**
- Phase 4: 受保护路由
- Phase 5: 后端集成
- Phase 6: 匿名历史迁移

### **Day 3（1-2 小时）**
- Phase 7: API 改造
- Phase 8: UI 改造
- Phase 9: 全面测试
- Phase 10: 清理优化

---

## ✅ 成功标准

### **功能性**
- [ ] 三种登录方式都能正常工作
- [ ] 未登录无法访问功能页
- [ ] 登录后能正常使用所有功能
- [ ] 活动记录保存到 Supabase
- [ ] 匿名历史自动迁移
- [ ] 登出功能正常

### **安全性**
- [ ] JWT token 验证正常
- [ ] RLS 策略生效（用户只能看自己的数据）
- [ ] 敏感信息不暴露

### **用户体验**
- [ ] 登录流程顺畅（< 3 次点击）
- [ ] 错误提示友好
- [ ] 加载状态清晰
- [ ] 界面符合 design_system.md

---

**总计：约 40 个任务，预计 4-6 小时完成**

**创建人**: AI Assistant  
**最后更新**: 2025-11-15

