# Narrow Down 功能开发计划

## 📋 项目概述
开发"Narrow Down"功能 - 帮助用户从一堆名字中通过AI分析选出最佳选项。

**页面路由**: `/narrow-down`

**视觉风格**: **Google Material Design 风格**
- 简洁明亮
- 卡片式设计
- 柔和阴影
- 蓝色系主色调

---

## 🎨 Google 风格视觉设计

### 配色方案（Google风）
```javascript
colors: {
  // 主色调：Google 蓝
  'google-blue': '#4285F4',
  'google-blue-dark': '#1967D2',
  
  // 背景色：明亮干净
  'bg-primary': '#FFFFFF',
  'bg-secondary': '#F8F9FA',
  'bg-hover': '#F1F3F4',
  
  // 文字色
  'text-primary': '#202124',
  'text-secondary': '#5F6368',
  'text-disabled': '#9AA0A6',
  
  // 强调色
  'accent-green': '#34A853',  // 成功
  'accent-yellow': '#FBBC04', // 警告
  'accent-red': '#EA4335',    // 错误
  
  // 卡片
  'card-bg': '#FFFFFF',
  'card-border': '#DADCE0',
  'card-shadow': 'rgba(0, 0, 0, 0.1)',
}
```

### 组件风格
- **卡片**: 白色背景，柔和阴影（`shadow-md`），圆角（`rounded-lg`）
- **按钮**: 扁平化，hover有轻微背景色变化
- **输入框**: 细边框，聚焦时蓝色下划线
- **字体**: Roboto / Google Sans

---

## 🔄 完整数据流转

### 阶段0: 用户输入
```
用户输入: user_input (包含上下文和名字列表)
```

### 阶段1: 提取名字 (list_names)
```javascript
调用: list_names
输入: {{user_input}}
输出格式: 纯文本，\n分隔
示例输出: "Catherine/Katherine/Kathryn\nEmma\nSophia"

前端处理:
const names = response.split('\n').filter(n => n.trim());
if (names.length > maxNames) {
  显示警告: "名字数量超过限制"
  return;
}
```

### 阶段2: 分析上下文 (isolate)
```javascript
调用: isolate
输入: {{user_input}}
输出格式: JSON
{
  "context_analysis": {
    "implicit_motives_concerns": "...",
    "explicit_constraints_conditions": "..."
  },
  "name_candidates": [
    {
      "numbering": 1,
      "name": "Catherine",
      "certainty": "...",
      "attachment": "..."
    },
    ...
  ]
}

前端处理:
- 保存 context_analysis
- 为每个 name_candidate 创建卡片
- 动效: 逐个生成卡片（手写效果）
```

### 阶段3: 并行获取名字信息 (information × N)
```javascript
并发调用: information (对每个名字)
并发数: 5
输入: 
  {{user_input}} - 完整的用户输入
  {{context_analysis}} - 从步骤2获得的分析
  {{isolated_names}} - 单个名字的对象:
    {
      "numbering": 1,
      "name": "Catherine",
      "certainty": "...",
      "attachment": "..."
    }

输出格式: JSON
{
  "name_candidates": [
    {
      "numbering": 1,
      "name": "Catherine",
      "evaluation": {
        "context_independent_criteria": {
          "perceptual_fluency": { "Benefit": "...", "Risks": "..." },
          "uniqueness": { "Benefit": "...", "Risks": "..." },
          "longevity_scalability": { "Benefit": "...", "Risks": "..." }
        },
        "context_dependent_criteria": {
          "conbination_harmony": { "Positive Fit": "...", "Negative Fit": "..." },
          "ecosystem_portfolio_fit": { "Positive Fit": "...", "Negative Fit": "..." },
          "cultural_contextual_fit": { "Positive Fit": "...", "Negative Fit": "..." }
        }
      }
    }
  ]
}

前端处理:
- 收到第1个名字的评估 → 更新该卡片显示"Analyzing uniqueness..."
- 收到第2个名字的评估 → 更新该卡片
- ...
- 全部完成后 → 进入步骤4
```

### 阶段4: 排名决策 (decide)
```javascript
调用: decide (单次调用)
输入:
  {{user_input}} - 用户输入
  {{context_analysis}} - 步骤2的分析
  {{name_information}} - 步骤3所有名字的evaluation汇总（数组）

输出格式: JSON
{
  "ranking_list": [
    {
      "numbering": 1,
      "name": "Catherine",
      "ranking": 1,  // 排名（1最好）
      "reason_of_ranking": "..."
    },
    ...
  ],
  "strong_opinion": "强烈推荐第一名的理由"
}

前端处理:
- 获得排名后
- 动效: 卡片洗牌（随机移动）
- 然后按 ranking 排序叠放
- 卡片此时不可点击
```

### 阶段5: 生成故事 (story × N)
```javascript
并发调用: story (对每个名字)
并发数: 5
输入:
  {{name_information}} - 该名字的完整evaluation
  {{ranking_and_reason}} - 该名字的ranking信息
    {
      "ranking": 1,
      "reason_of_ranking": "..."
    }
  {{context_analysis}} - 全局分析

输出格式: JSON
{
  "name": "Catherine",
  "numbering": 1,
  "story_title": "Catherine: A Timeless Choice",
  "story": "Catherine stands at the top..."
}

前端处理:
- 收到每个名字的故事后，保存到卡片数据
- 动效: 卡片边框电流效果（表示铭刻完成）
- 全部完成后：卡片可以 hover 抽出查看
```

---

## 🏗️ 系统架构设计

### 后端 API 设计

#### 新增端点：`/api/narrow-down`
```javascript
POST /api/narrow-down/process

请求体:
{
  "user_input": "完整的用户输入",
  "model": "anthropic/claude-4.5-sonnet" (可选)
}

响应: SSE 流式输出
event: tracking
data: { names: ["Name1", "Name2", ...], count: 3 }

event: tracking_error  
data: { error: "名字数量超过限制", maxNames: 5, actualCount: 8 }

event: isolate_complete
data: { 
  context_analysis: {...}, 
  name_candidates: [{...}, ...]
}

event: information_progress
data: { 
  numbering: 1, 
  name: "Catherine",
  current_dimension: "perceptual_fluency",
  progress: "3/6"
}

event: information_complete
data: {
  numbering: 1,
  name: "Catherine", 
  evaluation: {...}
}

event: decide_complete
data: {
  ranking_list: [...],
  strong_opinion: "..."
}

event: story_progress
data: {
  numbering: 1,
  name: "Catherine",
  status: "crafting"
}

event: story_complete
data: {
  numbering: 1,
  name: "Catherine",
  story_title: "...",
  story: "..."
}

event: done
data: { message: "完成" }
```

#### 新增配置管理端点
```javascript
GET /api/admin/settings
PUT /api/admin/settings
POST /api/admin/settings/reset

配置项:
{
  "max_names": 5,  // 名字数量限制
  "concurrent_limit": 5,  // 并发数限制
}
```

---

## 🗄️ 数据库扩展

### 新增 settings 表
```sql
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 默认配置
INSERT INTO settings (key, value, description) VALUES
  ('max_names', '5', '名字数量上限'),
  ('concurrent_limit', '5', 'API并发调用数限制');
```

### 扩展 audit_logs 表
```sql
-- 添加字段记录 narrow_down 相关信息
ALTER TABLE audit_logs ADD COLUMN workflow_type VARCHAR(50) DEFAULT 'generation';
-- workflow_type: 'generation' 或 'narrow_down'

ALTER TABLE audit_logs ADD COLUMN step_name VARCHAR(100);
-- step_name: 'list_names', 'isolate', 'information', 'decide', 'story'

ALTER TABLE audit_logs ADD COLUMN names_count INTEGER;
-- narrow_down 处理的名字数量
```

---

## 📦 后端实现任务

### Phase 1: 数据库和配置 (2-3小时)

#### 1.1 扩展数据库
- [ ] 创建 settings 表
- [ ] 插入默认配置
- [ ] 创建 Settings 模型
- [ ] 编写单元测试

#### 1.2 配置管理 API
- [ ] 实现 settingsController
- [ ] 创建 settings 路由
- [ ] 编写 API 测试

### Phase 2: Narrow Down 核心逻辑 (4-5小时)

#### 2.1 提示词变量替换
- [ ] 实现 `replacePromptVariables(template, variables)` 函数
- [ ] 支持多个占位符替换：
  - `{{user_input}}`
  - `{{context_analysis}}`
  - `{{isolated_names}}`
  - `{{name_information}}`
  - `{{ranking_and_reason}}`
- [ ] 编写单元测试

#### 2.2 并发API调用控制器
- [ ] 实现 `parallelAPICall(prompts, concurrentLimit)` 函数
- [ ] 限制并发数为5
- [ ] 支持进度回调
- [ ] 错误处理和重试机制
- [ ] 编写单元测试

#### 2.3 Narrow Down 流程编排
- [ ] 实现 `NarrowDownOrchestrator` 类
- [ ] 步骤1: list_names（解析\n分隔文本）
- [ ] 步骤2: isolate（解析JSON，保存context_analysis）
- [ ] 步骤3: information（并发5个，汇总结果）
- [ ] 步骤4: decide（单次调用，获取排名）
- [ ] 步骤5: story（并发5个，生成故事）
- [ ] 每步之间的数据传递和转换
- [ ] 编写集成测试

#### 2.4 SSE 流式端点
- [ ] 实现 `/api/narrow-down/process` 端点
- [ ] 发送各阶段的 SSE 事件
- [ ] 错误处理（名字超限等）
- [ ] 审计日志记录
- [ ] 编写 API 测试

---

## 🎨 前端实现任务

### Phase 3: 页面结构和路由 (1小时)

#### 3.1 创建页面
- [ ] 创建 `NarrowDownPage.tsx`
- [ ] 在 App.tsx 添加路由 `/narrow-down`
- [ ] 从首页添加入口（新按钮或菜单）

#### 3.2 布局结构
```
┌─────────────────────────────────────────┐
│            Header (Google风格)           │
├──────────┬──────────────────────────────┤
│          │  [上部分 - AI状态区]         │
│  输入区  │  高度: 20%                   │
│  30%宽   ├──────────────────────────────┤
│          │  [下部分 - 卡片展示区]       │
│          │  高度: 80%                   │
└──────────┴──────────────────────────────┘
```

### Phase 4: 状态管理 (1小时)

#### 4.1 创建 Narrow Down Store
- [ ] 创建 `useNarrowDownStore.ts`
- [ ] 状态管理：
  ```typescript
  {
    phase: 'idle' | 'tracking' | 'analyzing' | 'researching' | 'deciding' | 'crafting' | 'done',
    userInput: string,
    names: string[],
    contextAnalysis: object | null,
    nameCandidates: Array<NameCard>,
    rankingList: Array<RankingInfo>,
    currentStep: string,
    error: string | null,
  }
  ```

#### 4.2 定义 TypeScript 类型
- [ ] 创建 `narrowDown.ts` 类型文件
- [ ] 定义所有阶段的数据结构
- [ ] 导出接口和类型

### Phase 5: 输入区组件 (1小时)

#### 5.1 NarrowDownInput 组件
- [ ] 输入框（多行）
- [ ] 提交按钮（Google风格）
- [ ] 加载状态（电流边框动效）
- [ ] 超限警告提示

#### 5.2 电流边框动效
```css
@keyframes electricBorder {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.electric-border {
  border: 2px solid transparent;
  background: linear-gradient(90deg, #4285F4, #FBBC04, #EA4335, #34A853) 0 0 / 200% 100%;
  background-clip: padding-box, border-box;
  animation: electricBorder 2s linear infinite;
}
```

### Phase 6: 状态展示区 (1小时)

#### 6.1 StatusDisplay 组件
- [ ] 显示当前阶段文字
- [ ] 状态图标（Google Material Icons）
- [ ] 平滑过渡动画

#### 6.2 状态文案
```javascript
const statusMessages = {
  tracking: 'Tracking names...',
  analyzing: 'Context analyzing...',
  researching: 'Doing research...',
  deciding: 'Deciding...',
  crafting: 'Crafting stories...',
}
```

### Phase 7: 名字卡片组件 (3-4小时)

#### 7.1 NameCard 组件（Narrow Down版本）
- [ ] 卡片基础结构
- [ ] 正面：Name, story_title, story
- [ ] 背面：name_information（evaluation详情）
- [ ] 3D翻转效果（CSS transform）
- [ ] hover 抽出效果
- [ ] 卡片排名标记

#### 7.2 卡片状态管理
```typescript
interface NameCardData {
  numbering: number;
  name: string;
  
  // 步骤2获得
  certainty: string;
  attachment: string;
  
  // 步骤3获得
  evaluation: Evaluation | null;
  currentDimension: string | null; // 当前分析的维度
  
  // 步骤4获得
  ranking: number | null;
  reasonOfRanking: string | null;
  
  // 步骤5获得
  storyTitle: string | null;
  story: string | null;
  
  // UI状态
  isFlipped: boolean;  // 是否翻转到背面
  position: { x: number, y: number, z: number }; // 3D位置
}
```

#### 7.3 卡片生成动效
- [ ] 逐个出现（stagger）
- [ ] 手写效果（stroke-dashoffset 动画）

#### 7.4 分析状态显示
- [ ] 卡片上显示当前分析维度
- [ ] 维度名称英文显示：
  ```
  "Analyzing perceptual fluency..."
  "Analyzing uniqueness..."
  "Analyzing longevity..."
  "Analyzing combination harmony..."
  "Analyzing ecosystem fit..."
  "Analyzing cultural fit..."
  ```

#### 7.5 洗牌和排序动效
- [ ] 卡片随机移动（shuffle）
- [ ] 按 ranking 排序后叠放
- [ ] 使用 Framer Motion 的 layout 动画

#### 7.6 边框电流铭刻效果
- [ ] 步骤5时，卡片边框流动光效
- [ ] 使用 CSS animation

#### 7.7 Hover 抽出效果
- [ ] 卡片紧密排列（overlap）
- [ ] hover 时 translateY(-20px) + scale(1.05)
- [ ] 点击翻转到背面

### Phase 8: SSE 客户端封装 (2小时)

#### 8.1 创建 narrowDownAPI.ts
- [ ] 封装 `/api/narrow-down/process` 的 SSE 调用
- [ ] 解析不同的 event 类型
- [ ] 分发到对应的回调函数
- [ ] 错误处理

#### 8.2 回调函数设计
```typescript
interface NarrowDownCallbacks {
  onTracking: (data: { names: string[], count: number }) => void;
  onTrackingError: (data: { error: string }) => void;
  onIsolateComplete: (data: { context_analysis, name_candidates }) => void;
  onInformationProgress: (data: { numbering, name, current_dimension }) => void;
  onInformationComplete: (data: { numbering, evaluation }) => void;
  onDecideComplete: (data: { ranking_list, strong_opinion }) => void;
  onStoryProgress: (data: { numbering, status }) => void;
  onStoryComplete: (data: { numbering, story_title, story }) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}
```

### Phase 9: 集成和测试 (2小时)

#### 9.1 端到端测试
- [ ] 测试完整流程（5个名字）
- [ ] 测试超限情况（6个名字）
- [ ] 测试错误处理
- [ ] 测试动画流畅度

#### 9.2 边界情况
- [ ] 只有1个名字
- [ ] 名字数量正好等于限制
- [ ] API 调用失败时的降级
- [ ] 网络中断重连

---

## 🎯 关键技术难点和解决方案

### 难点1: 并发API调用控制

**问题**: 需要并发调用5个名字的API，但要控制并发数。

**解决方案**:
```javascript
async function parallelAPICall(tasks, concurrentLimit = 5) {
  const results = [];
  const executing = [];
  
  for (const [index, task] of tasks.entries()) {
    const promise = task().then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });
    
    results[index] = promise;
    executing.push(promise);
    
    if (executing.length >= concurrentLimit) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}
```

### 难点2: 提示词变量替换

**问题**: 不同步骤的提示词有不同的占位符，需要动态替换。

**解决方案**:
```javascript
function replacePromptVariables(template, variables) {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    const replacement = typeof value === 'object' 
      ? JSON.stringify(value, null, 2) 
      : value;
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  }
  
  return result;
}
```

### 难点3: 卡片3D叠放和hover抽出

**解决方案**:
```typescript
// 计算卡片位置（按ranking排列）
const getCardStyle = (ranking: number, totalCards: number, isHovered: boolean) => {
  const baseZ = totalCards - ranking; // ranking 1 在最上面
  const offsetY = (ranking - 1) * 60; // 每张卡片偏移60px
  
  return {
    zIndex: isHovered ? 999 : baseZ,
    transform: isHovered 
      ? `translateY(-80px) scale(1.05)` 
      : `translateY(${offsetY}px)`,
    transition: 'all 0.3s ease-out',
  };
};
```

### 难点4: 流式数据同步

**问题**: 5个information并发返回，前端需要正确匹配到对应的卡片。

**解决方案**: 使用 `numbering` 作为唯一标识：
```typescript
onInformationComplete: (data) => {
  const cardIndex = nameCandidates.findIndex(c => c.numbering === data.numbering);
  if (cardIndex >= 0) {
    updateCard(cardIndex, { evaluation: data.evaluation });
  }
}
```

---

## 📝 详细开发任务清单

### 🗄️ 数据库扩展 (Phase 1: 2-3小时)

- [ ] **Task 1.1**: 创建 settings 表的 SQL schema
- [ ] **Task 1.2**: 实现 Settings 模型（CRUD）
- [ ] **Task 1.3**: 为 Settings 模型编写单元测试 ✅ TDD
- [ ] **Task 1.4**: 扩展 audit_logs 表（添加 workflow_type, step_name, names_count）
- [ ] **Task 1.5**: 更新 AuditLog 模型支持新字段
- [ ] **Task 1.6**: 实现 settingsController
- [ ] **Task 1.7**: 创建 settings 路由
- [ ] **Task 1.8**: 编写 settings API 测试 ✅ TDD
- [ ] **Task 1.9**: 运行所有测试确保没有破坏现有功能

### 🔧 后端核心逻辑 (Phase 2: 4-5小时)

- [ ] **Task 2.1**: 实现 `replacePromptVariables` 函数
- [ ] **Task 2.2**: 为替换函数编写单元测试 ✅ TDD（各种边界情况）
- [ ] **Task 2.3**: 实现 `parallelAPICall` 函数（并发控制）
- [ ] **Task 2.4**: 为并发控制编写测试 ✅ TDD
- [ ] **Task 2.5**: 创建 `NarrowDownOrchestrator` 类
- [ ] **Task 2.6**: 实现步骤1 - list_names（解析\n文本，检查数量）
- [ ] **Task 2.7**: 实现步骤2 - isolate（JSON解析，提取context_analysis）
- [ ] **Task 2.8**: 实现步骤3 - information（并发5个，进度跟踪）
- [ ] **Task 2.9**: 实现步骤4 - decide（汇总information，获取排名）
- [ ] **Task 2.10**: 实现步骤5 - story（并发5个，生成故事）
- [ ] **Task 2.11**: 为 Orchestrator 编写集成测试
- [ ] **Task 2.12**: 实现 `/api/narrow-down/process` SSE 端点
- [ ] **Task 2.13**: 测试完整流程（3个名字）
- [ ] **Task 2.14**: 测试超限情况（6个名字）

### 🎨 前端状态和类型 (Phase 3: 1小时)

- [ ] **Task 3.1**: 创建 `narrowDown.ts` 类型文件
- [ ] **Task 3.2**: 定义所有数据结构接口
- [ ] **Task 3.3**: 创建 `useNarrowDownStore.ts` 状态管理
- [ ] **Task 3.4**: 定义所有 actions 和 reducers
- [ ] **Task 3.5**: 测试状态管理逻辑

### 🎨 前端组件开发 (Phase 4: 5-6小时)

#### 输入区组件
- [ ] **Task 4.1**: 创建 `NarrowDownInput.tsx`
- [ ] **Task 4.2**: 实现输入框和提交按钮（Google风格）
- [ ] **Task 4.3**: 实现电流边框动效（tracking时）
- [ ] **Task 4.4**: 实现超限警告提示

#### 状态展示区
- [ ] **Task 4.5**: 创建 `NarrowDownStatus.tsx`
- [ ] **Task 4.6**: 显示当前阶段文字和图标
- [ ] **Task 4.7**: 平滑过渡动画

#### 卡片组件
- [ ] **Task 4.8**: 创建 `NarrowDownCard.tsx`（核心组件）
- [ ] **Task 4.9**: 实现卡片基础结构（正面/背面）
- [ ] **Task 4.10**: 实现3D翻转效果（CSS transform + Framer Motion）
- [ ] **Task 4.11**: 正面内容：name, story_title, story, ranking标记
- [ ] **Task 4.12**: 背面内容：evaluation详情（6个维度）
- [ ] **Task 4.13**: 实现"分析中..."状态显示（英文维度名）
- [ ] **Task 4.14**: 实现手写卡片动效（SVG path animation）
- [ ] **Task 4.15**: 实现边框电流铭刻效果（步骤5）
- [ ] **Task 4.16**: 实现卡片叠放布局（按ranking）
- [ ] **Task 4.17**: 实现hover抽出效果（translateY + scale）

#### 卡片容器
- [ ] **Task 4.18**: 创建 `CardStack.tsx` 容器组件
- [ ] **Task 4.19**: 管理所有卡片的位置和状态
- [ ] **Task 4.20**: 实现洗牌动效（步骤4后）
- [ ] **Task 4.21**: 按ranking排序叠放

### 🌐 API 集成 (Phase 5: 2小时)

- [ ] **Task 5.1**: 创建 `narrowDownAPI.ts` 服务
- [ ] **Task 5.2**: 封装 SSE 连接
- [ ] **Task 5.3**: 解析各阶段 event
- [ ] **Task 5.4**: 实现进度回调
- [ ] **Task 5.5**: 错误处理和重试
- [ ] **Task 5.6**: 集成到 NarrowDownPage

### 🎨 页面集成 (Phase 6: 2小时)

- [ ] **Task 6.1**: 创建 `NarrowDownPage.tsx` 主页面
- [ ] **Task 6.2**: 整合所有子组件
- [ ] **Task 6.3**: 实现完整的用户旅程
- [ ] **Task 6.4**: 添加 Google 风格的页面样式
- [ ] **Task 6.5**: 响应式适配（移动端）
- [ ] **Task 6.6**: 在 App.tsx 添加路由
- [ ] **Task 6.7**: 在首页添加入口按钮

### 🎨 Google 风格优化 (Phase 7: 1-2小时)

- [ ] **Task 7.1**: 更新全局样式为 Google 风格
- [ ] **Task 7.2**: 更新按钮样式（Material Design）
- [ ] **Task 7.3**: 更新输入框样式
- [ ] **Task 7.4**: 添加 Material Icons
- [ ] **Task 7.5**: 调整阴影和圆角
- [ ] **Task 7.6**: 优化颜色过渡

### 🏢 管理后台扩展 (Phase 8: 1小时)

- [ ] **Task 8.1**: 在管理后台添加「系统配置」页面
- [ ] **Task 8.2**: 配置表单：max_names, concurrent_limit
- [ ] **Task 8.3**: 保存配置到数据库
- [ ] **Task 8.4**: 在 Sidebar 添加菜单项

### 🧪 集成测试和优化 (Phase 9: 2-3小时)

- [ ] **Task 9.1**: 测试完整 Narrow Down 流程
- [ ] **Task 9.2**: 测试各种边界情况
- [ ] **Task 9.3**: 性能优化（大量卡片时）
- [ ] **Task 9.4**: 动效流畅度优化
- [ ] **Task 9.5**: 移动端适配测试
- [ ] **Task 9.6**: 跨浏览器兼容性测试
- [ ] **Task 9.7**: 审计日志验证（记录了所有调用）

---

## 🔗 关键环节咬合详解

### 咬合点1: list_names → 数量检查
```javascript
// 后端
const namesText = await callAPI(listNamesPrompt, userInput);
const names = namesText.split('\n').filter(n => n.trim());
const maxNames = await Settings.get(db, 'max_names'); // 从数据库获取

if (names.length > maxNames) {
  // 发送错误事件
  res.write(`event: tracking_error\n`);
  res.write(`data: ${JSON.stringify({ 
    error: '名字数量超过限制', 
    maxNames, 
    actualCount: names.length 
  })}\n\n`);
  return;
}

// 成功，发送名字列表
res.write(`event: tracking\n`);
res.write(`data: ${JSON.stringify({ names, count: names.length })}\n\n`);
```

### 咬合点2: isolate → information (并发输入准备)
```javascript
// 步骤2完成后
const isolateResult = JSON.parse(isolateOutput);
const contextAnalysis = isolateResult.context_analysis;
const nameCandidates = isolateResult.name_candidates;

// 准备并发任务
const informationTasks = nameCandidates.map(candidate => {
  return async () => {
    const prompt = replacePromptVariables(informationTemplate, {
      user_input: userInput,
      context_analysis: JSON.stringify(contextAnalysis, null, 2),
      isolated_names: JSON.stringify(candidate, null, 2), // 单个名字对象
    });
    
    // 发送进度事件
    res.write(`event: information_progress\n`);
    res.write(`data: ${JSON.stringify({ 
      numbering: candidate.numbering,
      name: candidate.name,
      current_dimension: 'perceptual_fluency',
    })}\n\n`);
    
    const result = await callAPI(prompt);
    return JSON.parse(result);
  };
});

// 并发执行（最多5个同时）
const evaluations = await parallelAPICall(informationTasks, 5);
```

### 咬合点3: information → decide (数据汇总)
```javascript
// 所有 information 完成后
const allNameInformation = nameCandidates.map((candidate, index) => ({
  numbering: candidate.numbering,
  name: candidate.name,
  certainty: candidate.certainty,
  attachment: candidate.attachment,
  evaluation: evaluations[index].name_candidates[0].evaluation,
}));

// 调用 decide
const decidePrompt = replacePromptVariables(decideTemplate, {
  user_input: userInput,
  context_analysis: JSON.stringify(contextAnalysis, null, 2),
  name_information: JSON.stringify(allNameInformation, null, 2),
});

const decideResult = await callAPI(decidePrompt);
const { ranking_list, strong_opinion } = JSON.parse(decideResult);
```

### 咬合点4: decide → story (并发输入准备)
```javascript
// 为每个名字准备 story 任务
const storyTasks = allNameInformation.map(nameInfo => {
  return async () => {
    // 找到该名字的排名信息
    const rankingInfo = ranking_list.find(r => r.numbering === nameInfo.numbering);
    
    const prompt = replacePromptVariables(storyTemplate, {
      name_information: JSON.stringify(nameInfo, null, 2),
      ranking_and_reason: JSON.stringify({
        ranking: rankingInfo.ranking,
        reason_of_ranking: rankingInfo.reason_of_ranking,
      }, null, 2),
      context_analysis: JSON.stringify(contextAnalysis, null, 2),
    });
    
    const result = await callAPI(prompt);
    return JSON.parse(result);
  };
});

// 并发执行
const stories = await parallelAPICall(storyTasks, 5);
```

### 咬合点5: 前端状态同步
```typescript
// 在 narrowDownAPI.ts 中
eventSource.addEventListener('information_complete', (event) => {
  const data = JSON.parse(event.data);
  
  // 通过 numbering 找到对应的卡片
  callbacks.onInformationComplete?.({
    numbering: data.numbering,
    evaluation: data.evaluation,
  });
});

// 在 Store 中
onInformationComplete: (data) => {
  set((state) => {
    const updatedCards = state.nameCandidates.map(card => 
      card.numbering === data.numbering
        ? { ...card, evaluation: data.evaluation, currentDimension: null }
        : card
    );
    
    // 检查是否所有卡片都完成了
    const allComplete = updatedCards.every(c => c.evaluation !== null);
    
    return {
      nameCandidates: updatedCards,
      phase: allComplete ? 'deciding' : 'researching',
    };
  });
}
```

---

## 🎨 Google 风格组件示例

### 按钮（Google风格）
```tsx
<button className="
  px-6 py-2 rounded
  bg-google-blue hover:bg-google-blue-dark
  text-white font-medium
  shadow-sm hover:shadow-md
  transition-all duration-200
">
  Submit
</button>
```

### 卡片（Material Design）
```tsx
<div className="
  bg-white rounded-lg
  shadow-md hover:shadow-lg
  border border-card-border
  transition-shadow duration-200
">
  {/* 卡片内容 */}
</div>
```

### 输入框（Google风格）
```tsx
<div className="relative">
  <input className="
    w-full px-4 py-3
    border-b-2 border-gray-300
    focus:border-google-blue
    bg-transparent
    transition-colors
    outline-none
  " />
  <label className="absolute top-0 left-0 text-text-secondary">
    Enter your request
  </label>
</div>
```

---

## ⏱️ 预计开发时间

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| Phase 1 | 数据库扩展 | 2-3小时 |
| Phase 2 | 后端核心逻辑 | 4-5小时 |
| Phase 3 | 前端状态管理 | 1小时 |
| Phase 4 | 前端组件开发 | 5-6小时 |
| Phase 5 | API集成 | 2小时 |
| Phase 6 | 页面集成 | 2小时 |
| Phase 7 | Google风格优化 | 1-2小时 |
| Phase 8 | 管理后台扩展 | 1小时 |
| Phase 9 | 集成测试和优化 | 2-3小时 |

**总计**: 20-25小时（约3-4个工作日）

---

## ✅ 完成标准

### 功能完整性
- ✅ 能从用户输入中提取名字列表
- ✅ 名字数量超限时正确警告
- ✅ 完整执行5步流程
- ✅ 每步之间数据正确传递
- ✅ 卡片按 ranking 排序
- ✅ 卡片可以 hover 抽出和翻转
- ✅ 所有API调用被审计记录

### 动效完整性
- ✅ 输入框电流边框（tracking时）
- ✅ 卡片手写生成（基础版）
- ✅ 卡片分析状态更新
- ✅ 卡片洗牌动效
- ✅ 卡片边框电流（crafting时）
- ✅ 卡片hover抽出
- ✅ 3D翻转效果

### 视觉风格
- ✅ Google Material Design 风格
- ✅ 明亮干净的配色
- ✅ 柔和的阴影效果
- ✅ 蓝色系主色调
- ✅ 响应式布局

### 测试覆盖
- ✅ 后端单元测试（新增功能）
- ✅ 端到端测试（完整流程）
- ✅ 边界情况测试
- ✅ 性能测试（5个并发）

---

## 🐛 风险点和预案

### 风险1: 并发API调用可能被限流
**预案**: 
- 实现指数退避重试机制
- 可配置并发数（降低到3）
- 显示重试状态给用户

### 风险2: 提示词变量替换可能出错
**预案**:
- 完善的单元测试覆盖所有边界情况
- 替换前验证所有占位符存在
- 详细的错误日志

### 风险3: 卡片动效性能问题
**预案**:
- 使用 CSS transform（GPU加速）
- 限制同时hover的卡片数量
- 降级方案（简化动效）

### 风险4: JSON解析失败
**预案**:
- 多次尝试解析（移除markdown标记）
- 记录原始输出到审计日志
- 友好的错误提示

---

## 📚 参考资料

### Google Material Design
- 组件库: Material-UI / Material Design 文档
- 颜色系统: Google Material Color Tool
- 动效: Material Motion 指南

### 技术实现
- 3D卡片: CSS transform perspective
- 并发控制: Promise.race + Queue
- SSE流式: EventSource API

---

## 🎯 开发优先级

### P0 (必须 - 核心功能)
- 5步流程完整实现
- 数据正确传递和转换
- 卡片基本展示（ranking排序）
- 基础动效（淡入淡出）

### P1 (重要 - 用户体验)
- 电流边框动效
- 卡片洗牌动效
- hover抽出效果
- 3D翻转效果
- Google风格样式

### P2 (优化 - 细节打磨)
- 手写卡片动效
- 边框铭刻效果
- 进度条/百分比
- 音效（可选）

---

**开发计划已制定完成！** 

总计：**66个详细任务**，涵盖：
- ✅ 数据库扩展
- ✅ 后端5步流程编排
- ✅ 并发控制逻辑
- ✅ 前端状态管理
- ✅ Google风格UI组件
- ✅ 复杂动效实现
- ✅ 管理后台集成
- ✅ 完整测试覆盖

**准备好开始了吗？** 🚀


