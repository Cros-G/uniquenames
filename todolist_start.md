# AI起名工具站 - 完整开发方案

## 📋 项目概述
基于 OpenRouter AI 服务的起名工具，支持真正的流式输出，提供沉浸式的名字生成和探索体验。

---

## 🎨 视觉设计方案

### 整体风格定位
- **设计理念**：神秘探索 + 优雅揭示
- **氛围感**：像打开一本魔法书，逐渐揭示名字的含义
- **交互灵魂**：从模糊到清晰的渐进式惊喜

### 配色方案
**主色调：深邃优雅系**
- **主背景**：`#0F1419`（深海墨色） - 营造专注氛围
- **次背景**：`#1A202C`（卡片背景）
- **强调色**：`#8B5CF6`（紫罗兰） - AI思考状态、选中边框闪光
- **渐变色**：`linear-gradient(135deg, #667eea 0%, #764ba2 100%)` - 按钮、高光
- **文字色**：
  - 主文字：`#F7FAFC`（近白色）
  - 次要文字：`#A0AEC0`（灰蓝色）
  - 模糊状态：`blur(8px) + opacity(0.3)`

### 卡片设计
```
┌─────────────────────────────┐
│  [ 模糊状态 ]               │
│  ░░░░░░ (毛玻璃效果)        │
│  filter: blur(8px)          │
│                             │
│  点击后 → 清晰展开动画       │
└─────────────────────────────┘

[ 被AI选中的卡片 ]
- 边框动画：闪光流动效果
- 边框加粗：4px solid #8B5CF6
- box-shadow: 0 0 20px rgba(139, 92, 246, 0.6)
```

### 关键动画
1. **卡片生成**：从顶部淡入下落 (fade + translateY)
2. **揭示动画**："吹一阵风"触发所有卡片依次揭开（stagger delay: 100ms）
3. **边框闪光**：shimmer 动画，光晕从左到右流动
4. **思考状态**：脉动光点 + 文字渐变流动

---

## 🛠 技术栈选型

### 前端技术栈
```
核心框架：React 18 + TypeScript
构建工具：Vite（更快的开发体验）
样式方案：TailwindCSS + Framer Motion
- TailwindCSS：快速搭建现代UI
- Framer Motion：流畅动画库（卡片动画、揭示效果）

状态管理：Zustand（轻量级，比Redux简单）
网络请求：Fetch API + EventSource（SSE流式输出）
```

### 后端技术栈
```
运行时：Node.js 18+ / Bun（超快）
框架：Express.js
API集成：OpenRouter API
- 使用官方 openai 库（OpenRouter兼容OpenAI格式）
- 流式输出：stream: true

环境管理：dotenv（读取.env中的API密钥）
```

### 为什么选这个技术栈？
✅ **Vite + React**：业界最快的开发体验  
✅ **TypeScript**：类型安全，减少bug  
✅ **TailwindCSS**：快速实现视觉设计，无需写大量CSS  
✅ **Framer Motion**：专为React设计的动画库，完美匹配"卡片揭示"需求  
✅ **Node.js + Express**：简单直接，SSE支持原生  
✅ **OpenRouter**：支持多种模型切换，API兼容OpenAI格式

---

## 🏗 项目结构

```
uniquenames_net/
├── backend/                    # 后端服务
│   ├── server.js              # Express服务器 + SSE端点
│   ├── openrouter.js          # OpenRouter API封装
│   ├── prompts/               # 提示词管理
│   │   ├── generation.js      # 解析prompt_generation.xml
│   │   └── selection.js       # 解析prompt_selection.xml
│   ├── .env                   # API密钥
│   └── package.json
│
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── App.tsx            # 主应用
│   │   ├── components/
│   │   │   ├── InputPanel.tsx         # 左侧输入框
│   │   │   ├── OutputPanel.tsx        # 右侧输出区域
│   │   │   ├── ThinkingState.tsx      # AI思考状态组件
│   │   │   ├── AnalysisSection.tsx    # 需求分析区域
│   │   │   ├── StrategySection.tsx    # 起名策略区域
│   │   │   ├── NameCard.tsx           # 名字卡片（核心）
│   │   │   ├── WindButton.tsx         # "吹一阵风"按钮
│   │   │   └── PreferredReveal.tsx    # AI挑选展示
│   │   ├── store/
│   │   │   └── useNamingStore.ts      # 全局状态管理
│   │   ├── services/
│   │   │   └── streamingAPI.ts        # SSE流式请求封装
│   │   ├── animations/
│   │   │   └── cardVariants.ts        # Framer Motion动画配置
│   │   └── main.tsx
│   ├── tailwind.config.js     # TailwindCSS配置
│   └── package.json
│
├── prompt_generation.xml      # AI生成提示词（已有）
├── prompt_selection.xml       # AI选择提示词（已有）
├── output_format.json         # 输出格式定义（已有）
└── prompts.json               # 提示词配置（已有）
```

---

## 🔄 核心流程设计

### 1️⃣ 流式输出实现方案

#### 后端：SSE (Server-Sent Events)
```javascript
// backend/server.js
app.post('/api/generate-names', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await openrouterAPI.streamGeneration(req.body.context);
  
  // 解析流式JSON片段
  let buffer = '';
  for await (const chunk of stream) {
    buffer += chunk;
    // 尝试解析完整的JSON片段
    const parsed = tryParsePartial(buffer);
    if (parsed) {
      res.write(`data: ${JSON.stringify(parsed)}\n\n`);
    }
  }
  
  res.write('data: [DONE]\n\n');
  res.end();
});
```

#### 前端：EventSource接收
```typescript
// frontend/src/services/streamingAPI.ts
export function streamGenerateNames(context: string, callbacks: {
  onAnalysis: (text: string) => void;
  onStrategy: (text: string) => void;
  onNameCard: (name: NameCard) => void;
  onPreferred: (preferred: Preferred) => void;
  onComplete: () => void;
}) {
  const eventSource = new EventSource('/api/generate-names');
  
  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      callbacks.onComplete();
      eventSource.close();
      return;
    }
    
    const data = JSON.parse(event.data);
    // 根据数据类型分发到不同回调
    if (data.analysis) callbacks.onAnalysis(data.analysis);
    if (data.strategy) callbacks.onStrategy(data.strategy);
    if (data.name) callbacks.onNameCard(data);
    if (data.preferred) callbacks.onPreferred(data.preferred);
  };
}
```

### 2️⃣ 状态管理（Zustand）
```typescript
// frontend/src/store/useNamingStore.ts
interface NamingState {
  phase: 'idle' | 'analyzing' | 'strategizing' | 'generating' | 'selecting' | 'done';
  analysis: string;
  strategy: string;
  nameCards: NameCard[];
  preferred: Preferred | null;
  revealedCards: Set<number>;
  
  // Actions
  setPhase: (phase: Phase) => void;
  addNameCard: (card: NameCard) => void;
  revealCard: (index: number) => void;
  revealAll: () => void;
}
```

### 3️⃣ 用户交互流程
```
用户输入 context
    ↓
点击"确认"按钮
    ↓
后端发起 OpenRouter API 流式请求
    ↓
┌─────────────────────────────────┐
│  前端接收SSE流，分阶段渲染：     │
│                                 │
│  1. phase: analyzing            │
│     → 显示"正在分析需求..."      │
│     → 流式输出 analysis 文本     │
│                                 │
│  2. phase: strategizing         │
│     → 显示"正在制定策略..."      │
│     → 流式输出 strategy 文本     │
│                                 │
│  3. phase: generating           │
│     → 显示"正在创作名字..."      │
│     → 每收到一个name对象：       │
│       • 创建一张卡片（模糊状态） │
│       • 从上往下淡入动画         │
│                                 │
│  4. phase: selecting            │
│     → 显示"AI正在挑选..."        │
│     → 收到 preferred 数据        │
│                                 │
│  5. phase: done                 │
│     → 显示"吹一阵风"按钮         │
└─────────────────────────────────┘
    ↓
用户可以：
  A. 单击卡片 → 揭示该卡片内容
  B. 点击"吹一阵风" → 所有卡片依次揭示
    ↓
所有卡片清晰后
    ↓
AI选中的卡片边框闪光
    ↓
卡片下方展示 preferred_reason
```

---

## 🎯 核心组件实现要点

### NameCard 组件（最核心）
```tsx
<motion.div
  className="name-card"
  variants={cardVariants}
  initial="hidden"
  animate={isRevealed ? "revealed" : "blurred"}
  whileHover={{ scale: 1.05 }}
  onClick={() => onReveal(index)}
  style={{
    border: isPreferred ? '4px solid #8B5CF6' : '1px solid #2D3748',
    boxShadow: isPreferred ? '0 0 20px rgba(139, 92, 246, 0.6)' : 'none',
  }}
>
  <div className={isRevealed ? '' : 'blur-lg opacity-30'}>
    <h3>{name.name}</h3>
    <p>{name.reason}</p>
  </div>
  
  {isPreferred && isRevealed && (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="preferred-badge"
    >
      ✨ AI之选
    </motion.div>
  )}
</motion.div>
```

### "吹一阵风"动画
```tsx
const revealAllWithWind = () => {
  nameCards.forEach((_, index) => {
    setTimeout(() => {
      revealCard(index);
    }, index * 100); // 100ms间隔依次揭开
  });
};
```

### 边框闪光动画（CSS）
```css
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.preferred-card::before {
  content: '';
  position: absolute;
  inset: -4px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(139, 92, 246, 0.8),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: inherit;
}
```

---

## 📝 开发任务清单

### Phase 1: 项目初始化（1天）
- [ ] 创建 `backend/` 和 `frontend/` 目录
- [ ] 初始化 Node.js 后端（Express + OpenRouter集成）
- [ ] 初始化 Vite + React + TypeScript 前端
- [ ] 安装所有依赖（TailwindCSS, Framer Motion, Zustand等）
- [ ] 配置 TailwindCSS（自定义颜色、动画）
- [ ] 设置 `.env` 文件读取

### Phase 2: 后端核心功能（2天）
- [ ] 实现 OpenRouter API 封装（使用openai库）
- [ ] 解析 `prompt_generation.xml` 并动态注入用户context
- [ ] 实现 SSE 流式输出端点
- [ ] 处理 JSON 流式解析（可能需要处理不完整的JSON片段）
- [ ] 测试流式输出的稳定性

### Phase 3: 前端状态管理（1天）
- [ ] 使用 Zustand 创建全局状态
- [ ] 定义状态机（idle → analyzing → strategizing → generating → selecting → done）
- [ ] 实现 SSE 客户端封装
- [ ] 测试状态流转逻辑

### Phase 4: 前端UI组件（3天）
- [ ] 实现 InputPanel（左侧输入框）
- [ ] 实现 ThinkingState 组件（加载动画）
- [ ] 实现 AnalysisSection（流式显示分析）
- [ ] 实现 StrategySection（流式显示策略）
- [ ] **实现 NameCard 核心组件**
  - [ ] 模糊/清晰状态切换
  - [ ] 点击揭示动画
  - [ ] 选中状态边框闪光
- [ ] 实现 WindButton（吹一阵风按钮）
- [ ] 实现卡片生成的淡入下落动画
- [ ] 实现 PreferredReveal（AI挑选理由展示）

### Phase 5: 动画优化（1天）
- [ ] 使用 Framer Motion 完善所有过渡动画
- [ ] 实现边框闪光 shimmer 效果
- [ ] 优化"吹一阵风"的依次揭示动画
- [ ] 添加细微的交互反馈（hover、点击波纹）

### Phase 6: 整合测试（1天）
- [ ] 端到端测试完整流程
- [ ] 处理异常情况（API失败、超时等）
- [ ] 测试不同长度的输入
- [ ] 移动端适配检查

### Phase 7: 视觉打磨（1天）
- [ ] 调整配色细节
- [ ] 优化字体排版
- [ ] 添加微妙的背景纹理/渐变
- [ ] 暗色模式最终调优

---

## 🔌 OpenRouter API 集成要点

### API端点
```
https://openrouter.ai/api/v1/chat/completions
```

### 请求格式（兼容OpenAI）
```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'anthropic/claude-3.5-sonnet', // 推荐模型
    messages: [
      { role: 'system', content: promptTemplate },
      { role: 'user', content: userContext }
    ],
    stream: true, // 开启流式输出
  })
});
```

### 流式输出处理
OpenRouter返回的是SSE格式，每个chunk格式为：
```
data: {"choices":[{"delta":{"content":"分析"}}]}
```

需要逐步拼接content，并尝试解析成完整的JSON。

---

## 💡 关键技术难点与解决方案

### 难点1：流式JSON解析
**问题**：AI返回的JSON可能在传输过程中被分割  
**解决**：
- 使用状态机逐字符解析
- 或者让AI在每个部分之间插入分隔符（如`---SECTION:analysis---`）
- 或者分多次调用（先生成analysis+strategy，再生成names）

### 难点2：卡片模糊效果性能
**问题**：CSS blur 可能导致性能问题  
**解决**：
- 使用 `will-change: filter` 提升渲染性能
- 或者使用图片占位符代替blur

### 难点3：边框闪光动画实现
**问题**：复杂的动画可能卡顿  
**解决**：
- 使用 CSS animation 而非JS控制
- 使用 `transform` 和 `opacity`（GPU加速）

---

## 🎨 视觉参考与灵感来源

### 参考网站风格
1. **Linear.app** - 深色主题、优雅的动画
2. **Vercel** - 简洁的卡片设计
3. **Stripe Docs** - 渐变色使用
4. **Apple Design Awards** - 毛玻璃效果

### 动画参考
- **卡片生成**：类似 Notion 的页面加载动画
- **揭示效果**：类似刮刮乐的渐进式揭开
- **边框闪光**：类似游戏中的"传说级"物品光效

---

## 🚀 推荐的开发顺序

```
1. 先搭建静态UI（不接API）
   → 确定视觉风格和布局

2. 实现前端状态管理和动画
   → 用模拟数据测试所有交互

3. 开发后端SSE接口
   → 先返回固定数据测试流式输出

4. 集成OpenRouter API
   → 真实调用AI

5. 端到端联调
   → 修复细节问题

6. 视觉打磨和性能优化
```

---

## 📦 依赖清单

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "openai": "^4.20.0",
    "cors": "^2.8.5",
    "xml2js": "^0.6.2"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.7",
    "framer-motion": "^10.16.16"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## ✅ 完成标准

- ✅ 用户输入context后，能看到流畅的流式输出
- ✅ 5张卡片逐张生成，初始状态模糊
- ✅ 点击单张卡片能够揭示
- ✅ "吹一阵风"能让所有卡片依次揭开
- ✅ AI选中的卡片有闪光边框和特殊标识
- ✅ 整体视觉符合"神秘探索"的氛围
- ✅ 移动端自适应良好

---

**预计总开发时间：10个工作日**

你觉得这个方案如何？有没有需要调整的地方？ 😊

