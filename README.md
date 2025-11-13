# ✨ AI 起名工具

基于 OpenRouter AI 的智能起名工具，提供沉浸式的名字生成和探索体验。

## 🎯 功能特点

### 前台功能（用户端）
- **AI 深度分析**：深入理解用户需求，提供精准的命名分析
- **智能策略制定**：基于分析结果制定个性化的命名策略
- **流式生成**：实时展示 AI 的思考过程
- **渐进式揭示**：卡片从模糊到清晰的探索式交互
- **AI 推荐**：智能推荐最佳名字方案
- **模型选择**：支持GPT-5/Claude-4.5/Gemini-2.5

### 管理后台功能
- **提示词管理**：新建/编辑/删除提示词，版本控制
- **激活版本切换**：灵活切换不同版本的提示词
- **完整审计日志**：记录所有API调用详情
- **费用统计**：Token使用量和费用实时统计
- **数据筛选**：按模型、时间、状态筛选日志

## 🛠 技术栈

### 后端
- **Node.js** + **Express** - 服务器框架
- **OpenRouter API** - AI 服务 (兼容 OpenAI 格式)
- **SSE (Server-Sent Events)** - 流式输出
- **Jest** - 单元测试

### 前端
- **React 18** + **TypeScript** - UI 框架
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **Framer Motion** - 动画库
- **Zustand** - 状态管理

## 📦 安装

### 1. 克隆项目
```bash
git clone <repository-url>
cd uniquenames_net
```

### 2. 安装后端依赖
```bash
cd backend
npm install
```

### 3. 配置环境变量
在 `backend` 目录下创建 `.env` 文件：
```env
OPENROUTER_API_KEY=your_api_key_here
PORT=3001
```

### 4. 安装前端依赖
```bash
cd ../frontend
npm install
```

## 🚀 运行

### 首次运行（重要）

**1. 初始化数据库并导入提示词：**
```bash
cd backend
node db/migrate.js
```

### 开发模式

**2. 启动后端：**
```bash
cd backend
npm run dev
```
后端将在 `http://localhost:3001` 运行

**3. 启动前端：**
```bash
cd frontend
npm run dev
```
前端将在 `http://localhost:5173` 运行

### 访问应用
- **前台（用户端）**: `http://localhost:5173/`
- **管理后台**: `http://localhost:5173/platform`

### 生产构建

**构建前端：**
```bash
cd frontend
npm run build
```

## 🧪 测试

### 后端单元测试
```bash
cd backend
npm test
```

### 后端流式输出测试（需要 API 密钥）
```bash
cd backend
node test-stream.js
```

## 📁 项目结构

```
uniquenames_net/
├── backend/                    # 后端服务
│   ├── server.js              # Express 服务器 + SSE 端点
│   ├── openrouter.js          # OpenRouter API 封装
│   ├── prompts/
│   │   └── generator.js       # 提示词生成器
│   ├── tests/                 # 单元测试
│   └── test-stream.js         # 流式输出集成测试
│
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── App.tsx            # 主应用
│   │   ├── components/        # UI 组件
│   │   │   ├── InputPanel.tsx
│   │   │   ├── NameCard.tsx   # 核心卡片组件
│   │   │   ├── WindButton.tsx
│   │   │   └── ...
│   │   ├── store/
│   │   │   └── useNamingStore.ts  # Zustand 状态管理
│   │   ├── services/
│   │   │   └── streamingAPI.ts    # SSE 客户端
│   │   └── types/
│   │       └── naming.ts          # TypeScript 类型定义
│   └── vite.config.ts
│
├── prompt_generation.xml       # AI 提示词模板
├── output_format.json          # 输出格式定义
└── README.md
```

## 🎨 用户旅程

### 前台（用户端）
1. **输入需求**：用户在左侧输入框描述起名需求
2. **AI 分析**：AI 分析需求并展示分析结果
3. **策略制定**：AI 提出命名策略
4. **生成名字**：5 张卡片逐个生成（初始模糊状态）
5. **揭示探索**：
   - 单击卡片逐个揭示
   - 或点击"吹一阵风"一次性揭示所有
6. **AI 推荐**：展示 AI 精选的最佳名字和推荐理由

### 管理后台
1. **点击右上角「管理后台」**进入
2. **提示词管理**：
   - 查看所有提示词版本
   - 新建/编辑提示词
   - 切换激活版本
3. **审计日志**：
   - 查看所有API调用记录
   - 查看Token使用和费用
   - 按模型筛选日志

## 🔧 开发规范

本项目遵循 `good_habits.md` 中定义的开发规范：
- **TDD (测试驱动开发)**：先写测试，再写代码
- **小步快跑**：每次只专注一个小任务
- **代码审查**：遵循 Linus Style，简洁清晰
- **诚实原则**：完成就是完成，不掩盖问题

## 📝 测试覆盖

当前测试状态：
- ✅ 提示词生成器：100% 覆盖率
- ✅ API 端点验证：所有端点测试通过
- ✅ OpenRouter 客户端：核心功能测试通过
- ⚠️ 集成测试需要真实 API 密钥

## 🎯 待完成功能

- [ ] 错误处理优化
- [ ] 移动端适配完善
- [ ] 性能优化
- [ ] 更多动画细节

## 📄 许可证

ISC

## 🙏 致谢

- [OpenRouter](https://openrouter.ai/) - AI API 服务
- [Anthropic Claude](https://www.anthropic.com/) - 默认使用的 AI 模型

