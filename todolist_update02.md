# Narrow Down 卡片布局和动效重构 - Update 02

## 📋 修复概述

本次更新将**完全重构卡片布局和动效系统**：
1. **从堆叠布局改为网格布局**（3列，最多2行）
2. **添加铅笔打字动效**（名字从笔尖逐字出现）
3. **添加洗牌和重排动效**（ranking后）
4. **优化hover和翻转效果**（适配网格布局）

---

## 🎯 详细需求分析

### 需求1: 网格布局（3+2排列）

#### 当前实现
- ❌ 卡片堆叠重叠（absolute定位 + translateY偏移）
- ❌ 只能看到部分卡片
- ❌ 视觉效果"乱堆"

#### 期望效果
- ✅ 网格布局，卡片完全展开
- ✅ 桌面：3列
- ✅ 如果有5个名字：第一行3个，第二行2个（居中）
- ✅ 卡片之间有间距（建议24px）

#### 实现方案
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {sortedCards.map(card => (
    <NarrowDownCard key={card.numbering} card={card} />
  ))}
</div>
```

**布局示例（5个名字）：**
```
[ Card1 ] [ Card2 ] [ Card3 ]
   [ Card4 ] [ Card5 ]  (居中)
```

---

### 需求2: 铅笔打字动效

#### 视觉效果设计

**阶段时机：** isolate 完成后，逐个卡片生成

**动画流程：**
1. **T=0ms**: 空白卡片淡入
2. **T=200ms**: 铅笔图标出现在名字起始位置
3. **T=400ms**: 开始打字
   - 每个字母 80ms
   - 字母从笔尖"写出"
   - 铅笔随着字母位置移动
4. **名字写完**: 铅笔淡出（300ms fade out）
5. **完成**: 只显示名字

**实现技术：**
- 使用 `useState` 跟踪当前显示的字符数
- 使用 `useEffect` + `setTimeout` 控制打字速度
- 铅笔 SVG 图标，使用 `motion.div` 动画移动
- 名字使用 `substring(0, currentLength)` 逐字显示

#### 代码结构
```tsx
const [typedLength, setTypedLength] = useState(0);
const [showPencil, setShowPencil] = useState(true);

useEffect(() => {
  if (typedLength < card.name.length) {
    const timer = setTimeout(() => {
      setTypedLength(typedLength + 1);
    }, 80);
    return () => clearTimeout(timer);
  } else {
    // 写完了，隐藏铅笔
    setTimeout(() => setShowPencil(false), 300);
  }
}, [typedLength]);

return (
  <div className="relative">
    <span>{card.name.substring(0, typedLength)}</span>
    {showPencil && (
      <motion.div 
        className="inline-block ml-1"
        animate={{ x: [0, 2, 0] }}
      >
        ✏️
      </motion.div>
    )}
  </div>
);
```

---

### 需求3: Ranking 洗牌和重排

#### 视觉效果设计

**时机：** decide 完成后

**动画流程：**
1. **T=0ms**: 当前网格位置（isolate时的顺序）
2. **T=0-1000ms**: 洗牌
   - 所有卡片同时随机移动
   - 使用 Framer Motion 的 `layout` 动画
   - 卡片可能重叠、旋转、缩放
3. **T=1000-2000ms**: 重新排列
   - 按 ranking 排序（1, 2, 3, 4, 5）
   - 卡片平滑移动到新位置
   - 第一名在左上角
4. **T=2000ms**: 排名数字淡入（右上角圆形标记）

**实现技术：**
- 使用 `AnimatePresence` + `layout` 动画
- 两个状态：`isShuffling` 和 `isSorted`
- 洗牌时添加随机的 `rotate`, `scale`, `x`, `y`

---

### 需求4: Hover 和翻转（适配网格）

#### Hover 效果
- 不再需要"抽出"
- 改为：**轻微上浮 + 缩放**
  - `translateY(-8px)`
  - `scale(1.03)`
  - 阴影增强（shadow-md → shadow-xl）

#### 翻转效果
- 保持 3D 翻转
- 点击卡片翻转查看背面评估详情
- 翻转动画保持原样（600ms）

---

## 📝 详细修复任务

### Phase 1: 布局重构（预计30分钟）

#### Task 1.1: 修改 CardStack 为网格布局
- [ ] 移除 `position: absolute` 和堆叠逻辑
- [ ] 改用 CSS Grid：`grid-cols-3`
- [ ] 移除容器高度计算（使用 auto）
- [ ] 添加 gap-6（24px 间距）

**修改文件：** `CardStack.tsx`

```tsx
// 旧代码（堆叠）
<div className="relative" style={{ height: `${480 + sortedCards.length * 80}px` }}>
  {sortedCards.map((card, index) => (
    <div className="absolute w-full" style={getStackStyle()}>
      <NarrowDownCard ... />
    </div>
  ))}
</div>

// 新代码（网格）
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {sortedCards.map((card) => (
    <NarrowDownCard ... />
  ))}
</div>
```

#### Task 1.2: 修改 NarrowDownCard 移除堆叠相关代码
- [ ] 移除 `getStackStyle()` 函数
- [ ] 移除 `absolute` 定位
- [ ] 移除 `stackPosition` 和 `totalCards` props
- [ ] 简化为普通卡片

**修改文件：** `NarrowDownCard.tsx`

---

### Phase 2: 铅笔打字动效（预计45分钟）

#### Task 2.1: 创建 TypewriterName 组件
- [ ] 创建独立的打字效果组件
- [ ] Props: `name`, `speed`（默认80ms）
- [ ] 状态管理：`typedLength`, `showPencil`
- [ ] 使用 `useEffect` 实现逐字显示

**新文件：** `frontend/src/components/narrow/TypewriterName.tsx`

```tsx
export function TypewriterName({ name, speed = 80 }) {
  const [typedLength, setTypedLength] = useState(0);
  const [showPencil, setShowPencil] = useState(true);

  useEffect(() => {
    if (typedLength < name.length) {
      const timer = setTimeout(() => {
        setTypedLength(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // 写完后等待300ms，然后隐藏铅笔
      const timer = setTimeout(() => setShowPencil(false), 300);
      return () => clearTimeout(timer);
    }
  }, [typedLength, name.length, speed]);

  return (
    <div className="flex items-center">
      <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 
                       bg-clip-text text-transparent">
        {name.substring(0, typedLength)}
      </span>
      {showPencil && (
        <motion.span 
          className="text-2xl ml-1"
          animate={{ 
            x: [0, 2, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
          }}
        >
          ✏️
        </motion.span>
      )}
    </div>
  );
}
```

#### Task 2.2: 集成到 NarrowDownCard
- [ ] 在卡片正面使用 `TypewriterName`
- [ ] 仅在卡片刚生成时显示打字效果
- [ ] 添加状态判断：`isTyping`
- [ ] 打字完成后显示完整名字

**修改逻辑：**
```tsx
// 在卡片数据中添加
interface NameCardData {
  ...
  hasTyped?: boolean; // 是否已完成打字
}

// 在卡片组件中
{!card.hasTyped ? (
  <TypewriterName 
    name={card.name} 
    onComplete={() => markAsTyped(card.numbering)}
  />
) : (
  <h3>{card.name}</h3>
)}
```

---

### Phase 3: Ranking 洗牌动效（预计30分钟）

#### Task 3.1: 添加洗牌状态
- [ ] 在 Store 中添加 `isShuffling` 状态
- [ ] 在 `setRankingList` 时触发洗牌

#### Task 3.2: 实现洗牌动效
- [ ] 使用 Framer Motion 的 `layout` 动画
- [ ] 洗牌阶段：随机 rotate, x, y
- [ ] 持续时间：1秒
- [ ] 然后按 ranking 重新排序

**实现代码：**
```tsx
<motion.div
  layout  // 关键：自动动画布局变化
  animate={isShuffling ? {
    rotate: Math.random() * 360 - 180,
    x: Math.random() * 200 - 100,
    y: Math.random() * 200 - 100,
  } : {
    rotate: 0,
    x: 0,
    y: 0,
  }}
  transition={{ duration: isShuffling ? 0.8 : 0.5 }}
>
  <NarrowDownCard ... />
</motion.div>
```

#### Task 3.3: 排序后显示排名
- [ ] 右上角圆形排名标记（保持）
- [ ] 第一名添加特殊效果（金色边框/光晕）

---

### Phase 4: Hover 优化（预计15分钟）

#### Task 4.1: 调整 Hover 效果（网格模式）
- [ ] 移除 `translateY(-100px)`（不需要抽出了）
- [ ] 改为轻微上浮：`translateY(-8px)`
- [ ] 添加缩放：`scale(1.03)`
- [ ] 阴影增强：`shadow-lg` → `shadow-xl`

---

## 🗂️ 需要修改的文件

### 主要修改
1. **CardStack.tsx** - 从堆叠改为网格
2. **NarrowDownCard.tsx** - 简化定位逻辑，调整hover
3. **TypewriterName.tsx** - 新建打字效果组件
4. **useNarrowDownStore.ts** - 添加 `hasTyped`, `isShuffling` 状态
5. **NarrowDownPage.tsx** - 添加洗牌触发逻辑

### 不需要修改
- ✓ NarrowDownInput（已优化）
- ✓ NarrowDownStatus（已优化）
- ✓ narrowDownAPI（逻辑正确）

---

## 📐 布局示例

### 网格布局（5个名字）
```
桌面（lg: 3列）：
┌───────────┬───────────┬───────────┐
│  Card #1  │  Card #2  │  Card #3  │
│  Emma     │  Sophia   │  Olivia   │
└───────────┴───────────┴───────────┘
   ┌───────────┬───────────┐
   │  Card #4  │  Card #5  │
   │  Ava      │  Isabella │
   └───────────┴───────────┘
   (第二行居中)

平板（md: 2列）：
┌───────────┬───────────┐
│  Card #1  │  Card #2  │
└───────────┴───────────┘
┌───────────┬───────────┐
│  Card #3  │  Card #4  │
└───────────┴───────────┘
┌───────────┐
│  Card #5  │ (居中)
└───────────┘

移动（1列）：
┌───────────┐
│  Card #1  │
└───────────┘
┌───────────┐
│  Card #2  │
└───────────┘
...
```

---

## 🎬 动效时间轴

### Isolate 阶段（生成卡片）
```
T=0ms     : 第1张卡片淡入（空白）
T=0-640ms : 铅笔写"Emma"（4字母 × 80ms + 铅笔动画）
T=640ms   : 铅笔淡出
T=940ms   : 完成

T=100ms   : 第2张卡片淡入
T=100-820ms: 铅笔写"Sophia"（6字母 × 80ms）
...

(每张卡片错开100ms开始)
```

### Deciding 阶段（洗牌）
```
T=0ms     : 开始洗牌
T=0-1000ms: 卡片随机飞舞（rotate, x, y）
T=1000ms  : 洗牌结束

T=1000-2000ms: 按ranking重新排列
  - #1 移动到左上角 (0,0)
  - #2 移动到中上 (1,0)
  - #3 移动到右上 (2,0)
  - #4 移动到左下 (0,1) 居中
  - #5 移动到中下 (1,1) 居中

T=2000ms  : 排名数字淡入
```

### Crafting 阶段（铭刻故事）
```
T=0ms     : 所有卡片边框开始电流效果
T=0-3000ms: 逐个接收故事
  - 每接收一个，该卡片电流停止
  - 故事内容淡入
T=3000ms  : 全部完成
```

---

## 📝 详细开发任务

### Phase 1: 布局重构为网格（1小时）

#### Task 1.1: 修改 CardStack 组件
- [ ] 移除所有堆叠相关代码
- [ ] 改用 CSS Grid 布局
- [ ] 定义响应式列数（1/2/3列）
- [ ] 添加 gap-6（24px 间距）
- [ ] 移除容器高度计算（改为 auto）

**修改内容：**
```tsx
// 移除堆叠逻辑，改为简单网格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 
                justify-items-center">
  {sortedCards.map((card) => (
    <motion.div
      key={card.numbering}
      layout  // 关键：支持位置变化动画
      className="w-full max-w-md"
    >
      <NarrowDownCard
        card={card}
        onFlip={() => onFlipCard(card.numbering)}
        onHover={(isHovered) => onHoverCard(card.numbering, isHovered)}
      />
    </motion.div>
  ))}
</div>
```

#### Task 1.2: 简化 NarrowDownCard 组件
- [ ] 移除 `stackPosition`, `totalCards` props
- [ ] 移除 `getStackStyle()` 函数
- [ ] 移除 `absolute` 定位
- [ ] 改为普通 relative 定位
- [ ] 保留高度 480px

**Props 变化：**
```tsx
// 旧的
interface NarrowDownCardProps {
  card: NameCardData;
  onFlip: () => void;
  onHover: (isHovered: boolean) => void;
  stackPosition: number;  // ← 移除
  totalCards: number;     // ← 移除
}

// 新的
interface NarrowDownCardProps {
  card: NameCardData;
  onFlip: () => void;
  onHover: (isHovered: boolean) => void;
}
```

#### Task 1.3: 调整 Hover 效果（网格模式）
- [ ] 移除大幅抽出效果
- [ ] 改为轻微上浮：`translateY(-8px)`
- [ ] 添加缩放：`scale(1.03)`
- [ ] 阴影增强：`shadow-lg` → `shadow-xl`

**Hover 样式：**
```tsx
<motion.div
  whileHover={{
    y: -8,
    scale: 1.03,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  }}
  transition={{ duration: 0.2 }}
>
```

---

### Phase 2: 铅笔打字动效（1小时）

#### Task 2.1: 创建 TypewriterName 组件
- [ ] 创建 `TypewriterName.tsx`
- [ ] 实现打字机效果（80ms/字母）
- [ ] 添加铅笔图标动画
- [ ] 铅笔位置跟随文字末尾
- [ ] 完成后回调通知父组件

**组件接口：**
```tsx
interface TypewriterNameProps {
  name: string;
  speed?: number;  // 默认80ms
  onComplete?: () => void;
}
```

#### Task 2.2: 在 Store 中添加打字状态
- [ ] 添加 `hasTyped` 字段到 NameCardData
- [ ] 添加 `markAsTyped(numbering)` action
- [ ] 初始化时 `hasTyped: false`

#### Task 2.3: 集成到 NarrowDownCard
- [ ] 判断是否需要打字效果
- [ ] 如果 `!hasTyped`，显示 `TypewriterName`
- [ ] 如果 `hasTyped`，显示普通标题
- [ ] 打字完成后调用 `markAsTyped`

**条件渲染：**
```tsx
{!card.hasTyped ? (
  <TypewriterName 
    name={card.name}
    onComplete={() => onTypingComplete(card.numbering)}
  />
) : (
  <h3 className="text-3xl font-bold ...">
    {card.name}
  </h3>
)}
```

#### Task 2.4: 在 Page 中传递回调
- [ ] 在 NarrowDownPage 添加 `handleTypingComplete`
- [ ] 调用 `store.markAsTyped()`

---

### Phase 3: 洗牌和重排动效（1小时）

#### Task 3.1: 在 Store 添加洗牌状态
- [ ] 添加 `isShuffling: boolean`
- [ ] 添加 `startShuffle()` action
- [ ] 添加 `endShuffle()` action

#### Task 3.2: 在 setRankingList 时触发洗牌
- [ ] 调用 `startShuffle()`
- [ ] 1秒后调用 `endShuffle()`
- [ ] 同时更新 ranking 信息

**逻辑：**
```typescript
setRankingList: (rankings) => {
  set({ isShuffling: true });
  
  // 1秒后结束洗牌，开始排序
  setTimeout(() => {
    set((state) => ({
      isShuffling: false,
      rankingList: rankings,
      cards: state.cards.map(card => {
        const rank = rankings.find(r => r.numbering === card.numbering);
        return rank ? { ...card, ranking: rank.ranking, ... } : card;
      }),
    }));
  }, 1000);
};
```

#### Task 3.3: 在 CardStack 中处理洗牌
- [ ] 从 Store 获取 `isShuffling`
- [ ] 洗牌时给每张卡片添加随机变换
- [ ] 洗牌结束后按 ranking 排序
- [ ] 使用 `layout` prop 自动动画

**洗牌效果：**
```tsx
<motion.div
  layout
  animate={isShuffling ? {
    rotate: Math.random() * 360 - 180,
    x: Math.random() * 200 - 100,
    y: Math.random() * 200 - 100,
    scale: 0.9,
  } : {
    rotate: 0,
    x: 0,
    y: 0,
    scale: 1,
  }}
>
```

#### Task 3.4: 排名标记淡入
- [ ] ranking 确定后，排名数字延迟淡入
- [ ] 使用 `AnimatePresence` + `motion.div`

---

### Phase 4: 测试和微调（30分钟）

#### Task 4.1: 浏览器测试
- [ ] 测试网格布局（1/2/3列响应式）
- [ ] 测试打字动效（速度、流畅度）
- [ ] 测试洗牌动效（视觉效果）
- [ ] 测试 hover 效果
- [ ] 测试翻转效果

#### Task 4.2: 边界情况测试
- [ ] 测试1个名字的情况
- [ ] 测试5个名字的情况
- [ ] 测试特别长的名字
- [ ] 测试特别长的故事

#### Task 4.3: 性能优化
- [ ] 检查动画是否流畅（60fps）
- [ ] 减少不必要的重渲染
- [ ] 优化打字效果的 timer

---

## ⏱️ 预计总时间

| Phase | 任务 | 预计时间 |
|-------|------|---------|
| Phase 1 | 布局重构为网格 | 1小时 |
| Phase 2 | 铅笔打字动效 | 1小时 |
| Phase 3 | 洗牌和重排 | 1小时 |
| Phase 4 | 测试和微调 | 30分钟 |
| **总计** | | **3.5小时** |

---

## ✅ 完成标准

### 布局
- ✅ 网格布局（3列桌面，2列平板，1列移动）
- ✅ 卡片不重叠
- ✅ 间距合适（24px）
- ✅ 第二行居中对齐

### 动效
- ✅ 铅笔打字效果流畅（80ms/字母）
- ✅ 铅笔在名字右侧，跟随移动
- ✅ 洗牌效果有趣（随机飞舞）
- ✅ 重排效果平滑（1秒过渡）
- ✅ Hover 轻微上浮 + 缩放
- ✅ 翻转效果保持流畅

### 视觉
- ✅ 符合 design_system.md（温暖明亮）
- ✅ 卡片内容不超出边界
- ✅ 文字大小合适
- ✅ 阴影柔和
- ✅ 第一名有特殊标记

---

## 🎨 关键技术实现

### 网格居中第二行（CSS技巧）
```css
/* 当第二行只有2个元素时居中 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
}

/* 或使用 auto-fit */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  justify-items: center;
}
```

### 铅笔跟随文字
```tsx
// 测量文字宽度，铅笔紧跟
<div style={{ display: 'inline-flex', alignItems: 'center' }}>
  <span ref={textRef}>{displayedText}</span>
  {showPencil && (
    <motion.span className="ml-1">✏️</motion.span>
  )}
</div>
```

### Framer Motion Layout 动画
```tsx
// 自动处理位置变化
<motion.div layout transition={{ duration: 0.5 }}>
```

---

## 🔧 开发顺序（遵循 good_habits.md）

1. **Phase 1: 布局重构**（最基础）
   - 先改网格，确保布局正确
   - ✅ 测试通过后进入下一步

2. **Phase 2: 打字效果**（独立功能）
   - 创建组件，单独测试
   - 集成到卡片
   - ✅ 测试通过后进入下一步

3. **Phase 3: 洗牌动效**（依赖布局）
   - 基于网格实现洗牌
   - ✅ 测试通过后进入下一步

4. **Phase 4: 测试优化**（收尾）
   - 完整测试
   - 微调细节

---

## ⚠️ 注意事项

### 1. 打字效果性能
- 使用 `setTimeout` 而不是 `setInterval`
- 组件卸载时清理 timer
- 避免内存泄漏

### 2. 洗牌时避免卡片飞出屏幕
- 限制随机范围（±100px）
- 确保容器有足够空间

### 3. Layout 动画冲突
- 不要同时使用 `layout` 和手动 `animate`
- 洗牌时禁用 `layout`，结束后启用

### 4. 响应式测试
- 测试不同屏幕尺寸
- 确保移动端也能正常显示

---

**修复计划已完成！准备开始实施！** 🚀

遵循原则：
- ✅ 小步快跑
- ✅ 每步测试
- ✅ 及时更新 TODO
- ✅ 严格遵循 design_system.md


