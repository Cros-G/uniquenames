# 🎯 Session ID 实施方案 - 彻底解决活动分组问题

**目标**: 为每次活动分配唯一 session_id，实现精确分组和费用汇总
**创建日期**: 2025-11-15
**预计工时**: 1-2 小时

---

## 📋 问题分析

### **当前问题：**
1. 一次 Narrow Down = 5-10 条 audit_logs 记录（每个步骤一条）
2. 无法准确识别哪些记录属于同一次活动
3. 按时间分组不准确（跨分钟就分开了）
4. 费用无法汇总

### **根本原因：**
缺少 **session_id** 来关联同一次活动的所有步骤

---

## 🎯 解决方案

### **核心概念：**
```
一次活动 = 一个 session_id
├─ Generate: 1 个 session_id → 1-3 条记录（analyzing, strategizing, generating）
└─ Narrow Down: 1 个 session_id → 5+ 条记录（list_names, isolate, information×N, decide, story×N）
```

---

## 🗄️ 数据库层面

### **1. 添加 session_id 字段**

**SQLite 迁移脚本** (`backend/db/migrate-add-session-id.js`):
```javascript
ALTER TABLE audit_logs ADD COLUMN session_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_audit_session_id ON audit_logs(session_id);
```

**Supabase SQL** (`supabase_add_session_id.sql`):
```sql
ALTER TABLE audit_logs ADD COLUMN session_id VARCHAR(255);
CREATE INDEX idx_audit_session_id ON audit_logs(session_id);
```

---

## 🔧 后端实现

### **2. 生成 session_id**

**在流程开始时生成**：
```javascript
// server.js - /api/generate-names
const sessionId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// NarrowDownOrchestrator - constructor
this.sessionId = `narrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### **3. 传递 session_id**

**所有 AuditLog.create 调用都添加 session_id**：
```javascript
AuditLog.create(db, {
  // ... 其他字段
  sessionId: this.sessionId,  // ← 新增
});
```

**修改位置**：
- `server.js` - /api/generate-names（1处）
- `NarrowDownOrchestrator.js` - 5个步骤（5处）

### **4. 修改 AuditLog 模型**

**AuditLog.create**:
```javascript
INSERT INTO audit_logs (
  ..., session_id  // ← 新增
) VALUES (?, ?, ..., ?)
```

**SupabaseAuditLog.create**:
```javascript
.insert({
  ...,
  session_id: data.sessionId,  // ← 新增
})
```

---

## 🎨 前端实现

### **5. 修改分组逻辑**

**userAPI.ts - groupActivitiesByWorkflow**:
```typescript
function groupActivitiesByWorkflow(rawActivities: any[]): Activity[] {
  const grouped = new Map();
  
  rawActivities.forEach(activity => {
    // 改为按 session_id 分组
    const groupKey = activity.session_id || `${activity.timestamp}_${activity.workflow_type}`;
    
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        id: activity.id,
        sessionId: activity.session_id,  // ← 新增
        type: activity.workflow_type,
        timestamp: activity.timestamp,
        userInput: truncateText(activity.user_input, 100),
        steps: [],
        totalTokens: 0,
        totalCost: 0,  // ← 汇总所有步骤的费用
        totalDuration: 0,
        namesCount: activity.names_count || 0,
        success: true,
      });
    }
    
    // ... 聚合逻辑
  });
}
```

---

## 📂 详细任务清单

### **Phase A: 数据库迁移** ✅ **COMPLETED**
- [x] Task A.1: 创建 SQLite 迁移脚本 ✅
- [x] Task A.2: 创建 Supabase 迁移 SQL ✅
- [x] Task A.3: 执行 SQLite 迁移 ✅
- [x] Task A.4: 执行 Supabase 迁移 ✅
- [x] Task A.5: 验证字段添加成功 ✅

### **Phase B: 后端改造** ✅ **COMPLETED**
- [x] Task B.1: 修改 AuditLog.create 添加 session_id 参数 ✅
- [x] Task B.2: 修改 SupabaseAuditLog.create 添加 session_id ✅
- [x] Task B.3: 在 server.js 生成 session_id ✅
- [x] Task B.4: 在 NarrowDownOrchestrator 生成 session_id ✅
- [x] Task B.5: 传递 session_id 到所有 logAudit 调用 ✅（自动传递）
- [x] Task B.6: 测试后端（确保不破坏现有功能） ✅（所有测试通过）

### **Phase C: 前端改造** ✅ **COMPLETED**
- [x] Task C.1: 修改 Activity 类型定义（添加 sessionId） ✅
- [x] Task C.2: 修改 groupActivitiesByWorkflow（按 session_id 分组） ✅
- [x] Task C.3: 测试分组逻辑（无 TypeScript 错误） ✅

### **Phase D: 全面测试**
- [ ] Task D.1: 测试 Generate 活动（应该是1条记录）
- [ ] Task D.2: 测试 Narrow Down 活动（应该是1条记录，多个步骤）
- [ ] Task D.3: 验证费用汇总正确
- [ ] Task D.4: 验证 token 汇总正确
- [ ] Task D.5: 测试展开详情（应该显示所有步骤）

---

## 🔑 关键实现细节

### **session_id 格式：**
```
Generate: gen_1763218800123_abc123xyz
Narrow Down: narrow_1763218800456_def456uvw
```

### **费用汇总逻辑：**
```typescript
// 每个步骤的费用
step1: tokens_total = 100, cost_usd = 0.001
step2: tokens_total = 200, cost_usd = 0.002
step3: tokens_total = 150, cost_usd = 0.0015

// 活动总费用
totalTokens = 100 + 200 + 150 = 450
totalCost = 0.001 + 0.002 + 0.0015 = 0.0045
```

### **Records 展示：**
```
🎨 Generate - 2025-11-15 15:30
Input: "I need a baby name..."
💬 3 steps | 📊 450 tokens | 💰 $0.0045 | ⏱️ 5.2s
[Show Details ▼]
  └─ analyzing: 100 tokens, $0.001
  └─ strategizing: 200 tokens, $0.002  
  └─ generating: 150 tokens, $0.0015
```

---

## ⚠️ 注意事项

### **向后兼容：**
- 旧数据没有 session_id → 按原逻辑分组（时间+类型）
- 新数据有 session_id → 精确分组

### **错误处理：**
- session_id 生成失败 → 使用 timestamp 作为 fallback

### **测试覆盖：**
- 旧数据查询（无 session_id）
- 新数据查询（有 session_id）
- 混合数据查询

---

## 📊 预估工作量

| Phase | 任务数 | 预计时间 |
|-------|--------|----------|
| Phase A: 数据库迁移 | 5 | 20分钟 |
| Phase B: 后端改造 | 6 | 30分钟 |
| Phase C: 前端改造 | 3 | 20分钟 |
| Phase D: 测试验证 | 5 | 20分钟 |
| **总计** | **19** | **1.5小时** |

---

## ✅ 成功标准

1. **Records 页面**：
   - ✅ 一次 Generate = 1 条记录
   - ✅ 一次 Narrow Down = 1 条记录
   - ✅ 展开后显示所有步骤
   - ✅ 费用正确汇总
   - ✅ Token 正确汇总

2. **数据完整性**：
   - ✅ 旧数据仍能查询
   - ✅ 新数据精确分组
   - ✅ 无数据丢失

3. **测试覆盖**：
   - ✅ 所有单元测试通过
   - ✅ 手动测试通过

---

**方案已制定！准备开始吗？** 🚀

