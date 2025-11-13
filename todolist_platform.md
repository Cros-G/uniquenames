# 管理后台开发计划

## 📋 项目概述
为AI起名工具添加管理后台，支持提示词版本管理和完整的审计功能。

---

## 🗄️ 数据库设计

### 使用技术
- **SQLite** - 轻量级数据库，db文件存储
- **better-sqlite3** - Node.js 的 SQLite 库
- **Drizzle ORM** 或直接使用 SQL（更简单）

### 数据表结构

#### 1. prompts 表（提示词）
```sql
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,           -- 提示词名称
  version VARCHAR(50) NOT NULL,         -- 版本号 (如 1.0, 1.1)
  tag VARCHAR(100) NOT NULL,            -- 标签（如 'generation', 'selection'）
  content TEXT NOT NULL,                -- 提示词完整内容
  default_model VARCHAR(100),           -- 默认模型
  is_active BOOLEAN DEFAULT 0,          -- 是否为该标签下的激活版本
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, version)                 -- 名称+版本唯一
);
```

#### 2. audit_logs 表（审计日志）
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  model VARCHAR(100) NOT NULL,          -- 使用的模型
  prompt_id INTEGER,                    -- 使用的提示词ID
  user_input TEXT NOT NULL,             -- 用户输入
  system_prompt TEXT NOT NULL,          -- 系统提示词（完整）
  raw_output TEXT,                      -- 原始输出
  tokens_prompt INTEGER,                -- 提示词 token 数
  tokens_completion INTEGER,            -- 完成 token 数
  tokens_total INTEGER,                 -- 总 token 数
  cost_usd DECIMAL(10, 6),             -- 费用（美元）
  duration_ms INTEGER,                  -- 耗时（毫秒）
  success BOOLEAN DEFAULT 1,            -- 是否成功
  error TEXT,                           -- 错误信息
  FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);
```

### 初始数据迁移
- 将现有的 `prompt_generation.xml` 导入为第一个提示词（version 1.0, tag 'generation', is_active=1）
- 将 `prompt_selection.xml` 导入（如果有内容）

---

## 🏗️ 项目结构

```
backend/
├── db/
│   ├── database.db              # SQLite 数据库文件
│   ├── init.js                  # 数据库初始化脚本
│   ├── schema.sql               # 数据库 schema
│   └── migrate.js               # 数据迁移脚本
├── models/
│   ├── Prompt.js                # 提示词模型
│   └── AuditLog.js              # 审计日志模型
├── controllers/
│   ├── promptController.js      # 提示词 CRUD 接口
│   └── auditController.js       # 审计查询接口
├── routes/
│   ├── prompts.js               # 提示词路由
│   └── audit.js                 # 审计路由
└── server.js                    # 主服务器（更新）

frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx         # 前台页面（现有App.tsx改造）
│   │   └── PlatformPage.tsx    # 管理后台页面
│   ├── components/
│   │   ├── platform/            # 管理后台组件
│   │   │   ├── PromptManager.tsx      # 提示词管理组件
│   │   │   ├── PromptEditor.tsx       # 提示词编辑器
│   │   │   ├── AuditTable.tsx         # 审计表格
│   │   │   └── Sidebar.tsx            # 侧边栏导航
│   │   └── ... (现有组件)
│   ├── router.tsx               # 路由配置
│   └── App.tsx                  # 主应用（配置路由）
```

---

## 📝 详细开发任务

### Phase 1: 数据库层 (预计2-3小时)

#### 1.1 安装依赖
- [ ] 安装 `better-sqlite3`
- [ ] 创建 `backend/db/` 目录

#### 1.2 创建数据库 Schema
- [ ] 编写 `schema.sql`（创建 prompts 和 audit_logs 表）
- [ ] 编写 `init.js`（初始化数据库）
- [ ] 编写单元测试验证表结构

#### 1.3 数据模型层
- [ ] 实现 `Prompt.js`（CRUD 方法）
  - `create(name, version, tag, content, defaultModel)`
  - `findAll()`
  - `findByTag(tag)` - 获取某标签下的所有提示词
  - `getActive(tag)` - 获取某标签下的激活版本
  - `setActive(id, tag)` - 设置激活版本（同时取消其他）
  - `update(id, data)`
  - `delete(id)`
- [ ] 实现 `AuditLog.js`（查询和统计）
  - `create(data)` - 记录审计日志
  - `findAll(filters, pagination)` - 获取所有日志（支持筛选和分页）
  - `getStats()` - 获取统计信息
  - `getTotalCost()` - 计算总花费
- [ ] 为所有方法编写单元测试

#### 1.4 数据迁移
- [ ] 编写 `migrate.js`
- [ ] 将 `prompt_generation.xml` 导入数据库
- [ ] 设置为激活状态

---

### Phase 2: 后端 API (预计2-3小时)

#### 2.1 提示词管理 API
- [ ] `GET /api/admin/prompts` - 获取所有提示词
- [ ] `GET /api/admin/prompts/:id` - 获取单个提示词详情
- [ ] `GET /api/admin/prompts/active/:tag` - 获取某标签的激活版本
- [ ] `POST /api/admin/prompts` - 创建新提示词
- [ ] `PUT /api/admin/prompts/:id` - 更新提示词
- [ ] `PUT /api/admin/prompts/:id/activate` - 设置为激活版本
- [ ] `DELETE /api/admin/prompts/:id` - 删除提示词
- [ ] 编写 API 集成测试

#### 2.2 审计 API
- [ ] `GET /api/admin/audit` - 获取审计日志（分页、筛选、排序）
- [ ] `GET /api/admin/audit/stats` - 获取统计信息
- [ ] `GET /api/admin/audit/costs` - 获取费用统计
- [ ] 编写 API 集成测试

#### 2.3 更新生成接口
- [ ] 修改 `/api/generate-names` 从数据库读取激活的提示词
- [ ] 修改审计日志保存到数据库（替换内存存储）
- [ ] 从 OpenRouter 响应中提取 token 和费用信息
- [ ] 测试完整流程

---

### Phase 3: 前端路由 (预计1小时)

#### 3.1 安装和配置路由
- [ ] 安装 `react-router-dom`
- [ ] 创建 `router.tsx` 配置路由
- [ ] 重构 `App.tsx` 为路由容器
- [ ] 将现有主页代码移到 `HomePage.tsx`

#### 3.2 路由结构
```
/ - 前台（用户生成名字）
/platform - 管理后台首页（提示词管理）
/platform/prompts - 提示词管理
/platform/audit - 审计日志
```

---

### Phase 4: 管理后台 UI (预计4-5小时)

#### 4.1 布局组件
- [ ] 创建 `PlatformLayout.tsx`（侧边栏 + 内容区）
- [ ] 创建 `Sidebar.tsx`（导航菜单）
- [ ] 创建面包屑导航

#### 4.2 提示词管理页面
- [ ] **PromptList 组件**
  - 显示所有提示词
  - 按标签分组
  - 显示激活状态（绿色标记）
  - 新建/编辑/删除按钮
- [ ] **PromptEditor 组件**（modal 或独立页面）
  - 表单字段：名称、版本、标签、默认模型
  - 代码编辑器（textarea 或集成 Monaco Editor）
  - 保存/取消按钮
  - 表单验证
- [ ] **激活版本切换**
  - 每个版本旁边有「设为激活」按钮
  - 激活后其他版本自动取消激活
  - 视觉反馈（当前激活版本高亮）

#### 4.3 审计日志页面
- [ ] **AuditTable 组件**（表格形式）
  - 列：时间、模型、用户输入（截断）、输出长度、Token数、费用、耗时、状态
  - 点击行展开查看完整信息
  - 分页功能（每页20条）
  - 排序功能（按时间、费用、耗时）
  - 筛选功能（按模型、日期范围、成功/失败）
- [ ] **AuditDetail 组件**（展开行或侧边栏）
  - 显示完整的系统提示词
  - 显示完整的用户输入和原始输出
  - 显示详细的计费明细
- [ ] **AuditStats 组件**（统计卡片）
  - 总调用次数
  - 成功率
  - 总费用（美元）
  - 平均响应时间
  - 按模型分组的统计

#### 4.4 入口和导航
- [ ] 在前台右上角添加「管理后台」入口按钮
- [ ] 从管理后台可以返回前台（左上角logo或返回按钮）
- [ ] 侧边栏导航：提示词管理 / 审计日志

---

### Phase 5: 集成和测试 (预计1-2小时)

#### 5.1 端到端测试
- [ ] 测试提示词 CRUD 功能
- [ ] 测试版本切换功能
- [ ] 测试前台使用数据库中的激活提示词
- [ ] 测试审计日志记录到数据库
- [ ] 测试审计查询、筛选、分页

#### 5.2 边界情况处理
- [ ] 数据库不存在时自动初始化
- [ ] 没有激活提示词时的降级处理
- [ ] 删除最后一个提示词的限制
- [ ] 删除激活提示词的警告

---

### Phase 6: 视觉优化 (预计1小时)

#### 6.1 管理后台视觉风格
- [ ] 采用类似 Vercel/Linear 的后台风格
- [ ] 侧边栏：深色背景，高亮激活项
- [ ] 表格：条纹背景，hover 高亮
- [ ] 按钮：统一的操作按钮样式

#### 6.2 响应式适配
- [ ] 移动端侧边栏改为抽屉式
- [ ] 表格在小屏幕上改为卡片式

---

## 🎨 视觉设计方案

### 管理后台配色
- **侧边栏背景**：`#1A202C`
- **内容区背景**：`#0F1419`
- **激活状态**：紫色高亮 `#8B5CF6`
- **表格行 hover**：`rgba(139, 92, 246, 0.1)`
- **成功状态**：绿色 `#10B981`
- **失败状态**：红色 `#EF4444`

### 组件布局
```
┌──────────────────────────────────────┐
│  Logo    [提示词] [审计] [返回前台]   │
├────────┬─────────────────────────────┤
│        │                             │
│ 侧边栏  │    主内容区                  │
│        │                             │
│ [提示词]│  - 提示词列表/编辑器        │
│ [审计]  │  - 审计表格/详情            │
│        │                             │
│        │                             │
└────────┴─────────────────────────────┘
```

---

## 🔄 关键业务逻辑

### 提示词版本管理规则
1. 同一个标签(tag)下，可以有多个版本的提示词
2. 每个标签同时只能有**一个激活版本**
3. 用户生成名字时，自动使用对应标签的激活版本
4. 管理员可以在后台切换激活版本

### 审计日志记录规则
1. **每次**调用 AI API 都记录到数据库
2. 记录完整的输入输出（不截断）
3. 从 OpenRouter 响应头中提取计费信息：
   - `x-ratelimit-tokens-limit`
   - `x-ratelimit-tokens-remaining`
   - `x-ratelimit-requests-limit`
   - 或从响应 body 的 `usage` 字段获取

### OpenRouter 响应结构
```json
{
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  }
}
```

---

## 📦 需要安装的依赖

### 后端
```bash
cd backend
npm install better-sqlite3
```

### 前端
```bash
cd frontend
npm install react-router-dom
npm install @types/react-router-dom --save-dev
```

---

## 🚀 开发顺序（遵循 good_habits.md）

### 阶段1：数据库层（最底层）
1. 创建数据库 schema
2. 实现数据模型
3. 编写单元测试
4. ✅ 测试通过后进入下一阶段

### 阶段2：后端 API 层
1. 实现提示词管理 API
2. 实现审计 API
3. 更新生成接口使用数据库
4. 编写 API 集成测试
5. ✅ 测试通过后进入下一阶段

### 阶段3：前端路由
1. 安装 react-router-dom
2. 配置路由
3. 重构现有代码
4. ✅ 测试路由跳转正常

### 阶段4：管理后台 UI
1. 创建布局组件
2. 实现提示词管理页面
3. 实现审计表格页面
4. ✅ 每个组件完成后单独测试

### 阶段5：集成测试
1. 端到端测试完整流程
2. 边界情况处理
3. ✅ 所有功能验证通过

---

## ⚠️ 关键注意点

### 1. 激活版本切换
- 切换激活版本时，需要**事务处理**
- 先取消该标签下所有提示词的激活状态
- 再设置目标提示词为激活

### 2. 删除提示词
- **不允许**删除激活的提示词（先切换激活版本）
- 删除提示词时，关联的审计日志不删除（保留 prompt_id 为历史记录）

### 3. OpenRouter 计费信息提取
- 流式响应中可能不包含 usage 信息
- 需要在响应**完成后**获取（可能需要调用非流式API或从响应头获取）
- 如果无法获取，记录为 NULL

### 4. 审计表格性能
- 数据可能很多，必须支持**分页**
- 原始输出可能很长，列表中只显示摘要
- 点击行展开查看完整信息

---

## 🧪 测试检查清单

### 数据库层测试
- [ ] 创建提示词成功
- [ ] 更新提示词成功
- [ ] 删除提示词成功
- [ ] 激活版本切换成功（事务一致性）
- [ ] 查询激活版本正确
- [ ] 审计日志记录成功
- [ ] 审计日志查询成功（分页、筛选）

### API 层测试
- [ ] 所有 API 端点返回正确的数据格式
- [ ] 错误处理正确（400/404/500）
- [ ] CORS 配置正确

### 前端测试
- [ ] 路由跳转正常（/ 和 /platform）
- [ ] 提示词 CRUD 操作成功
- [ ] 审计表格显示正常
- [ ] 分页、排序、筛选正常
- [ ] 前台使用数据库提示词生成名字成功

---

## 📊 完成标准

- ✅ 数据库正常运行，数据持久化
- ✅ 提示词可以新建、编辑、删除
- ✅ 提示词版本管理正常
- ✅ 激活版本切换功能正常
- ✅ 前台使用激活提示词生成名字
- ✅ 审计日志记录到数据库
- ✅ 审计表格显示所有调用记录
- ✅ 计费信息正确显示（从 OpenRouter 获取）
- ✅ 管理后台视觉美观，操作流畅
- ✅ 所有单元测试和集成测试通过

---

## 🎯 预计总开发时间

- **数据库层**：2-3小时
- **后端 API**：2-3小时
- **前端路由**：1小时
- **管理后台 UI**：4-5小时
- **集成测试**：1-2小时
- **视觉优化**：1小时

**总计：11-15小时（约2个工作日）**

---

## 💡 技术选型理由

### 为什么选 SQLite？
- ✅ 轻量级，单文件存储
- ✅ 不需要额外的数据库服务器
- ✅ 支持完整的 SQL 功能
- ✅ 性能足够（小型应用）
- ✅ 方便备份（直接复制 .db 文件）

### 为什么用 better-sqlite3？
- ✅ 同步 API，代码更简洁
- ✅ 性能更好（比 node-sqlite3 快）
- ✅ TypeScript 支持好
- ✅ 社区活跃

### 为什么不用 ORM？
- ✅ 数据模型简单，直接 SQL 更清晰
- ✅ 减少依赖和学习成本
- ✅ 更好的性能控制

---

## 🔧 数据库备份和恢复

### 备份
```bash
cp backend/db/database.db backend/db/database.backup.db
```

### 恢复
```bash
cp backend/db/database.backup.db backend/db/database.db
```

---

## 📝 待办事项优先级

**P0 (必须)：**
- 数据库初始化
- 提示词 CRUD API
- 审计日志记录到数据库
- 管理后台基本布局
- 提示词管理页面
- 审计表格页面

**P1 (重要)：**
- 提示词版本管理
- 激活版本切换
- 审计日志筛选和分页
- 计费信息提取

**P2 (优化)：**
- 代码编辑器增强（Monaco Editor）
- 审计数据导出功能
- 图表可视化
- 权限管理

---

**准备好了吗？我按照这个计划开始实施！** 🚀


