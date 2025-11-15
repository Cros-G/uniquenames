# 🧪 Supabase 认证集成 - 全面测试指南

**测试日期**: 2025-11-15
**测试人**: 用户
**重要性**: 🔴 关键功能，必须全部通过

---

## 🎯 **测试前准备**

### **1. 清空浏览器状态**
```javascript
// 在 DevTools Console 执行
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **2. 确认服务运行**
- ✅ 后端：`http://localhost:3001` 运行中
- ✅ 前端：`http://localhost:5173` 运行中

---

## 📋 **测试场景清单**

### **场景1: 匿名用户试用（核心！）**

**步骤**:
1. 清空 localStorage
2. 访问 `http://localhost:5173/app/generate`
3. **第1次**：输入 "test 1"，点击 Generate
   - ✅ 应该正常生成
   - ✅ Console 显示：`generation 使用次数: 0 → 1`
4. 等待生成完成，刷新页面
5. **第2次**：输入 "test 2"，点击 Generate
   - ✅ 应该正常生成
   - ✅ Console 显示：`generation 使用次数: 1 → 2`
6. 等待生成完成，刷新页面
7. **第3次**：输入 "test 3"，点击 Generate
   - ✅ 应该弹出 LoginPrompt 弹窗
   - ✅ Console 显示：`超过使用限制，显示登录提示`
   - ❌ **不应该**调用 API

**验收标准**:
- [ ] 前2次正常使用
- [ ] 第3次弹窗，不调用 API
- [ ] localStorage 中 `usage_count_generation` = 2

---

### **场景2: Generate 和 Narrow Down 独立计数**

**步骤**:
1. 清空 localStorage
2. 使用 Generate 2次（达到限制）
3. 访问 `/app/narrow-down`
4. 尝试使用 Narrow Down
   - ✅ 应该正常使用（计数独立）
5. 再使用1次
6. 第3次应该弹窗

**验收标准**:
- [ ] Generate 和 Narrow Down 计数独立
- [ ] localStorage 有两个键：
  - `usage_count_generation` = 2
  - `usage_count_narrow_down` = 2

---

### **场景3: Email 登录流程**

**步骤**:
1. 访问 `/login`
2. 切换到 "Sign Up" 标签
3. 输入邮箱和密码（例如：`test@example.com` / `password123`）
4. 点击 "Sign Up"
5. 应该显示成功提示：
   - ✅ "Account created! Please check your email to verify."
6. 打开邮箱，点击验证链接（如果 Supabase 配置了邮件）
7. 验证后，回到 `/login`
8. 切换到 "Sign In" 标签
9. 输入相同的邮箱和密码
10. 点击 "Sign In"
11. 应该跳转到 `/` (Landing Page)
12. 右上角应该显示邮箱和 Logout 按钮

**验收标准**:
- [ ] 注册成功
- [ ] 邮件收到（如果配置了）
- [ ] 登录成功
- [ ] 跳转到 Landing Page
- [ ] 显示用户信息

---

### **场景4: Google 登录流程（重要！）**

**步骤**:
1. 清空 localStorage 和登录状态
2. 访问 `/login`
3. 点击 "Sign in with Google"
4. 应该跳转到 Google 登录页面
5. 选择 Google 账号并授权
6. 应该回调到 `/auth/callback`
7. 看到 "✅ Success! Authenticating..." 提示
8. 自动跳转到 `/` (Landing Page)
9. 右上角应该显示 Google 邮箱

**验收标准**:
- [ ] Google OAuth 跳转正常
- [ ] 回调处理成功
- [ ] 自动跳转
- [ ] 显示用户信息

---

### **场景5: 匿名历史迁移（核心功能！）**

**步骤**:
1. **准备匿名数据**：
   - 清空 localStorage
   - 匿名使用 Generate 1次
   - 匿名使用 Narrow Down 1次
   - 打开 DevTools Console，记录匿名 ID：
     ```javascript
     localStorage.getItem('uniquenames_anonymous_user_id')
     // 应该是：anon_xxxxx_xxxx
     ```
   
2. **登录**：
   - 访问 `/login`
   - 使用 Email 或 Google 登录
   
3. **观察 Console**：
   - 应该看到：
     ```
     🔄 [AuthContext] 检测到匿名历史，开始迁移...
     🔄 [MigrationAPI] 开始迁移...
     ✅ [AuthContext] 历史迁移成功: {migrated: 2, synced: 2, ...}
     🧹 [UserAuth] 清除匿名 ID
     ```

4. **验证迁移结果**：
   - 访问 `/app/records`
   - 应该看到之前匿名时的2个活动
   - localStorage 中匿名 ID 应该已清除：
     ```javascript
     localStorage.getItem('uniquenames_anonymous_user_id')
     // 应该是 null
     ```

**验收标准**:
- [ ] Console 显示迁移成功
- [ ] Records 页面显示匿名历史
- [ ] 匿名 ID 已清除
- [ ] 使用限制已重置（可以无限使用）

---

### **场景6: 登录后无限制使用**

**步骤**:
1. 确保已登录
2. 访问 `/app/generate`
3. 连续使用 3次、4次、5次...
   - ✅ 应该都能正常使用
   - ✅ Console 显示：`已登录用户，无限制`
   - ❌ **不应该**弹出 LoginPrompt

**验收标准**:
- [ ] 登录后无使用次数限制
- [ ] 不弹登录提示

---

### **场景7: 登出功能**

**步骤**:
1. 确保已登录
2. 在任意页面点击右上角 "Logout" 按钮
3. 应该看到 Console：
   ```
   👋 [AuthContext] 登出开始...
   ✅ [AuthContext] 登出成功
   👋 [AuthContext] 用户已登出
   ```
4. 右上角应该变回 "Login" 按钮
5. localStorage 中 Supabase session 应该清除

**验收标准**:
- [ ] 登出成功
- [ ] UI 状态更新
- [ ] Session 已清除

---

### **场景8: Records 页面（登录用户）**

**步骤**:
1. 确保已登录
2. 使用 Generate 生成几个名字
3. 使用 Narrow Down 分析几个名字
4. 访问 `/app/records`
5. 应该看到：
   - ✅ 两个统计卡片（Generate + Narrow Down）
   - ✅ 活动列表
   - ✅ 每个活动显示：
     - 类型图标（🎨 或 🎯）
     - 时间戳
     - 用户输入（截断）
     - 统计数据（steps, tokens, cost, duration）
   - ✅ 点击 "Show Details" 展开步骤详情

**验收标准**:
- [ ] 页面正常显示
- [ ] 数据正确
- [ ] 展开/折叠正常

---

### **场景9: Magic Link 登录（可选）**

**步骤**:
1. 访问 `/login`
2. 切换到 "Magic Link" 标签
3. 输入邮箱
4. 点击 "Send Magic Link"
5. 应该显示：
   - ✅ "Magic link sent! Please check your email."
6. 打开邮箱，点击链接
7. 应该自动登录并跳转

**验收标准**:
- [ ] 邮件发送成功
- [ ] Magic Link 登录成功

---

### **场景10: 错误处理**

**测试各种错误情况**:

1. **登录失败**：
   - 输入错误的密码
   - 应该显示错误提示

2. **网络错误**：
   - 关闭后端服务器
   - 尝试生成名字
   - 应该有友好的错误提示

3. **Token 过期**（难以测试，后续验证）

**验收标准**:
- [ ] 错误提示友好
- [ ] 不崩溃

---

## 📊 **测试结果记录**

### **通过的场景**:
- [ ] 场景1: 匿名试用
- [ ] 场景2: 独立计数
- [ ] 场景3: Email 登录
- [ ] 场景4: Google 登录
- [ ] 场景5: 历史迁移
- [ ] 场景6: 无限使用
- [ ] 场景7: 登出
- [ ] 场景8: Records 页面
- [ ] 场景9: Magic Link（可选）
- [ ] 场景10: 错误处理

---

## 🐛 **问题追踪**

如果测试中发现问题，记录在这里：

### **问题模板**:
```
【场景X】问题描述
- 预期行为：...
- 实际行为：...
- Console 错误：...
- 截图：...
```

---

## ✅ **测试完成标志**

所有场景通过后：
1. 勾选所有测试场景
2. 告诉 AI "测试全部通过"
3. AI 继续 Phase 10（清理优化）

---

**现在开始测试！有问题随时告诉我！** 🚀

