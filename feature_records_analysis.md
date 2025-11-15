# 🎯 历史管理功能 - 完整分析

## 📋 需求分析

### 业务逻辑
1. **活动定义**：
   - 每次 Generate 使用 = 一次活动
   - 每次 Narrow Down 使用 = 一次活动
   
2. **数据展示**：
   - 用户能看到自己的所有活动历史
   - 主要展示每次活动消耗的 token
   - 按时间倒序排列

3. **用户认证**：
   - 数据库需要 `user_id` 字段
   - 为后续 Google 和邮箱登录做准备
   - **临时方案**：使用 localStorage 存储匿名 user_id

---

## 🗄️ 数据库层面

### 1. 现有 audit_logs 表结构
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  model VARCHAR(100) NOT NULL,
  prompt_id INTEGER,
  user_input TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  raw_output TEXT,
  tokens_prompt INTEGER,       -- ✅ 已有
  tokens_completion INTEGER,   -- ✅ 已有
  tokens_total INTEGER,        -- ✅ 已有
  cost_usd DECIMAL(10, 6),     -- ✅ 已有
  duration_ms INTEGER,
  success BOOLEAN DEFAULT 1,
  error TEXT,
  -- ❌ 缺少：user_id, workflow_type, step_name, names_count
  FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);
```

### 2. 需要添加的字段
```sql
ALTER TABLE audit_logs ADD COLUMN user_id VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN workflow_type VARCHAR(50); -- 'generation' 或 'narrow_down'
ALTER TABLE audit_logs ADD COLUMN step_name VARCHAR(100);     -- 区分同一活动的不同步骤
ALTER TABLE audit_logs ADD COLUMN names_count INTEGER;        -- 生成/分析的名字数量
```

**注意**：根据代码，这些字段**已经在使用**（见 NarrowDownOrchestrator.js），但可能是后续添加的！

### 3. 创建 users 表（为后续登录做准备）
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id VARCHAR(255) UNIQUE NOT NULL,  -- 唯一标识（UUID）
  email VARCHAR(255) UNIQUE,              -- 邮箱（可选）
  google_id VARCHAR(255) UNIQUE,          -- Google ID（可选）
  display_name VARCHAR(255),              -- 显示名称
  avatar_url TEXT,                        -- 头像 URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

## 🔧 后端 API

### 1. GET /api/user/history
**功能**：获取当前用户的活动历史

**请求参数**：
```typescript
{
  user_id: string;      // 从 header 或 localStorage 获取
  limit?: number;       // 分页限制（默认 20）
  offset?: number;      // 偏移量（默认 0）
  workflow_type?: 'generation' | 'narrow_down';  // 筛选类型
}
```

**响应数据**：
```typescript
{
  activities: [
    {
      id: number;                     // 活动 ID（第一条 audit_log 的 ID）
      type: 'generation' | 'narrow_down';
      timestamp: string;              // 活动开始时间
      userInput: string;              // 用户输入（截断显示）
      steps: [                        // 该活动包含的所有步骤
        {
          stepName: string;           // 步骤名称
          model: string;              // 使用的模型
          tokensPrompt: number;
          tokensCompletion: number;
          tokensTotal: number;
          costUsd: number | null;
          durationMs: number;
        }
      ],
      totalTokens: number;            // 总 token
      totalCost: number;              // 总费用
      totalDuration: number;          // 总时长
      namesCount: number;             // 生成/分析的名字数量
      success: boolean;               // 是否成功
    }
  ],
  total: number;                      // 总活动数
}
```

**逻辑**：
1. 根据 `user_id` 查询 audit_logs
2. 按 `workflow_type` + `timestamp` 分组（同一时间范围内的相同类型为一个活动）
3. 聚合每个活动的所有步骤数据
4. 计算总 token、总费用、总时长

### 2. POST /api/user/init
**功能**：初始化匿名用户（临时方案）

**请求参数**：无

**响应数据**：
```typescript
{
  user_id: string;  // 生成的 UUID
}
```

---

## 🎨 前端设计（符合 design_system.md）

### 1. RecordsPage 结构
```
┌─────────────────────────────────────────────┐
│ Header                                      │
│ [← Back to Home]  Records         [空白]    │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ 主内容区                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ 筛选栏                                   │ │
│ │ [All] [Generate] [Narrow Down]          │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 活动卡片 1                               │ │
│ │ 🎨 Generate - 2025-01-15 14:30          │ │
│ │ Input: "I need a baby name..."          │ │
│ │ ┌─────────────────────────────────────┐ │ │
│ │ │ 💬 3 steps | 📊 1,234 tokens        │ │ │
│ │ │ 💰 $0.012 | ⏱️ 5.2s                 │ │ │
│ │ │ ✨ 5 names generated                │ │ │
│ │ └─────────────────────────────────────┘ │ │
│ │ [Expand Details ▼]                      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 活动卡片 2 ...                           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 2. 设计规范（遵循 design_system.md）

**颜色**：
- 卡片背景：`#FFFFFF`
- 边框：`#E5E7EB`
- Generate 图标：`#EC4899` (粉红)
- Narrow Down 图标：`#8B5CF6` (紫色)
- Token 数字：`#6366F1` (蓝紫)
- 费用：`#10B981` (绿色)

**字体**：
- 标题：`font-semibold text-lg` (18px / 1.6)
- 时间：`text-sm text-gray-600` (14px / 1.5)
- 统计数据：`text-base font-medium` (16px / 1.6)

**圆角和阴影**：
- 卡片：`rounded-xl` (12px) + 中阴影
- 筛选按钮：`rounded-lg` (8px)

**动画**：
- 卡片展开：200ms cubic-bezier(0.4, 0, 0.2, 1)
- Hover 效果：上移 4px + 阴影增强

---

## 📂 文件清单

### 后端
1. **`backend/db/migrate-add-user.js`** - 数据库迁移脚本
2. **`backend/db/users-schema.sql`** - users 表结构
3. **`backend/models/User.js`** - User 模型
4. **`backend/controllers/userController.js`** - 用户相关 API
5. **`backend/routes/user.js`** - 用户路由
6. **修改 `backend/server.js`** - 注册用户路由

### 前端
1. **`frontend/src/pages/RecordsPage.tsx`** - 历史记录主页面
2. **`frontend/src/components/records/ActivityCard.tsx`** - 活动卡片组件
3. **`frontend/src/components/records/ActivityFilters.tsx`** - 筛选栏组件
4. **`frontend/src/components/records/StepDetails.tsx`** - 步骤详情组件
5. **`frontend/src/services/userAPI.ts`** - 用户 API 服务
6. **`frontend/src/utils/userAuth.ts`** - 临时用户认证工具
7. **修改 `LandingPage.tsx`** - 添加 "Records" 按钮
8. **修改 `GeneratePage.tsx`** - 添加 "Records" 按钮
9. **修改 `NarrowDownPage.tsx`** - 添加 "Records" 按钮
10. **修改 `App.tsx`** - 添加 `/records` 路由

### 中间件
1. **`backend/middleware/auth.js`** - 用户认证中间件（临时方案）
2. **修改 API 调用**：在 streamGenerateNames 和 streamNarrowDown 中传递 user_id

---

## 🔑 临时用户认证方案

### 前端（localStorage）
```typescript
// frontend/src/utils/userAuth.ts
export function getUserId(): string {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_id', userId);
  }
  return userId;
}
```

### 后端（记录到数据库）
```javascript
// 所有 API 调用时
const userId = req.headers['x-user-id'] || 'anonymous';
AuditLog.create(db, {
  user_id: userId,
  // ... other fields
});
```

---

## 🚀 实施步骤

### Phase 1: 数据库准备
1. ✅ 检查 audit_logs 是否已有必要字段
2. ✅ 创建数据库迁移脚本
3. ✅ 创建 users 表
4. ✅ 运行迁移

### Phase 2: 后端 API
1. ✅ 创建 User 模型
2. ✅ 创建 userController
3. ✅ 创建用户路由
4. ✅ 修改现有 API，添加 user_id 记录

### Phase 3: 前端页面
1. ✅ 创建 RecordsPage
2. ✅ 创建 ActivityCard 组件
3. ✅ 创建筛选和详情组件
4. ✅ 创建用户 API 服务
5. ✅ 添加 "Records" 按钮到所有页面

### Phase 4: 集成测试
1. ✅ 测试活动记录
2. ✅ 测试 token 统计
3. ✅ 测试筛选和分页

---

## ⚠️ 注意事项

1. **隐私**：用户输入可能包含敏感信息，展示时需要截断或模糊处理
2. **性能**：活动历史可能很多，需要分页和虚拟滚动
3. **费用计算**：目前 cost_usd 可能为 null，需要根据模型和 token 计算
4. **时区**：时间戳需要处理时区问题
5. **迁移**：现有数据的 user_id 为 null，需要处理

---

## 📊 预估工作量

- 数据库 + 后端 API：**1-2 小时**
- 前端页面 + 组件：**2-3 小时**
- 集成和测试：**1 小时**
- **总计：4-6 小时**

---

**准备好了吗？要开始实施吗？** 🚀

