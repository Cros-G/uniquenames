# 管理后台使用指南

## 🚀 启动系统

### 1. 启动后端
```bash
cd backend
npm run dev
```

✅ 启动成功后会显示：
```
🚀 Server is running on http://localhost:3001
📊 管理后台: http://localhost:3001/platform
```

### 2. 启动前端
```bash
cd frontend
npm run dev
```

✅ 启动成功后会显示：
```
➜  Local:   http://localhost:5173/
```

### 3. 访问应用
- **前台（用户端）**: `http://localhost:5173/`
- **管理后台**: `http://localhost:5173/platform`

---

## 📋 功能说明

### 🎨 前台功能（用户端）

#### 主要功能
1. **输入需求** - 左侧输入框描述起名需求
2. **流式生成** - AI实时生成名字
3. **渐进式揭示** - 卡片从模糊到清晰
4. **设置** - 选择AI模型（GPT-5/Claude-4.5/Gemini-2.5）

#### 右上角按钮
- ⚙️ **设置** - 选择AI模型
- 🏢 **管理后台** - 进入管理后台（绿色按钮）

---

### 🏢 管理后台功能

#### 1️⃣ 提示词管理 (`/platform/prompts`)

**主要功能：**
- ✅ 查看所有提示词（按标签分组）
- ✅ 新建提示词
- ✅ 编辑提示词
- ✅ 删除提示词（非激活状态）
- ✅ 激活版本切换

**提示词字段：**
- **名称** - 提示词的名称
- **版本** - 版本号（如 1.0, 2.0）
- **标签** - 分类标签（如 generation, selection）
- **内容** - 完整的提示词文本
- **默认模型** - 推荐使用的AI模型
- **激活状态** - 每个标签只能有一个激活版本

**激活版本规则：**
- 每个标签（tag）同时只能有**一个激活版本**
- 用户在前台生成名字时，自动使用对应标签的激活版本
- 管理员可以在后台随时切换激活版本
- 激活的提示词会显示 ✓ 激活中 绿色标记
- 不能删除激活的提示词（需先激活其他版本）

#### 2️⃣ 审计日志 (`/platform/audit`)

**主要功能：**
- ✅ 查看所有API调用记录（表格形式）
- ✅ 分页浏览（每页20条）
- ✅ 按模型筛选
- ✅ 查看详细信息（点击行展开）
- ✅ 清空所有日志

**审计信息包括：**
- **时间** - 调用时间
- **模型** - 使用的AI模型
- **用户输入** - 完整的用户输入
- **系统提示词** - 完整的prompt（可复制）
- **原始输出** - AI返回的完整响应
- **Token使用量** - Prompt/Completion/Total tokens
- **费用** - 美元计价（精确到0.000001）
- **耗时** - 调用耗时（秒）
- **状态** - 成功/失败

**统计卡片显示：**
- 总调用次数
- 成功/失败数量
- 总Token消耗
- 总费用（美元）
- 平均响应时间

---

## 🗄️ 数据库说明

### 数据库位置
`backend/db/database.db`

### 数据表

#### prompts 表（提示词）
```sql
- id: 主键
- name: 名称
- version: 版本号
- tag: 标签
- content: 内容
- default_model: 默认模型
- is_active: 是否激活 (0/1)
- created_at: 创建时间
- updated_at: 更新时间
```

#### audit_logs 表（审计日志）
```sql
- id: 主键
- timestamp: 时间戳
- model: 使用的模型
- prompt_id: 关联的提示词ID
- user_input: 用户输入
- system_prompt: 系统提示词
- raw_output: 原始输出
- tokens_prompt: Prompt tokens
- tokens_completion: Completion tokens
- tokens_total: 总 tokens
- cost_usd: 费用（美元）
- duration_ms: 耗时（毫秒）
- success: 是否成功 (0/1)
- error: 错误信息
```

### 备份数据库
```bash
# 备份
cp backend/db/database.db backend/db/database.backup.db

# 恢复
cp backend/db/database.backup.db backend/db/database.db
```

### 重置数据库
```bash
cd backend
rm db/database.db
node db/migrate.js
```

---

## 🔧 常见操作

### 新建提示词
1. 进入管理后台 → 提示词管理
2. 点击「+ 新建提示词」
3. 填写表单
4. 点击「保存」

### 切换激活版本
1. 找到要激活的提示词
2. 点击「激活」按钮
3. 该标签下其他版本自动取消激活

### 查看API调用详情
1. 进入管理后台 → 审计日志
2. 表格中点击任意一行
3. 右侧滑出详情面板
4. 可以查看完整的输入/输出/提示词

### 筛选审计日志
1. 使用顶部的下拉菜单选择模型
2. 表格会自动筛选
3. 点击「清除筛选」恢复全部

---

## 📊 API 端点

### 提示词管理
- `GET /api/admin/prompts` - 获取所有提示词
- `GET /api/admin/prompts/:id` - 获取单个提示词
- `GET /api/admin/prompts/active/:tag` - 获取激活版本
- `POST /api/admin/prompts` - 创建提示词
- `PUT /api/admin/prompts/:id` - 更新提示词
- `PUT /api/admin/prompts/:id/activate` - 激活版本
- `DELETE /api/admin/prompts/:id` - 删除提示词

### 审计日志
- `GET /api/admin/audit` - 获取审计日志（支持分页和筛选）
- `GET /api/admin/audit/stats` - 获取统计信息
- `GET /api/admin/audit/:id` - 获取单条日志
- `DELETE /api/admin/audit` - 清空所有日志

---

## 💡 使用技巧

### 1. 提示词版本管理最佳实践
- 使用语义化版本号（1.0, 1.1, 2.0）
- 重大修改增加主版本号
- 小修改增加次版本号
- 在激活新版本前，建议先测试

### 2. 审计日志查看
- 使用筛选功能快速定位问题
- 查看系统提示词了解AI收到的指令
- 对比不同模型的输出差异
- 监控Token使用和费用趋势

### 3. 费用优化
- 定期查看审计统计
- 对比不同模型的费用
- 优化提示词长度
- 删除不必要的旧日志

---

## 🎯 快速开始

### 第一次使用
1. **运行数据迁移**（将现有提示词导入数据库）
   ```bash
   cd backend
   node db/migrate.js
   ```

2. **启动服务**
   ```bash
   # 终端1 - 后端
   cd backend
   npm run dev
   
   # 终端2 - 前端
   cd frontend
   npm run dev
   ```

3. **访问管理后台**
   - 打开浏览器: `http://localhost:5173/platform`
   - 查看导入的提示词
   - 开始管理

### 日常使用
1. 前台生成名字（用户操作）
2. 管理后台查看审计（管理员）
3. 必要时切换提示词版本
4. 定期查看费用统计

---

## ⚠️ 注意事项

1. **激活版本** - 切换激活版本会立即影响前台生成
2. **删除提示词** - 不能删除激活的提示词
3. **数据库备份** - 定期备份 database.db 文件
4. **审计日志** - 会持续增长，定期清理节省空间
5. **费用计算** - 基于预估价格，实际费用以OpenRouter账单为准

---

## 🐛 故障排查

### 提示词无法激活
- **原因**: 提示词不存在或数据库错误
- **解决**: 检查数据库连接，查看后端日志

### 审计日志不显示
- **原因**: 数据库未初始化或连接失败
- **解决**: 运行 `node db/migrate.js` 初始化数据库

### Token和费用显示为 N/A
- **原因**: OpenRouter没有返回usage信息
- **解决**: 正常现象，部分模型不返回usage

---

## 📞 获取帮助

- 查看 `README.md` - 项目概述
- 查看 `DEVELOPMENT.md` - 开发指南
- 查看 `todolist_platform.md` - 管理后台开发计划
- 查看后端日志 - 调试问题
- 查看浏览器控制台 - 前端错误

---

## ✅ 测试状态

**后端单元测试：**
```
Test Suites: 7 passed, 7 total
Tests:       35 passed, 35 total
Coverage:    数据库层、API层、模型层
```

**功能完整性：**
- ✅ 数据库增删改查
- ✅ 提示词版本管理
- ✅ 激活版本切换
- ✅ 审计日志记录
- ✅ Token和费用统计
- ✅ 前后端路由
- ✅ 管理后台UI

---

**现在可以开始使用管理后台了！** 🎉


