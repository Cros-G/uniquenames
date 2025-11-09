# 开发指南

## 🚀 快速开始

### 首次运行

1. **设置后端**
```bash
cd backend
npm install
# 创建 .env 文件并添加 API 密钥
echo "OPENROUTER_API_KEY=your_key_here" > .env
npm run dev
```

2. **设置前端**
```bash
cd frontend
npm install
npm run dev
```

3. **访问应用**
打开浏览器访问 `http://localhost:5173`

## 🧪 测试

### 后端测试

```bash
cd backend

# 运行所有单元测试
npm test

# 查看测试覆盖率
npm test -- --coverage

# 监听模式（自动重新运行）
npm run test:watch
```

### 手动集成测试

需要真实的 API 密钥：

```bash
cd backend
node test-stream.js
```

## 📦 项目结构详解

### 后端核心文件

- `server.js` - Express服务器主文件
  - Health check 端点
  - SSE 流式输出端点
  
- `openrouter.js` - OpenRouter API封装
  - `generateNames()` - 流式生成
  - `generateNamesSync()` - 同步生成（测试用）
  
- `prompts/generator.js` - 提示词处理
  - 读取XML模板
  - 注入用户context

### 前端核心文件

- `App.tsx` - 主应用，整合所有功能
- `store/useNamingStore.ts` - Zustand全局状态
- `services/streamingAPI.ts` - SSE客户端
- `components/` - UI组件库
  - `NameCard.tsx` - 核心卡片（模糊→清晰）
  - `InputPanel.tsx` - 输入区域
  - `OutputPanel.tsx` - 输出区域
  - `WindButton.tsx` - 揭示按钮
  - 其他辅助组件...

## 🎨 样式系统

### TailwindCSS 自定义配置

```javascript
// tailwind.config.js
colors: {
  'dark-bg': '#0F1419',      // 深色背景
  'card-bg': '#1A202C',      // 卡片背景
  'accent': '#8B5CF6',       // 强调色（紫色）
  'text-primary': '#F7FAFC', // 主文字
  'text-secondary': '#A0AEC0' // 次要文字
}
```

### 动画系统

使用 Framer Motion 实现：
- 卡片逐个出现（delay: index * 0.1）
- 模糊→清晰过渡
- 边框闪光效果（shimmer）
- 思考状态动画

## 🔧 开发技巧

### 调试后端

```javascript
// 在 server.js 中添加日志
console.log('📨 收到请求:', req.body);
```

### 调试前端状态

```typescript
// 在组件中使用
const store = useNamingStore();
console.log('当前状态:', store);
```

### 查看SSE流

在浏览器开发者工具中：
1. Network标签
2. 找到`generate-names`请求
3. 查看EventStream响应

## 📝 代码规范

遵循 `good_habits.md` 中的原则：

1. **函数简洁**：每个函数只做一件事
2. **类型安全**：充分利用 TypeScript
3. **错误处理**：明确处理所有错误情况
4. **测试优先**：先写测试，再写实现

### 命名规范

- 组件：`PascalCase` (e.g. `NameCard`)
- 函数：`camelCase` (e.g. `handleSubmit`)
- 常量：`UPPER_SNAKE_CASE` (e.g. `API_URL`)
- TypeScript接口：`PascalCase` + `Props`/`State` 后缀

## 🐛 常见问题

### 1. API密钥未设置

**症状**: 后端测试失败，提示 `OPENROUTER_API_KEY not found`

**解决**: 在 `backend/.env` 文件中设置API密钥

### 2. 前端无法连接后端

**症状**: CORS错误或连接被拒绝

**解决**: 
- 确保后端运行在 3001 端口
- 检查 `vite.config.ts` 中的代理配置

### 3. 卡片不显示

**症状**: 数据接收到但卡片不渲染

**解决**: 
- 检查浏览器控制台
- 确认 `nameCards` 状态更新
- 检查 React DevTools 中的状态

## 🔄 开发工作流

### 添加新功能

1. **定义类型** (`frontend/src/types/`)
2. **创建组件** (`frontend/src/components/`)
3. **更新状态** (如需要，修改 `useNamingStore.ts`)
4. **集成到App** (`App.tsx`)
5. **添加样式** (Tailwind classes)
6. **测试功能**

### 修复Bug

1. **重现问题** - 确认bug存在
2. **定位代码** - 使用console.log或debugger
3. **编写测试** - 先写失败的测试用例
4. **修复代码** - 让测试通过
5. **验证修复** - 手动测试

## 📚 有用的命令

```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 查看端口占用（Windows PowerShell）
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 构建生产版本
cd frontend
npm run build

# 预览生产构建
npm run preview
```

## 🎯 性能优化建议

1. **React.memo** 优化不必要的重渲染
2. **useMemo/useCallback** 缓存计算结果
3. **虚拟滚动** 如果名字列表很长
4. **懒加载组件** 使用 React.lazy

## 🚢 部署

### 后端部署（示例：Heroku）

```bash
# 添加 Procfile
echo "web: node server.js" > backend/Procfile

# 设置环境变量
heroku config:set OPENROUTER_API_KEY=your_key
```

### 前端部署（示例：Vercel）

```bash
cd frontend
vercel --prod
```

## 📞 获取帮助

- 查看 `good_habits.md` 了解开发原则
- 阅读 `README.md` 了解项目概览
- 查看组件内的注释了解具体实现

